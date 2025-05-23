import { create } from 'zustand';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: string;
  hasImage?: boolean;
  imageUrl?: string;
  diagnosisResult?: {
    disease: string;
    confidence: number;
    treatment: string;
  };
}

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  addMessage: (message: Message) => void;
  setLoading: (isLoading: boolean) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isLoading: false,
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setLoading: (isLoading) => set({ isLoading }),
  clearMessages: () => set({ messages: [] }),
}));