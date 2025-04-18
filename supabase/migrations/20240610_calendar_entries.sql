-- Create the calendar entries table
CREATE TABLE IF NOT EXISTS public.calendar_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('work', 'personal')),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('pending', 'completed', 'cancelled')),
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT, -- e.g., 'daily', 'weekly', 'monthly', 'yearly'
  has_reminder BOOLEAN DEFAULT false,
  reminder_days_before INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Add a check constraint to ensure reminder_days_before is between 0 and 30
  CONSTRAINT reminder_days_before_check 
    CHECK (reminder_days_before IS NULL OR (reminder_days_before >= 0 AND reminder_days_before <= 30)),
  
  -- Add a check constraint to ensure reminder_days_before is set when has_reminder is true
  CONSTRAINT reminder_days_before_required 
    CHECK (NOT has_reminder OR reminder_days_before IS NOT NULL)
);

-- Set up RLS (Row Level Security)
ALTER TABLE public.calendar_entries ENABLE ROW LEVEL SECURITY;

-- Create policy for users to only see their own calendar entries
CREATE POLICY calendar_entries_select_policy ON public.calendar_entries
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy for users to insert their own calendar entries
CREATE POLICY calendar_entries_insert_policy ON public.calendar_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own calendar entries
CREATE POLICY calendar_entries_update_policy ON public.calendar_entries
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy for users to delete their own calendar entries
CREATE POLICY calendar_entries_delete_policy ON public.calendar_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_calendar_entries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_calendar_entries_updated_at
  BEFORE UPDATE ON public.calendar_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_calendar_entries_updated_at();

-- Create index for faster queries
CREATE INDEX calendar_entries_user_id_date_idx ON public.calendar_entries (user_id, date); 