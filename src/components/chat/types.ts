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
  name?: string;
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
  runId?: string;
  status?: 'queued' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
}

export interface RunStatus {
  id: string;
  status: 'queued' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  response?: string;
}
