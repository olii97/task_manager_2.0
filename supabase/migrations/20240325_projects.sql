-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add RLS policies for projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see only their own projects
CREATE POLICY "Users can view their own projects" 
  ON projects 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy for users to insert their own projects
CREATE POLICY "Users can insert their own projects" 
  ON projects 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own projects
CREATE POLICY "Users can update their own projects" 
  ON projects 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy for users to delete their own projects
CREATE POLICY "Users can delete their own projects" 
  ON projects 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add project_id column to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL;

-- Create index for faster project-based task queries
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);

-- Update the updated_at column for both tables to auto-update
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Only create the trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_projects_updated_at'
  ) THEN
    CREATE TRIGGER set_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();
  END IF;
END $$; 