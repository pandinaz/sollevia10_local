
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
 * Reads an SSE (Server-Sent Events) stream and invokes the callback with
 * each text delta. Returns the full accumulated text.
 */
async function consumeSSEStream(
  body: ReadableStream<Uint8Array>,
  onStreamUpdate: (textDelta: string, audioDelta: string) => void
): Promise<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder('utf-8');
  let fullText = '';
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // SSE events are separated by double newlines
      const parts = buffer.split('\n\n');
      buffer = parts.pop() || '';

      for (const part of parts) {
        for (const line of part.split('\n')) {
          if (!line || line.startsWith(':')) continue;

          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data.trim() === '[DONE]') return fullText;

            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                fullText += delta;
                onStreamUpdate(delta, '');
              }
            } catch {
              // Non-JSON data line — treat as plain text
              const trimmed = data.trim();
              if (trimmed) {
                fullText += trimmed;
                onStreamUpdate(trimmed, '');
              }
            }
          }
        }
      }
    }

    // Flush remaining buffer
    if (buffer.trim()) {
      for (const line of buffer.split('\n')) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data.trim() === '[DONE]') break;
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              fullText += delta;
              onStreamUpdate(delta, '');
            }
          } catch { /* ignore trailing parse errors */ }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return fullText;
}

/**
 * Sends a message to the Mia21 API.
 * Uses SSE streaming when onStreamUpdate is provided and the API supports it.
 * Falls back to mock data if no API Key is provided or if the request fails.
 */
export const sendMessageToMia = async (
  message: string,
  enableVoice: boolean,
  onStreamUpdate?: (textDelta: string, audioDelta: string) => void,
  agentConfig?: AgentConfig
): Promise<ChatResponse> => {

  // 1. Fallback to Mock if no API Key is configured
  console.log('[Mia] sendMessageToMia called', { message: message.substring(0, 50), hasApiKey: !!MIA_API_KEY, apiUrl: MIA_API_URL, botId: agentConfig?.botId || MIA_BOT_ID, spaceId: agentConfig?.spaceId || MIA_SPACE_ID });
  if (!MIA_API_KEY) {
    console.log("[Mia] No MIA_API_KEY found, using mock response.");
    const text = await generateMockResponse([]);
    // Simulate streaming for the UI
    if (onStreamUpdate) {
        const words = text.split(/(\s+)/);
        for (let i = 0; i < words.length; i += 2) {
            const chunk = words.slice(i, i + 2).join('');
            if (chunk) {
                onStreamUpdate(chunk, '');
                await new Promise(r => setTimeout(r, 30));
            }
        }
    }
    return { text, source: 'mock', error: 'Missing API Key' };
  }

  const wantStreaming = !!onStreamUpdate;

  const performChatRequest = async () => {
    const bodyPayload: Record<string, unknown> = {
        messages: [
          { role: 'user', content: message }
        ],
        space_id: agentConfig?.spaceId || MIA_SPACE_ID,
        bot_id: agentConfig?.botId || MIA_BOT_ID,
        user_id: agentConfig?.userId || getUserId()
    };
    if (wantStreaming) {
        bodyPayload.stream = true;
    }
    return fetch(MIA_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-API-Key': MIA_API_KEY
        },
        body: JSON.stringify(bodyPayload)
    });
  };

  // 2. Attempt to call the Mia21 API
  try {
    let response = await performChatRequest();

    // Check for "Chat not initialized" or "Space not found" errors (API may return 404 or 400)
    console.log('[Mia] Chat response status:', response.status, 'content-type:', response.headers.get('content-type'));
    if (response.status === 404 || response.status === 400) {
        const errorText = await response.text();
        console.log(`[Mia] ${response.status} response body:`, errorText);

        const needsInit = errorText.includes("Chat not initialized")
            || errorText.includes("initialize_chat")
            || errorText.includes("Space not found");

        if (needsInit) {
            console.log("[Mia] Chat needs initialization. Attempting...");
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

            console.log('[Mia] Init response status:', initResponse.status);
            if (!initResponse.ok) {
                const initError = await initResponse.text();
                console.error('[Mia] Init failed:', initError);
                throw new Error(`Initialization failed (${initResponse.status}): ${initError}`);
            }

            console.log('[Mia] Init succeeded, retrying chat...');
            // Retry the original chat request
            response = await performChatRequest();
            console.log('[Mia] Retry response status:', response.status);
        } else {
             throw new Error(`API Error ${response.status}: ${errorText}`);
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

    // --- STREAMING PATH ---
    // Use SSE streaming if we requested it AND the response isn't plain JSON
    const contentType = response.headers.get('content-type') || '';
    const isStreamResponse = wantStreaming && response.body && !contentType.includes('application/json');

    if (isStreamResponse && response.body && onStreamUpdate) {
        let accumulatedText = '';
        try {
            accumulatedText = await consumeSSEStream(response.body, onStreamUpdate);
        } catch (streamError) {
            console.warn('SSE streaming failed mid-stream:', streamError);
        }

        if (accumulatedText) {
            return { text: accumulatedText, source: 'api' };
        }
        // Stream returned nothing — fall to mock via throw
        throw new Error('SSE stream returned no content');
    }

    // --- NON-STREAMING PATH ---
    const data = await response.json();

    let textContent = '';
    if (data.choices && Array.isArray(data.choices) && data.choices[0]?.message?.content) {
       textContent = data.choices[0].message.content;
    } else {
       textContent = data.response || data.message || data.text || (typeof data === 'string' ? data : JSON.stringify(data));
    }

    if (onStreamUpdate) {
        // Simulate streaming by emitting words progressively
        const words = textContent.split(/(\s+)/);
        for (let i = 0; i < words.length; i += 2) {
            const chunk = words.slice(i, i + 2).join('');
            if (chunk) {
                onStreamUpdate(chunk, '');
                await new Promise(r => setTimeout(r, 30));
            }
        }
    }

    return { text: textContent, source: 'api' };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[Mia] Connection failed, falling back to mock:", errorMessage, error);

    // Graceful degradation
    const text = await generateMockResponse([]);
    if (onStreamUpdate) {
        const words = text.split(/(\s+)/);
        for (let i = 0; i < words.length; i += 2) {
            const chunk = words.slice(i, i + 2).join('');
            if (chunk) {
                onStreamUpdate(chunk, '');
                await new Promise(r => setTimeout(r, 30));
            }
        }
    }
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
