-- Create the calendar entries table
CREATE TABLE IF NOT EXISTS calendar_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('work', 'personal')),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('pending', 'completed', 'cancelled')),
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT, -- e.g., 'daily', 'weekly', 'monthly', 'yearly', etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Set up RLS (Row Level Security)
ALTER TABLE calendar_entries ENABLE ROW LEVEL SECURITY;

-- Create policy for users to only see their own calendar entries
CREATE POLICY calendar_entries_select_policy ON calendar_entries
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy for users to insert their own calendar entries
CREATE POLICY calendar_entries_insert_policy ON calendar_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own calendar entries
CREATE POLICY calendar_entries_update_policy ON calendar_entries
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy for users to delete their own calendar entries
CREATE POLICY calendar_entries_delete_policy ON calendar_entries
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
BEFORE UPDATE ON calendar_entries
FOR EACH ROW
EXECUTE FUNCTION update_calendar_entries_updated_at();

-- Create index for faster queries
CREATE INDEX calendar_entries_user_id_date_idx ON calendar_entries (user_id, date); 