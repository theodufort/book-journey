-- Create the schema for the reading recommendation system
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS public;

-- Users table in the 'auth' schema
CREATE TABLE IF NOT EXISTS auth.users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reading list table in the 'public' schema
CREATE TABLE public.reading_list (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    book_id VARCHAR(20) NOT NULL, -- ISBN or other identifier for books
    status VARCHAR(50) CHECK (status IN ('To Read', 'Reading', 'Finished')),
    rating NUMERIC(3, 1),
    review TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User preferences table in the 'public' schema
CREATE TABLE public.user_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id),
    preferred_categories TEXT[], -- Array of categories
    username VARCHAR(50) UNIQUE,
    bio TEXT,
    profile_picture_url TEXT
);

-- Friends table in the 'public' schema
CREATE TABLE public.friends (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    friend_id UUID REFERENCES auth.users(id),
    status VARCHAR(20) CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, friend_id)
);

-- Reading stats table in the 'public' schema
CREATE TABLE public.reading_stats (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id),
    books_read INT,
    pages_read INT,
    reading_time_minutes INT
);

-- User points table in the 'public' schema
CREATE TABLE public.user_points (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id),
    points INT,
    points_earned INT,
    points_redeemed INT
);

-- Point transactions table in the 'public' schema
CREATE TABLE public.point_transactions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    points INT,
    type VARCHAR(50) CHECK (type IN ('earned', 'redeemed')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User activity table in the 'public' schema
CREATE TABLE public.user_activity (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    activity_type VARCHAR(50) CHECK (activity_type IN ('book_started', 'book_finished', 'points_earned')),
    details JSONB, -- Storing detailed information as JSONB for flexibility
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to update 'user_activity' table
CREATE TRIGGER update_user_activity_modtime
BEFORE UPDATE ON user_activity
FOR EACH ROW EXECUTE FUNCTION update_modified_column();


