import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { DEFAULT_WORK_DURATION, DEFAULT_BREAK_DURATION, DEFAULT_LONG_BREAK_DURATION, DEFAULT_SESSIONS_BEFORE_LONG_BREAK } from '@/constants';

export interface UserSettings {
  work_duration: number;
  break_duration: number;
  long_break_duration: number;
  sessions_before_long_break: number;
  id?: string;
  created_at?: string;
  updated_at?: string;
}

export const useSettings = () => {
  const { session } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const initialFetchDone = useRef(false);
  const settingsInitialized = useRef(false);
  const userInitiatedUpdate = useRef(false);
  const lastUpdateTime = useRef(0);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!session?.user?.id) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('id, created_at, updated_at')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;

        // If settings are found, use them, otherwise use defaults
        if (data) {
          setSettings({
            work_duration: DEFAULT_WORK_DURATION,
            break_duration: DEFAULT_BREAK_DURATION,
            long_break_duration: DEFAULT_LONG_BREAK_DURATION,
            sessions_before_long_break: DEFAULT_SESSIONS_BEFORE_LONG_BREAK,
            id: data.id,
            created_at: data.created_at,
            updated_at: data.updated_at
          });
          settingsInitialized.current = true;
        } else {
          // Set default settings
          setSettings({
            work_duration: DEFAULT_WORK_DURATION,
            break_duration: DEFAULT_BREAK_DURATION,
            long_break_duration: DEFAULT_LONG_BREAK_DURATION,
            sessions_before_long_break: DEFAULT_SESSIONS_BEFORE_LONG_BREAK
          });
          settingsInitialized.current = true;
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
        initialFetchDone.current = true;
      }
    };

    fetchSettings();
  }, [session?.user?.id]);

  const updateSettings = async (updatedSettings: Partial<UserSettings>) => {
    if (!session?.user?.id || !settings) return;

    // Add throttling - only update once every 500ms
    const now = Date.now();
    if (now - lastUpdateTime.current < 500) {
      console.debug('Throttling settings update');
      return;
    }
    lastUpdateTime.current = now;

    try {
      // Update local state without showing toast for automatic updates
      setSettings(prev => prev ? { ...prev, ...updatedSettings } : null);
      
      // Only show toast if userInitiatedUpdate.current is true
      if (userInitiatedUpdate.current) {
        toast({
          title: 'Settings updated',
          description: 'Your preferences have been saved in your local session',
        });
        // Reset the flag after showing the toast
        userInitiatedUpdate.current = false;
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      if (userInitiatedUpdate.current) {
        toast({
          title: 'Error',
          description: 'Failed to update settings',
          variant: 'destructive'
        });
        userInitiatedUpdate.current = false;
      }
    }
  };

  // Method to flag that the next update is user-initiated
  const userUpdateSettings = (updatedSettings: Partial<UserSettings>) => {
    userInitiatedUpdate.current = true;
    updateSettings(updatedSettings);
  };

  return { 
    settings, 
    loading, 
    updateSettings, 
    userUpdateSettings // Expose method for explicit user updates
  };
};
