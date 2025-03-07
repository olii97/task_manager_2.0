
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string[];
}

export interface AssistantInfo {
  model: string;
  assistantId?: string;
}

export interface FunctionCallResult {
  runId: string;
  toolCallId: string;
  name: string;
  arguments: any;
}
