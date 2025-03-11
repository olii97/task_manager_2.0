
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
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

    try {
      // Only show toast on user-initiated changes, not during initial setup
      const shouldShowToast = initialFetchDone.current && settingsInitialized.current;
      
      // Update local state
      setSettings(prev => prev ? { ...prev, ...updatedSettings } : null);
      
      // Only show toast for user-initiated changes
      if (shouldShowToast) {
        toast({
          title: 'Settings updated',
          description: 'Your preferences have been saved in your local session',
        });
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update settings',
        variant: 'destructive'
      });
    }
  };

  return { settings, loading, updateSettings };
};
