-- Create meal_entries table
CREATE TABLE meal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    meal_description TEXT NOT NULL,
    meal_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    total_calories DECIMAL(10, 2),
    total_protein DECIMAL(10, 2),
    total_carbs DECIMAL(10, 2),
    total_fat DECIMAL(10, 2),
    total_fiber DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create nutrition_items table
CREATE TABLE nutrition_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meal_entry_id UUID REFERENCES meal_entries(id) ON DELETE CASCADE,
    food_item TEXT NOT NULL,
    calories DECIMAL(10, 2),
    protein DECIMAL(10, 2),
    carbs DECIMAL(10, 2),
    fat DECIMAL(10, 2),
    fiber DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for meal_entries
CREATE TRIGGER update_meal_entries_updated_at
    BEFORE UPDATE ON meal_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE meal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_items ENABLE ROW LEVEL SECURITY;

-- Create policies for meal_entries
CREATE POLICY "Users can view their own meal entries"
    ON meal_entries FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meal entries"
    ON meal_entries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meal entries"
    ON meal_entries FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meal entries"
    ON meal_entries FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for nutrition_items
CREATE POLICY "Users can view nutrition items for their meals"
    ON nutrition_items FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM meal_entries
        WHERE meal_entries.id = nutrition_items.meal_entry_id
        AND meal_entries.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert nutrition items for their meals"
    ON nutrition_items FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM meal_entries
        WHERE meal_entries.id = nutrition_items.meal_entry_id
        AND meal_entries.user_id = auth.uid()
    ));

CREATE POLICY "Users can update nutrition items for their meals"
    ON nutrition_items FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM meal_entries
        WHERE meal_entries.id = nutrition_items.meal_entry_id
        AND meal_entries.user_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM meal_entries
        WHERE meal_entries.id = nutrition_items.meal_entry_id
        AND meal_entries.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete nutrition items for their meals"
    ON nutrition_items FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM meal_entries
        WHERE meal_entries.id = nutrition_items.meal_entry_id
        AND meal_entries.user_id = auth.uid()
    )); 