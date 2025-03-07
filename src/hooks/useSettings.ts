
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

interface UserSettings {
  work_duration: number;
  break_duration: number;
  long_break_duration: number;
  sessions_before_long_break: number;
}

export const useSettings = () => {
  const { session } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    if (!session?.user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Check if the user has settings in the profiles table
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) {
        throw error;
      }

      // Set default values or use existing ones
      const userSettings: UserSettings = {
        work_duration: data.work_duration || 25,
        break_duration: data.break_duration || 5,
        long_break_duration: data.long_break_duration || 15,
        sessions_before_long_break: data.sessions_before_long_break || 4
      };

      setSettings(userSettings);
    } catch (err: any) {
      console.error("Error fetching settings:", err);
      setError("Failed to load user settings");
      
      // Set default values if there's an error
      setSettings({
        work_duration: 25,
        break_duration: 5,
        long_break_duration: 15,
        sessions_before_long_break: 4
      });
    } finally {
      setLoading(false);
    }
  }, [session]);

  const updateSettings = useCallback(async (newSettings: Partial<UserSettings>) => {
    if (!session?.user) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update(newSettings)
        .eq("id", session.user.id);

      if (error) {
        throw error;
      }

      // Update local state
      setSettings(prev => prev ? { ...prev, ...newSettings } : null);
    } catch (err: any) {
      console.error("Error updating settings:", err);
      setError("Failed to update settings");
    }
  }, [session]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    error,
    updateSettings,
    refetchSettings: fetchSettings
  };
};
