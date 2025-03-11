/**
 * Result returned by a listener after processing a message
 */
export interface ListenerResult {
  /** Whether the listener detected an action to take */
  actionDetected: boolean;
  
  /** Type of action detected (e.g., 'task_created', 'reminder_set') */
  actionType: string;
  
  /** Additional data related to the action */
  data?: any;
}

/**
 * Interface for specialized message listeners
 */
export interface MessageListener {
  /** Process a message and determine if an action should be taken */
  process(message: string): Promise<ListenerResult>;
} 