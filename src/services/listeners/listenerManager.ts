import { ListenerResult, MessageListener } from './types';

/**
 * Manages a collection of specialized message listeners and processes messages through them
 */
export class ListenerManager {
  private listeners: MessageListener[] = [];
  private userId: string;

  /**
   * Create a new ListenerManager for a user
   * @param userId The ID of the current user
   */
  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Add a listener to the manager
   * @param listener The message listener to add
   */
  addListener(listener: MessageListener): void {
    this.listeners.push(listener);
  }

  /**
   * Process a message through all registered listeners
   * @param message The message to process
   * @returns Array of results from listeners that detected actions
   */
  async processMessage(message: string): Promise<Array<ListenerResult>> {
    console.log(`Processing message through ${this.listeners.length} listeners`);
    
    // Process message through all listeners in parallel
    const promises = this.listeners.map(listener => listener.process(message));
    const results = await Promise.allSettled(promises);
    
    // Filter for successful results that detected actions
    const actionResults = results
      .filter(result => 
        result.status === 'fulfilled' && 
        (result as PromiseFulfilledResult<ListenerResult>).value.actionDetected
      )
      .map(result => (result as PromiseFulfilledResult<ListenerResult>).value);
    
    console.log(`Found ${actionResults.length} actions from listeners`);
    return actionResults;
  }

  /**
   * Get the current user ID
   */
  getUserId(): string {
    return this.userId;
  }
} 