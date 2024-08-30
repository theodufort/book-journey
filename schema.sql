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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "pointsAwardedFinished" boolean not null default false,
    "pointsAwardedRating" boolean not null default false,
    "pointsAwardedTextReview" boolean not null default false,
);

-- User preferences table in the 'public' schema
CREATE TABLE public.user_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id),
    preferred_categories TEXT[], -- Array of categories
    username VARCHAR(50) UNIQUE,
    bio TEXT,
    profile_picture_url TEXT,
    onboarded boolean not null default false
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
    pages_read INT,
    reading_time_minutes INT
);

-- User points table in the 'public' schema
CREATE TABLE public.user_points (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id),
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



create table
  public.user_activity (
    id serial not null,
    user_id uuid null,
    activity_type character varying(50) null,
    details jsonb null,
    created_at timestamp with time zone null default current_timestamp,
    updated_at timestamp with time zone null default current_timestamp,
    constraint user_activity_pkey primary key (id),
    constraint user_activity_user_id_fkey foreign key (user_id) references auth.users (id),
    constraint user_activity_activity_type_check check (
      (
        (activity_type)::text = any (
          array[
            ('book_added'::character varying)::text,
            ('book_started'::character varying)::text,
            ('book_finished'::character varying)::text,
            ('points_earned'::character varying)::text
          ]
        )
      )
    )
  ) tablespace pg_default;

create trigger update_user_activity_modtime before
update on user_activity for each row
execute function update_modified_column ();


CREATE OR REPLACE FUNCTION public.get_user_metadata(user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    user_meta JSON;
BEGIN
    SELECT json_build_object(
        'id', u.id,
        'email', u.email,
        'phone', u.phone,
        'role', u.role,
        'last_sign_in_at', u.last_sign_in_at,
        'created_at', u.created_at,
        'updated_at', u.updated_at,
        'confirmed_at', u.confirmed_at,
        'is_super_admin', u.is_super_admin,
        'is_sso_user', u.is_sso_user,
        'is_anonymous', u.is_anonymous,
        'raw_app_meta_data', u.raw_app_meta_data,
        'raw_user_meta_data', u.raw_user_meta_data
    ) INTO user_meta
    FROM auth.users u
    WHERE u.id = user_id;

    IF user_meta IS NULL THEN
        RETURN json_build_object('error', 'User not found');
    END IF;

    RETURN user_meta;
END;
$$;

-- Function to update reading stats
CREATE OR REPLACE FUNCTION public.update_reading_stats(
    p_user_id UUID,
    p_books_read INT,
    p_pages_read INT,
    p_reading_time_minutes INT DEFAULT 0
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.reading_stats (user_id, books_read, pages_read, reading_time_minutes)
    VALUES (p_user_id, p_books_read, p_pages_read, p_reading_time_minutes)
    ON CONFLICT (user_id)
    DO UPDATE SET
        books_read = public.reading_stats.books_read + p_books_read,
        pages_read = public.reading_stats.pages_read + p_pages_read,
        reading_time_minutes = public.reading_stats.reading_time_minutes + p_reading_time_minutes;
END;
$$;

create table
  public.books (
    isbn_13 text not null,
    data jsonb not null,
    added_at timestamp with time zone not null default now(),
    constraint books_pkey primary key (isbn_13),
    constraint books_isbn_13_key unique (isbn_13)
  ) tablespace pg_default;

-- Function to check if a book exists and return its data
CREATE OR REPLACE FUNCTION public.check_book_exists(p_isbn_13 TEXT)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT data INTO v_result
    FROM public.books
    WHERE isbn_13 = p_isbn_13;

    IF v_result IS NULL THEN
        RETURN '[]'::JSONB;
    ELSE
        RETURN v_result;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION auth.insert_user_related_records()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert into public.user_points
    INSERT INTO public.user_points (user_id, points_earned, points_redeemed)
    VALUES (NEW.id, 0,0);

    -- Insert into public.reading_stats
    INSERT INTO public.reading_stats (user_id, books_read, pages_read,reading_time_minutes)
    VALUES (NEW.id, 0, 0,0);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.increment_points_earned(
    _user_id UUID, 
    _points_to_add INT
)
RETURNS VOID AS $$
BEGIN
    UPDATE public.user_points
    SET points_earned = points_earned + _points_to_add
    WHERE user_id = _user_id;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE public.book_notes (
     id SERIAL PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id),
     book_id VARCHAR(20) NOT NULL,
     notes TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
     UNIQUE(user_id, book_id)
 );