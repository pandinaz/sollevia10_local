
import { MIA_API_KEY, MIA_SPACE_ID, MIA_BOT_ID, MIA_API_URL, MIA_INIT_URL } from '../config';
import { generateMockResponse } from './mockAi';
import { ChatMessage } from '../types';
import { getUserId } from './userData';

export interface ChatResponse {
  text: string;
  audio?: string;
  source: 'api' | 'mock';
  error?: string;
}

export interface AgentConfig {
  botId?: string;
  spaceId?: string;
  systemInstruction?: string;
  userId?: string;
}

/**
 * Sends a message to the Mia21 API.
 * Falls back to mock data if no API Key is provided or if the request fails.
 */
export const sendMessageToMia = async (
  message: string,
  enableVoice: boolean,
  onStreamUpdate?: (textDelta: string, audioDelta: string) => void,
  agentConfig?: AgentConfig
): Promise<ChatResponse> => {
  
  // 1. Fallback to Mock if no API Key is configured
  if (!MIA_API_KEY) {
    console.log("No MIA_API_KEY found, using mock response.");
    const text = await generateMockResponse([]);
    // Simulate streaming for the UI
    if (onStreamUpdate) {
        const chunks = text.match(/.{1,5}/g) || [text];
        for (const chunk of chunks) {
            await new Promise(r => setTimeout(r, 50));
            onStreamUpdate(chunk, "");
        }
    }
    return { text, source: 'mock', error: 'Missing API Key' };
  }

  const performChatRequest = async () => {
    return fetch(MIA_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-API-Key': MIA_API_KEY
        },
        body: JSON.stringify({
            messages: [
              { role: 'user', content: message }
            ],
            space_id: agentConfig?.spaceId || MIA_SPACE_ID,
            bot_id: agentConfig?.botId || MIA_BOT_ID,
            user_id: agentConfig?.userId || getUserId()
        })
    });
  };

  // 2. Attempt to call the Mia21 API
  try {
    let response = await performChatRequest();

    // Check for "Chat not initialized" error
    if (response.status === 404) {
        // Clone response to read text without consuming the original body if we need to return it later
        const errorText = await response.text();
        
        if (errorText.includes("Chat not initialized")) {
            console.log("Chat not initialized. Attempting initialization...");
            // Auto-initialize
            const initResponse = await fetch(MIA_INIT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': MIA_API_KEY
                },
                body: JSON.stringify({
                    space_id: agentConfig?.spaceId || MIA_SPACE_ID,
                    bot_id: agentConfig?.botId || MIA_BOT_ID,
                    user_id: agentConfig?.userId || getUserId()
                })
            });

            if (!initResponse.ok) {
                const initError = await initResponse.text();
                throw new Error(`Initialization failed (${initResponse.status}): ${initError}`);
            }

            // Retry the original chat request
            response = await performChatRequest();
        } else {
             // It was a real 404, throw it
             throw new Error(`API Error 404: ${errorText}`);
        }
    }

    if (!response.ok) {
        let errorBody;
        try {
            errorBody = await response.text();
        } catch (e) {
            errorBody = response.statusText;
        }
        throw new Error(`API Error ${response.status}: ${errorBody}`);
    }

    const data = await response.json();
    
    // Extract text content from likely response fields
    // We try OpenAI format first, then custom Mia fields
    let textContent = '';
    
    if (data.choices && Array.isArray(data.choices) && data.choices[0]?.message?.content) {
       textContent = data.choices[0].message.content;
    } else {
       textContent = data.response || data.message || data.text || (typeof data === 'string' ? data : JSON.stringify(data));
    }
    
    // Pass the full response to the updater
    if (onStreamUpdate) {
        onStreamUpdate(textContent, "");
    }

    return { text: textContent, source: 'api' };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Mia21 Connection failed, falling back to mock:", errorMessage);
    
    // Graceful degradation
    const text = await generateMockResponse([]);
    if (onStreamUpdate) onStreamUpdate(text, "");
    return { text, source: 'mock', error: errorMessage };
  }
};

export interface SummaryResult {
  title: string;
  summary: string;
  themes: string[];
  emotions: string[];
  actions: string[];
}

export const generateMiaSummary = async (transcript: ChatMessage[]): Promise<SummaryResult | null> => {
  const conversation = transcript
    .map(m => `${m.sender.toUpperCase()}: ${m.text}`)
    .join('\n');
  
  const prompt = `
  Analyze the following conversation history between a USER and a BOT (pain management coach).
  
  CONVERSATION:
  ${conversation}
  
  TASK:
  Provide a structured summary in strict JSON format. Do not add markdown formatting, code blocks, or extra text. Just the JSON string.
  IMPORTANT: Address the USER directly using "you" (e.g., "You mentioned...", "You are feeling..."). Do not refer to them as "the user" or "the patient".

  The JSON object must have these exact keys:
  - "title": A short, 3-5 word title capturing the essence.
  - "summary": A 2-3 sentence narrative summary of the situation and advice given, addressing the user directly as "you".
  - "themes": An array of strings (e.g., "Stress", "Sleep").
  - "emotions": An array of strings (e.g., "Frustrated", "Hopeful").
  - "actions": An array of 2-3 specific, actionable suggestions based on the chat.

  JSON:
  `;

  // Use a temporary user ID to avoid polluting the main chat history context
  const tempUserId = `summary_bot_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

  try {
      const response = await sendMessageToMia(prompt, false, undefined, { userId: tempUserId });

      if (response.source === 'mock' || !response.text) {
          return null;
      }

      const text = response.text;
      // Attempt to clean markdown if present
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const json = JSON.parse(cleanText);
      
      // Basic validation
      if (json.title && json.summary) {
          return {
              title: json.title,
              summary: json.summary,
              themes: Array.isArray(json.themes) ? json.themes : [],
              emotions: Array.isArray(json.emotions) ? json.emotions : [],
              actions: Array.isArray(json.actions) ? json.actions : []
          };
      }
      return null;
  } catch (error) {
      console.warn("Failed to generate summary with Mia:", error);
      return null;
  }
};
