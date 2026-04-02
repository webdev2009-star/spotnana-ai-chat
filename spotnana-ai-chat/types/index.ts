export type MessageRole = "user" | "assistant" | "error";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  messages: Message[];
  createdAt: number;
  title: string;
}
