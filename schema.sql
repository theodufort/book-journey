-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Reading List table
CREATE TABLE reading_list (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    book_isbn TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('To Read', 'Reading', 'Finished')),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, book_isbn)
);

-- User Preferences table
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    preferred_categories TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Reading Stats table
CREATE TABLE reading_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    books_read INTEGER DEFAULT 0,
    pages_read INTEGER DEFAULT 0,
    reading_time_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Function to update 'updated_at' column
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update 'updated_at' column
CREATE TRIGGER update_reading_list_modtime
BEFORE UPDATE ON reading_list
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_user_preferences_modtime
BEFORE UPDATE ON user_preferences
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_reading_stats_modtime
BEFORE UPDATE ON reading_stats
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Enable RLS on the reading_list table
ALTER TABLE reading_list ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to see only their own reading list
CREATE POLICY "Users can view their own reading list" ON reading_list FOR SELECT
  USING (auth.uid() = user_id);

-- Create a policy that allows users to insert only into their own reading list
CREATE POLICY "Users can insert into their own reading list" ON reading_list FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create a policy that allows users to update only their own reading list entries
CREATE POLICY "Users can update their own reading list entries" ON reading_list FOR UPDATE
  USING (auth.uid() = user_id);

-- Create a policy that allows users to delete only from their own reading list
CREATE POLICY "Users can delete from their own reading list" ON reading_list FOR DELETE
  USING (auth.uid() = user_id);

  -- Enable RLS on the user_preferences table
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for user_preferences table
CREATE POLICY "Users can view their own preferences" ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences" ON user_preferences FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS on the reading_stats table
ALTER TABLE reading_stats ENABLE ROW LEVEL SECURITY;

-- Create policies for reading_stats table
CREATE POLICY "Users can view their own reading stats" ON reading_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reading stats" ON reading_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reading stats" ON reading_stats FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reading stats" ON reading_stats FOR DELETE
  USING (auth.uid() = user_id);