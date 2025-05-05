import React, { createContext, useContext, useState, useEffect } from 'react';

interface TickerMessage {
  id: string;
  text: string;
  timestamp: number;
}

interface TaskTickerContextType {
  messages: TickerMessage[];
  addMessage: (text: string) => void;
  clearMessages: () => void;
}

const TaskTickerContext = createContext<TaskTickerContextType>({
  messages: [],
  addMessage: () => {},
  clearMessages: () => {},
});

export const useTaskTicker = () => useContext(TaskTickerContext);

export const TaskTickerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with default welcome messages
  const [messages, setMessages] = useState<TickerMessage[]>([
    {
      id: 'welcome-1',
      text: 'WELCOME TO YOUR TASK MANAGER',
      timestamp: Date.now(),
    },
    {
      id: 'welcome-2',
      text: 'ADD TASKS TO GET STARTED',
      timestamp: Date.now(),
    },
    {
      id: 'welcome-3',
      text: 'COMPLETED TASKS WILL APPEAR HERE',
      timestamp: Date.now(),
    }
  ]);

  // Function to add a message to the ticker
  const addMessage = (text: string) => {
    const newMessage: TickerMessage = {
      id: Date.now().toString(),
      text: text.toUpperCase(), // Convert to uppercase
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, newMessage]);
  };

  // Clear all messages
  const clearMessages = () => {
    setMessages([]);
  };

  // Clean up old messages that are more than 30 minutes old
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
      setMessages(prev => prev.filter(msg => msg.timestamp > thirtyMinutesAgo));
    }, 60000); // Check every minute

    return () => clearInterval(cleanupInterval);
  }, []);

  // Expose the addMessage function to the window object
  useEffect(() => {
    // Define the global function to add messages
    window.addTickerMessage = addMessage;

    // Clean up on unmount
    return () => {
      delete window.addTickerMessage;
    };
  }, []);

  return (
    <TaskTickerContext.Provider value={{ messages, addMessage, clearMessages }}>
      {children}
    </TaskTickerContext.Provider>
  );
}; 