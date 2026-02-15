import { ChatMessage } from '../types';

const RESPONSES = [
  "I hear you. Can you tell me more about how that makes you feel?",
  "That sounds challenging. How does that sensation affect your day?",
  "It's understandable to feel that way given what you're going through.",
  "Let's take a deep breath together. What is one small thing you can do for yourself right now?",
  "Thank you for sharing that with me. Have you noticed any patterns when this happens?",
  "You're doing a great job simply by being aware of these feelings.",
  "How does the tension in your body change when you talk about this?",
];

export const generateMockResponse = (history: ChatMessage[]): Promise<string> => {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      const randomResponse = RESPONSES[Math.floor(Math.random() * RESPONSES.length)];
      resolve(randomResponse);
    }, 1500 + Math.random() * 1000);
  });
};
