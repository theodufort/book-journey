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

create table
  public.blog_articles (
    id serial not null,
    slug character varying(255) not null,
    title character varying(255) not null,
    description text null,
    content text not null,
    image_url text null,
    image_alt text null,
    isbn_13 text null,
    published_at timestamp with time zone null default now(),
    created_at timestamp with time zone null default current_timestamp,
    updated_at timestamp with time zone null default current_timestamp,
    constraint blog_articles_pkey primary key (id),
    constraint blog_articles_slug_key unique (slug),
    constraint blog_articles_isbn_13_fkey foreign key (isbn_13) references books (isbn_13)
  ) tablespace pg_default;

-- Function to get basic article info
CREATE OR REPLACE FUNCTION public.get_basic_article_info(p_slug VARCHAR(255))
RETURNS TABLE (
    id INT,
    slug VARCHAR(255),
    title VARCHAR(255),
    description TEXT,
    isbn_13 VARCHAR(13),
    image_url TEXT,
    image_alt TEXT,
    published_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id, a.slug, a.title, a.description, a.isbn_13, 
        a.image_url, a.image_alt, a.published_at
    FROM public.blog_articles a
    WHERE a.slug = p_slug;
END;
$$ LANGUAGE plpgsql;

-- Function to get full article content
CREATE OR REPLACE FUNCTION public.get_full_article_content(p_slug VARCHAR(255))
RETURNS TABLE (
    id INT,
    content TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT a.id, a.content
    FROM public.blog_articles a
    WHERE a.slug = p_slug;
END;
$$ LANGUAGE plpgsql;

-- Blog categories table
CREATE TABLE public.blog_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

-- Junction table for articles and categories
CREATE TABLE public.article_categories (
    article_id INT REFERENCES public.blog_articles(id),
    category_id INT REFERENCES public.blog_categories(id),
    PRIMARY KEY (article_id, category_id)
);

select * from return_books_with_no_article()
CREATE OR REPLACE FUNCTION return_books_with_no_article() 
RETURNS TABLE(isbn_13 text, data jsonb) 
AS $$
BEGIN
    RETURN QUERY 
        SELECT b.isbn_13, b.data
        FROM books b 
        LEFT JOIN blog_articles ba 
        ON b.isbn_13 = ba.isbn_13
        WHERE ba.isbn_13 IS NULL;
END;
$$ LANGUAGE plpgsql;

create table
  public.libraries (
    id uuid not null default gen_random_uuid (),
    display_name text not null,
    city_ascii text not null,
    state_id text not null,
    state_name text not null,
    county_name text not null,
    lat text null,
    lon text null,
    created_at timestamp with time zone not null default now(),
    slug text not null,
    constraint libraries_pkey primary key (id),
    constraint libraries_display_name_key unique (display_name),
    constraint libraries_slug_key unique (slug)
  ) tablespace pg_default;