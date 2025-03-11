import { useState, useEffect } from 'react';
import { ListenerManager } from '../services/listeners/listenerManager';
import { createTaskListener } from '../services/listeners/taskListener';
import { ListenerResult } from '../services/listeners/types';

// Create a key for localStorage to remember user preference
const LISTENERS_ENABLED_KEY = 'rnc_listeners_enabled';

/**
 * Hook to use the message listener manager
 * @param userId The ID of the current user
 * @returns Object with the listener manager and methods to process messages
 */
export function useListenerManager(userId: string | null) {
  const [manager, setManager] = useState<ListenerManager | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isEnabled, setIsEnabled] = useState<boolean>(() => {
    // Initialize from localStorage, default to true if not set
    const savedPreference = localStorage.getItem(LISTENERS_ENABLED_KEY);
    return savedPreference !== null ? savedPreference === 'true' : true;
  });

  // Save preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(LISTENERS_ENABLED_KEY, isEnabled.toString());
  }, [isEnabled]);

  // Initialize the listener manager when userId is available
  useEffect(() => {
    if (!userId) {
      return;
    }

    const initializeManager = () => {
      console.log('Initializing listener manager for user:', userId);
      
      // Create a new manager
      const newManager = new ListenerManager(userId);
      
      // Add listeners
      newManager.addListener(createTaskListener(userId));
      // Add more listeners here as needed
      
      setManager(newManager);
      setIsInitialized(true);
      
      console.log('Listener manager initialized successfully');
    };

    initializeManager();
  }, [userId]);

  /**
   * Process a message through all listeners
   * @param message The message to process
   * @returns Array of results from listeners that detected actions
   */
  const processMessage = async (message: string): Promise<ListenerResult[]> => {
    // Skip processing if listeners are disabled
    if (!isEnabled) {
      console.log('Listeners are disabled. Skipping message processing.');
      return [];
    }
    
    if (!manager) {
      console.warn('Listener manager not initialized. Message not processed.');
      return [];
    }
    
    return await manager.processMessage(message);
  };

  /**
   * Toggle whether listeners are enabled
   */
  const toggleListeners = () => {
    setIsEnabled(prev => !prev);
  };

  return {
    manager,
    isInitialized,
    isEnabled,
    toggleListeners,
    processMessage
  };
} 