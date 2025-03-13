-- Create a table to store chat sessions
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assistant_id TEXT NOT NULL,
  thread_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  assistant_name TEXT,
  assistant_model TEXT
);

-- Create an index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS chat_sessions_user_id_idx ON chat_sessions(user_id);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_chat_sessions_updated_at
BEFORE UPDATE ON chat_sessions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

-- Allow users to see only their own chat sessions
CREATE POLICY "Users can view their own chat sessions"
  ON chat_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own chat sessions
CREATE POLICY "Users can insert their own chat sessions"
  ON chat_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own chat sessions
CREATE POLICY "Users can update their own chat sessions"
  ON chat_sessions
  FOR UPDATE
  USING (auth.uid() = user_id);
