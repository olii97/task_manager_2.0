-- Create the morning rituals table
CREATE TABLE public.morning_rituals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gratitude_items TEXT[] NOT NULL DEFAULT '{}',
  intentions TEXT[] NOT NULL DEFAULT '{}',
  journal_entry TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Add a unique constraint for one entry per user per day
  UNIQUE(user_id, date)
);

-- Set up RLS policies
ALTER TABLE public.morning_rituals ENABLE ROW LEVEL SECURITY;

-- Create policies (only the user who created the entry can see and modify it)
CREATE POLICY "Users can view their own morning rituals"
  ON public.morning_rituals
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own morning rituals"
  ON public.morning_rituals
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own morning rituals"
  ON public.morning_rituals
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own morning rituals"
  ON public.morning_rituals
  FOR DELETE
  USING (auth.uid() = user_id); 