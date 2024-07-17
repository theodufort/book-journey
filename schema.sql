-- Drop existing tables if they exist
DROP TABLE IF EXISTS point_transactions;
DROP TABLE IF EXISTS user_points;
DROP TABLE IF EXISTS reading_stats;
DROP TABLE IF EXISTS user_preferences;
DROP TABLE IF EXISTS reading_list;
DROP TABLE IF EXISTS books;

-- Drop existing functions and triggers
DROP TRIGGER IF EXISTS update_user_points ON point_transactions;
DROP FUNCTION IF EXISTS update_user_points();
DROP TRIGGER IF EXISTS update_reading_list_modtime ON reading_list;
DROP TRIGGER IF EXISTS update_user_preferences_modtime ON user_preferences;
DROP TRIGGER IF EXISTS update_reading_stats_modtime ON reading_stats;
DROP TRIGGER IF EXISTS update_user_points_modtime ON user_points;
DROP TRIGGER IF EXISTS update_user_activity_modtime ON user_activity;
DROP FUNCTION IF EXISTS update_modified_column();

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (auth.users) is created automatically by Supabase Auth

-- Reading List table
CREATE TABLE reading_list (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    book_id TEXT,
    status TEXT NOT NULL CHECK (status IN ('To Read', 'Reading', 'Finished')),
    rating FLOAT,
    review TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, book_id)
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

-- User Points table
CREATE TABLE user_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    points INTEGER DEFAULT 0,
    points_earned INTEGER DEFAULT 0,
    points_redeemed INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Point Transactions table
CREATE TABLE point_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    points INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('earned', 'redeemed')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Function to update 'updated_at' column
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';
CREATE OR REPLACE FUNCTION update_user_points()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.type = 'earned' THEN
        INSERT INTO user_points (user_id, points, points_earned)
        VALUES (NEW.user_id, NEW.points, NEW.points)
        ON CONFLICT (user_id) DO UPDATE
        SET points = user_points.points + NEW.points,
            points_earned = user_points.points_earned + NEW.points;
    ELSIF NEW.type = 'redeemed' THEN
        INSERT INTO user_points (user_id, points, points_redeemed)
        VALUES (NEW.user_id, -NEW.points, NEW.points)
        ON CONFLICT (user_id) DO UPDATE
        SET points = user_points.points - NEW.points,
            points_redeemed = user_points.points_redeemed + NEW.points;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update user points on point_transactions insert
CREATE TRIGGER update_user_points
AFTER INSERT ON point_transactions
FOR EACH ROW EXECUTE FUNCTION update_user_points();
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

CREATE TRIGGER update_user_points_modtime
BEFORE UPDATE ON user_points
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- User Activity table
CREATE TABLE user_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to update 'user_activity' table
CREATE TRIGGER update_user_activity_modtime
BEFORE UPDATE ON user_activity
FOR EACH ROW EXECUTE FUNCTION update_modified_column();
