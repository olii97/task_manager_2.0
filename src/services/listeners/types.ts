
// Define types for the message listener system

export interface ListenerResult {
  actionDetected: boolean;
  actionType: string;
  data?: any;
}

export interface MessageListener {
  process(message: string): Promise<ListenerResult>;
}
