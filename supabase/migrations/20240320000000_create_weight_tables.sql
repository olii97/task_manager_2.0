-- Create weight_entries table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'weight_entries') THEN
        CREATE TABLE weight_entries (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            date DATE NOT NULL,
            weight DECIMAL(5,2) NOT NULL,
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
            UNIQUE(user_id, date)
        );
    END IF;
END $$;

-- Create weight_goals table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'weight_goals') THEN
        CREATE TABLE weight_goals (
            user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            start_date DATE NOT NULL,
            start_weight DECIMAL(5,2) NOT NULL,
            target_weight DECIMAL(5,2) NOT NULL,
            target_date DATE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );
    END IF;
END $$;

-- Create RLS policies for weight_entries if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'weight_entries') THEN
        ALTER TABLE weight_entries ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Users can view their own weight entries"
            ON weight_entries FOR SELECT
            USING (auth.uid() = user_id);

        CREATE POLICY "Users can insert their own weight entries"
            ON weight_entries FOR INSERT
            WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Users can update their own weight entries"
            ON weight_entries FOR UPDATE
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Users can delete their own weight entries"
            ON weight_entries FOR DELETE
            USING (auth.uid() = user_id);
    END IF;
END $$;

-- Create RLS policies for weight_goals if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'weight_goals') THEN
        ALTER TABLE weight_goals ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Users can view their own weight goals"
            ON weight_goals FOR SELECT
            USING (auth.uid() = user_id);

        CREATE POLICY "Users can insert their own weight goals"
            ON weight_goals FOR INSERT
            WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Users can update their own weight goals"
            ON weight_goals FOR UPDATE
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Users can delete their own weight goals"
            ON weight_goals FOR DELETE
            USING (auth.uid() = user_id);
    END IF;
END $$;

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'update_weight_entries_updated_at') THEN
        CREATE TRIGGER update_weight_entries_updated_at
            BEFORE UPDATE ON weight_entries
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'update_weight_goals_updated_at') THEN
        CREATE TRIGGER update_weight_goals_updated_at
            BEFORE UPDATE ON weight_goals
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$; 