
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AssistantInfo {
  model: string;
  assistantId?: string | null;
}

export interface FunctionCallResult {
  runId: string;
  toolCallId: string;
  name: string;
  arguments: any;
}

// New types for chatService
export interface ChatThreadResponse {
  threadId?: string;
  model?: string;
  assistantId?: string;
  response?: string;
  messages?: ChatMessage[];
  functionCall?: FunctionCallResult;
}
