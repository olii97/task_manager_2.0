
import { Database } from "@/integrations/supabase/types";

export type WeeklyIntention = {
  id: string;
  user_id: string;
  week_start: string;
  intention_1: string | null;
  intention_2: string | null;
  intention_3: string | null;
  reflection_1: string | null;
  reflection_2: string | null;
  reflection_3: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type WeeklyIntentionFormData = {
  intention_1: string;
  intention_2: string;
  intention_3: string;
};

export type WeeklyReflectionFormData = {
  reflection_1: string;
  reflection_2: string;
  reflection_3: string;
};

export function mapDatabaseIntentionToWeeklyIntention(
  dbIntention: Database["public"]["Tables"]["weekly_intentions"]["Row"]
): WeeklyIntention {
  return {
    id: dbIntention.id,
    user_id: dbIntention.user_id,
    week_start: dbIntention.week_start,
    intention_1: dbIntention.intention_1,
    intention_2: dbIntention.intention_2,
    intention_3: dbIntention.intention_3,
    reflection_1: dbIntention.reflection_1,
    reflection_2: dbIntention.reflection_2,
    reflection_3: dbIntention.reflection_3,
    status: dbIntention.status,
    created_at: dbIntention.created_at,
    updated_at: dbIntention.updated_at,
  };
}
