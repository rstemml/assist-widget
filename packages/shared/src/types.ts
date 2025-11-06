/**
 * Shared types between widget and backend
 */

export interface CustomerConfig {
  customerId: string;
  behavior: {
    autoOpen: boolean;
    autoOpenDelay: number;
    welcomeMessage: string;
    position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    enableNotifications: boolean;
    maxMessagesPerMinute: number;
    placeholder?: string;
    title?: string;
  };
  theme?: {
    primaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    borderRadius?: string;
  };
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface WebSocketMessage {
  type: 'message' | 'typing' | 'connected' | 'error' | 'config';
  payload?: any;
  sessionId?: string;
  customerId?: string;
}

export interface ChatSession {
  sessionId: string;
  customerId: string;
  messages: Message[];
  createdAt: number;
}
