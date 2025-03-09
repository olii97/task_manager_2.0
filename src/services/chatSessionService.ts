import { supabase } from '@/integrations/supabase/client';
import { AssistantInfo } from '@/components/chat/types';
import { Database } from '@/integrations/supabase/types';

export type ChatSession = Database['public']['Tables']['chat_sessions']['Row'];

/**
 * Get the active chat session for a user
 */
export const getActiveChatSession = async (userId: string): Promise<ChatSession | null> => {
  if (!userId) return null;
  
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();
  
  if (error) {
    console.error('Error getting active chat session:', error);
    return null;
  }
  
  return data as ChatSession;
};

/**
 * Create a new chat session
 */
export const createChatSession = async (
  userId: string,
  assistantId: string,
  threadId: string,
  assistantInfo: AssistantInfo | null
): Promise<ChatSession | null> => {
  if (!userId || !assistantId || !threadId) return null;
  
  const { data, error } = await supabase
    .from('chat_sessions')
    .insert({
      user_id: userId,
      assistant_id: assistantId,
      thread_id: threadId,
      assistant_name: assistantInfo?.name || 'AI Assistant',
      assistant_model: assistantInfo?.model || 'gpt-4o-mini',
      is_active: true
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating chat session:', error);
    return null;
  }
  
  return data as ChatSession;
};

/**
 * Update a chat session
 */
export const updateChatSession = async (
  sessionId: string,
  updates: Partial<ChatSession>
): Promise<ChatSession | null> => {
  if (!sessionId) return null;
  
  const { data, error } = await supabase
    .from('chat_sessions')
    .update(updates)
    .eq('id', sessionId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating chat session:', error);
    return null;
  }
  
  return data as ChatSession;
};

/**
 * Deactivate all chat sessions for a user
 */
export const deactivateAllChatSessions = async (userId: string): Promise<boolean> => {
  if (!userId) return false;
  
  const { error } = await supabase
    .from('chat_sessions')
    .update({ is_active: false })
    .eq('user_id', userId)
    .eq('is_active', true);
  
  if (error) {
    console.error('Error deactivating chat sessions:', error);
    return false;
  }
  
  return true;
}; 