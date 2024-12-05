

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";








ALTER SCHEMA "public" OWNER TO "postgres";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."append_habit_streak"("habit_id" "uuid", "day" "text", "progress_value" integer) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
declare
    new_entry jsonb;
begin
    new_entry := jsonb_build_object('day', day, 'progress_value', progress_value);

    update habits
    set streak = coalesce(streak, '{}') || new_entry
    where id = habit_id;
end;
$$;




CREATE OR REPLACE FUNCTION "public"."check_book_exists"("p_isbn_13" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql"
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


ALTER FUNCTION "public"."check_book_exists"("p_isbn_13" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_inactive_users"("days" integer) RETURNS SETOF "auth"."users"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM auth.users
    WHERE created_at <= now() - INTERVAL '1 day' * days
    AND (last_sign_in_at IS NULL OR last_sign_in_at <= now() - INTERVAL '1 day' * days);
END;
$$;




CREATE OR REPLACE FUNCTION "public"."get_basic_article_info"("p_slug" character varying) RETURNS TABLE("id" integer, "slug" character varying, "title" character varying, "description" "text", "isbn13" character varying, "image_url" "text", "image_alt" "text", "published_at" timestamp with time zone)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id, a.slug, a.title, a.description, a.isbn13, 
        a.image_url, a.image_alt, a.published_at
    FROM public.blog_articles a
    WHERE a.slug = p_slug;
END;
$$;


ALTER FUNCTION "public"."get_basic_article_info"("p_slug" character varying) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_cumulative_books_per_users_by_day"() RETURNS TABLE("date" "date", "cumulative_users" bigint)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    WITH user_first_dates AS (
        SELECT 
            user_id, 
            MIN(date_trunc('day', toread_at)) AS first_date
        FROM 
            public.reading_list
        WHERE 
            user_id IS NOT NULL
        GROUP BY 
            user_id
    ),
    daily_new_users AS (
        SELECT 
            first_date::date AS date, 
            COUNT(*) AS new_users
        FROM 
            user_first_dates
        GROUP BY 
            first_date
    ),
    date_series AS (
        SELECT 
            generate_series(
                (SELECT MIN(first_date) FROM user_first_dates),
                (SELECT MAX(first_date) FROM user_first_dates),
                interval '1 day'
            )::date AS date
    )
    SELECT
        ds.date,
        (SUM(COALESCE(dnu.new_users, 0)) OVER (
            ORDER BY ds.date
        ))::bigint AS cumulative_users
    FROM 
        date_series ds
    LEFT JOIN 
        daily_new_users dnu
    ON 
        ds.date = dnu.date
    ORDER BY 
        ds.date;
END;
$$;




CREATE OR REPLACE FUNCTION "public"."get_full_article_content"("p_slug" character varying) RETURNS TABLE("id" integer, "content" "text")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT a.id, a.content
    FROM public.blog_articles a
    WHERE a.slug = p_slug;
END;
$$;


ALTER FUNCTION "public"."get_full_article_content"("p_slug" character varying) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_metadata"("user_id" "uuid") RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
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


ALTER FUNCTION "public"."get_user_metadata"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data)
  VALUES (NEW.id, NEW.email, NEW.created_at, NEW.updated_at, NEW.raw_app_meta_data, NEW.raw_user_meta_data);
  
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);
  INSERT INTO public.user_points (user_id)
  VALUES (NEW.id);
  INSERT INTO public.user_point_streak (user_id)
  VALUES (NEW.id);
  INSERT INTO public.reading_stats (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;




CREATE OR REPLACE FUNCTION "public"."increment"("inc" double precision, "userid" "uuid") RETURNS "void"
    LANGUAGE "sql"
    AS $$
  update user_points 
  set points_earned_referrals = points_earned_referrals + inc
  where user_id = userid
$$;




CREATE OR REPLACE FUNCTION "public"."increment_points_earned"("_user_id" "uuid", "_points_to_add" integer) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    UPDATE public.user_points
    SET points_earned = points_earned + _points_to_add
    WHERE user_id = _user_id;
END;
$$;


ALTER FUNCTION "public"."increment_points_earned"("_user_id" "uuid", "_points_to_add" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_votes"("row_id" "uuid", "increment" boolean) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    row_exists BOOLEAN;
BEGIN
    -- Check if the row exists
    SELECT EXISTS(SELECT 1 FROM roadmap WHERE id = row_id) INTO row_exists;

    IF NOT row_exists THEN
        RAISE EXCEPTION 'No row found with id %', row_id;
    END IF;

    -- Perform the update based on the increment flag
    IF increment THEN
        UPDATE roadmap
        SET votes = votes + 1
        WHERE id = row_id;
    ELSE
        UPDATE roadmap
        SET votes = GREATEST(0, votes - 1)
        WHERE id = row_id;
    END IF;

    RETURN TRUE; -- Indicate success
END;
$$;




CREATE OR REPLACE FUNCTION "public"."return_books_with_no_article"() RETURNS TABLE("isbn_13" "text", "data" "jsonb")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY 
        SELECT b.isbn_13, b.data
        FROM books b 
        LEFT JOIN blog_articles ba 
        ON b.isbn_13 = ba.isbn_13
        WHERE ba.isbn_13 IS NULL;
END;
$$;


ALTER FUNCTION "public"."return_books_with_no_article"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_modified_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_modified_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_reading_stats"("p_user_id" "uuid", "p_books_read" integer, "p_pages_read" integer, "p_reading_time_minutes" integer) RETURNS "void"
    LANGUAGE "plpgsql"
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


ALTER FUNCTION "public"."update_reading_stats"("p_user_id" "uuid", "p_books_read" integer, "p_pages_read" integer, "p_reading_time_minutes" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_timestamp_based_on_status"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF NEW.status = 'To Read' THEN
        NEW.toread_at := NOW();
    ELSIF NEW.status = 'Reading' THEN
        NEW.reading_at := NOW();
    ELSIF NEW.status = 'Finished' THEN
        NEW.finished_at := NOW();
    END IF;
    RETURN NEW;
END;
$$;




CREATE OR REPLACE FUNCTION "public"."update_user_points"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."update_user_points"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."ai_conversations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "messages" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);




CREATE TABLE IF NOT EXISTS "public"."article_categories" (
    "article_id" integer NOT NULL,
    "category_id" integer NOT NULL
);


ALTER TABLE "public"."article_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."blog_articles" (
    "id" integer NOT NULL,
    "slug" character varying(255) NOT NULL,
    "title" character varying(255) NOT NULL,
    "description" "text",
    "content" "text" NOT NULL,
    "image_url" "text",
    "image_alt" "text",
    "isbn_13" "text",
    "published_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."blog_articles" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."blog_articles_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."blog_articles_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."blog_articles_id_seq" OWNED BY "public"."blog_articles"."id";



CREATE TABLE IF NOT EXISTS "public"."blog_categories" (
    "id" integer NOT NULL,
    "name" character varying(100) NOT NULL,
    "slug" character varying(100) NOT NULL,
    "description" "text"
);


ALTER TABLE "public"."blog_categories" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."blog_categories_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."blog_categories_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."blog_categories_id_seq" OWNED BY "public"."blog_categories"."id";



CREATE TABLE IF NOT EXISTS "public"."reviews" (
    "id" integer NOT NULL,
    "user_id" "uuid",
    "book_id" character varying(20) NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."reviews" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."book_notes_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."book_notes_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."book_notes_id_seq" OWNED BY "public"."reviews"."id";



CREATE TABLE IF NOT EXISTS "public"."books" (
    "isbn_13" "text" NOT NULL,
    "data" "jsonb" NOT NULL,
    "added_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."books" OWNER TO "postgres";


COMMENT ON TABLE "public"."books" IS 'books cache to prevent book api pinging';



CREATE TABLE IF NOT EXISTS "public"."books_like" (
    "id" "text" NOT NULL,
    "books" "text"[] NOT NULL
);


ALTER TABLE "public"."books_like" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."books_modifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "isbn_13" "text" NOT NULL,
    "user_id" "uuid",
    "is_reviewed" boolean DEFAULT false,
    "title" "text",
    "description" "text",
    "page_count" integer,
    "is_approved" boolean,
    "created_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text")
);




CREATE TABLE IF NOT EXISTS "public"."friends" (
    "id" integer NOT NULL,
    "user_id" "uuid",
    "friend_id" "uuid",
    "status" character varying(20),
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "friends_status_check" CHECK ((("status")::"text" = ANY (ARRAY[('pending'::character varying)::"text", ('accepted'::character varying)::"text", ('rejected'::character varying)::"text"])))
);


ALTER TABLE "public"."friends" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."friends_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."friends_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."friends_id_seq" OWNED BY "public"."friends"."id";



CREATE TABLE IF NOT EXISTS "public"."habits" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "periodicity" "text" NOT NULL,
    "metric" "text" NOT NULL,
    "value" bigint DEFAULT '0'::bigint NOT NULL,
    "user_id" "uuid",
    "progress_value" bigint DEFAULT '0'::bigint NOT NULL,
    "streak" "jsonb"[] DEFAULT '{}'::"jsonb"[]
);




CREATE TABLE IF NOT EXISTS "public"."indie_authors" (
    "author_id" "uuid" NOT NULL,
    "name" "text",
    "presentation" "text",
    "birth_date" "date",
    "first_book_published_year" timestamp without time zone,
    "personal_favorite_genres" "text"[] NOT NULL,
    "main_writing_genres" "text"[] NOT NULL,
    "type_of_books" "text"[] NOT NULL,
    "picture_link" "text" NOT NULL,
    "website" "text",
    "is_approved" boolean DEFAULT false NOT NULL
);




CREATE TABLE IF NOT EXISTS "public"."indie_authors_books" (
    "book_id" "uuid" NOT NULL,
    "author_id" "uuid",
    "release_date" timestamp without time zone,
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "categories" "text"[] NOT NULL,
    "cover_image_small_link" "text" NOT NULL,
    "cover_image_large_link" "text" NOT NULL,
    "is_approved" boolean DEFAULT false NOT NULL
);




CREATE TABLE IF NOT EXISTS "public"."indie_authors_books_links" (
    "book_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "label" "text" NOT NULL,
    "link" "text" NOT NULL
);




CREATE TABLE IF NOT EXISTS "public"."indie_authors_social" (
    "social_media_id" "uuid" NOT NULL,
    "author_id" "uuid",
    "social_media_name" "text",
    "link" "text"
);




CREATE TABLE IF NOT EXISTS "public"."libraries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "display_name" "text" NOT NULL,
    "city_ascii" "text" NOT NULL,
    "state_id" "text" NOT NULL,
    "state_name" "text" NOT NULL,
    "county_name" "text" NOT NULL,
    "lat" "text",
    "lon" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."libraries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."onboarding" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tour_name" "text" NOT NULL,
    "onboarded_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "onboarded" boolean DEFAULT true NOT NULL,
    "user_id" "uuid" NOT NULL
);




CREATE TABLE IF NOT EXISTS "public"."point_transactions" (
    "id" integer NOT NULL,
    "user_id" "uuid",
    "points" integer,
    "type" character varying(50),
    "description" "text",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "point_transactions_type_check" CHECK ((("type")::"text" = ANY (ARRAY[('earned'::character varying)::"text", ('redeemed'::character varying)::"text"])))
);


ALTER TABLE "public"."point_transactions" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."point_transactions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."point_transactions_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."point_transactions_id_seq" OWNED BY "public"."point_transactions"."id";



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "created_at" timestamp with time zone,
    "last_sign_in_at" timestamp with time zone,
    "raw_app_meta_data" "jsonb",
    "raw_user_meta_data" "jsonb",
    "email" "text",
    "inactivity_email_sent" boolean DEFAULT false NOT NULL,
    "username" "text",
    "customer_id" "text",
    "price_id" "text",
    "has_access" boolean DEFAULT false
);




CREATE TABLE IF NOT EXISTS "public"."questions_notes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "book_id" "text" NOT NULL,
    "question" "text" NOT NULL,
    "answer" "text",
    "created_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text") NOT NULL
);




CREATE TABLE IF NOT EXISTS "public"."quotes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "text" "text" NOT NULL,
    "author" "text" NOT NULL
);




CREATE TABLE IF NOT EXISTS "public"."reading_list" (
    "user_id" "uuid",
    "book_id" character varying(20) NOT NULL,
    "status" "text",
    "rating" numeric(3,1),
    "review" "text",
    "toread_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "pointsAwardedFinished" boolean DEFAULT false NOT NULL,
    "pointsAwardedRating" boolean DEFAULT false NOT NULL,
    "pointsAwardedTextReview" boolean DEFAULT false NOT NULL,
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "reading_at" timestamp with time zone,
    "finished_at" timestamp with time zone,
    "reviewPublic" boolean DEFAULT false NOT NULL,
    "pages_read" integer DEFAULT 0 NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "format" "text" DEFAULT 'physical'::"text",
    CONSTRAINT "reading_list_status_check" CHECK (("status" = ANY (ARRAY[('To Read'::character varying)::"text", ('Reading'::character varying)::"text", ('Finished'::character varying)::"text", ('DNF'::character varying)::"text"])))
);


ALTER TABLE "public"."reading_list" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reading_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "started_at" timestamp with time zone,
    "ended_at" timestamp with time zone,
    "start_page" integer NOT NULL,
    "end_page" integer NOT NULL,
    "reading_list_id" "uuid"
);




CREATE TABLE IF NOT EXISTS "public"."reading_stats" (
    "user_id" "uuid" NOT NULL,
    "books_read" integer,
    "pages_read" integer,
    "reading_time_minutes" integer DEFAULT 0
);


ALTER TABLE "public"."reading_stats" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."referrals" (
    "referrer_id" "uuid" NOT NULL,
    "referred_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL
);




CREATE TABLE IF NOT EXISTS "public"."roadmap" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "is_approved" boolean DEFAULT false NOT NULL,
    "tags" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "votes" integer DEFAULT 0 NOT NULL,
    "status" "text" DEFAULT 'ideas'::"text" NOT NULL
);




CREATE TABLE IF NOT EXISTS "public"."roadmap_votes" (
    "roadmap_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "increment" boolean
);




CREATE TABLE IF NOT EXISTS "public"."sticky_notes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "book_id" "text" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "label" "text" NOT NULL,
    "is_public" boolean DEFAULT false NOT NULL,
    "start_page" integer,
    "end_page" integer,
    "reading_session_id" "uuid"
);




CREATE TABLE IF NOT EXISTS "public"."user_activity" (
    "id" integer NOT NULL,
    "user_id" "uuid",
    "activity_type" character varying(50),
    "details" "jsonb",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_activity_activity_type_check" CHECK ((("activity_type")::"text" = ANY (ARRAY[('book_added'::character varying)::"text", ('book_started'::character varying)::"text", ('book_finished'::character varying)::"text", ('points_earned'::character varying)::"text"])))
);


ALTER TABLE "public"."user_activity" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."user_activity_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."user_activity_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."user_activity_id_seq" OWNED BY "public"."user_activity"."id";



CREATE TABLE IF NOT EXISTS "public"."user_connection_activity" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "active_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" DEFAULT "gen_random_uuid"()
);




CREATE TABLE IF NOT EXISTS "public"."user_point_streak" (
    "user_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "day1" timestamp with time zone,
    "day2" timestamp with time zone,
    "day3" timestamp with time zone,
    "day4" timestamp with time zone,
    "day5" timestamp with time zone,
    "day6" timestamp with time zone,
    "day7" timestamp with time zone,
    "reward_awarded" boolean[] DEFAULT '{f,f,f,f,f,f,f}'::boolean[]
);


ALTER TABLE "public"."user_point_streak" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_points" (
    "user_id" "uuid" NOT NULL,
    "points_earned" integer,
    "points_redeemed" integer,
    "points_earned_referrals" real DEFAULT '0'::real NOT NULL
);


ALTER TABLE "public"."user_points" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_preferences" (
    "user_id" "uuid" NOT NULL,
    "preferred_categories" "text"[],
    "username" character varying(50),
    "bio" "text",
    "profile_picture_url" "text",
    "onboarded" boolean DEFAULT false NOT NULL,
    "preferred_ui_language" "text" DEFAULT 'en'::"text",
    "preferred_book_language" "text" DEFAULT 'en'::"text"
);


ALTER TABLE "public"."user_preferences" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vocal_notes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "start_time" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text") NOT NULL,
    "end_time" timestamp with time zone NOT NULL,
    "endpoint_url" "text" NOT NULL,
    "text_content" "text"
);




ALTER TABLE ONLY "public"."blog_articles" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."blog_articles_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."blog_categories" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."blog_categories_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."friends" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."friends_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."point_transactions" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."point_transactions_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."reviews" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."book_notes_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."user_activity" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."user_activity_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."ai_conversations"
    ADD CONSTRAINT "ai_conversations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."article_categories"
    ADD CONSTRAINT "article_categories_pkey" PRIMARY KEY ("article_id", "category_id");



ALTER TABLE ONLY "public"."blog_articles"
    ADD CONSTRAINT "blog_articles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."blog_articles"
    ADD CONSTRAINT "blog_articles_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."blog_categories"
    ADD CONSTRAINT "blog_categories_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."blog_categories"
    ADD CONSTRAINT "blog_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."blog_categories"
    ADD CONSTRAINT "blog_categories_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "book_notes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "book_notes_user_id_book_id_key" UNIQUE ("user_id", "book_id");



ALTER TABLE ONLY "public"."books"
    ADD CONSTRAINT "books_isbn_13_key" UNIQUE ("isbn_13");



ALTER TABLE ONLY "public"."books_like"
    ADD CONSTRAINT "books_like_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."books_modifications"
    ADD CONSTRAINT "books_modifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."books"
    ADD CONSTRAINT "books_pkey" PRIMARY KEY ("isbn_13");



ALTER TABLE ONLY "public"."friends"
    ADD CONSTRAINT "friends_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."friends"
    ADD CONSTRAINT "friends_user_id_friend_id_key" UNIQUE ("user_id", "friend_id");



ALTER TABLE ONLY "public"."habits"
    ADD CONSTRAINT "habits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."indie_authors_books_links"
    ADD CONSTRAINT "indie_authors_books_links_pkey" PRIMARY KEY ("book_id");



ALTER TABLE ONLY "public"."indie_authors_books"
    ADD CONSTRAINT "indie_authors_books_pkey" PRIMARY KEY ("book_id");



ALTER TABLE ONLY "public"."indie_authors"
    ADD CONSTRAINT "indie_authors_pkey" PRIMARY KEY ("author_id");



ALTER TABLE ONLY "public"."indie_authors_social"
    ADD CONSTRAINT "indie_authors_social_pkey" PRIMARY KEY ("social_media_id");



ALTER TABLE ONLY "public"."libraries"
    ADD CONSTRAINT "libraries_display_name_key" UNIQUE ("display_name");



ALTER TABLE ONLY "public"."libraries"
    ADD CONSTRAINT "libraries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."onboarding"
    ADD CONSTRAINT "onboarding_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."point_transactions"
    ADD CONSTRAINT "point_transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."questions_notes"
    ADD CONSTRAINT "questions_notes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quotes"
    ADD CONSTRAINT "quotes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quotes"
    ADD CONSTRAINT "quotes_text_key" UNIQUE ("text");



ALTER TABLE ONLY "public"."reading_list"
    ADD CONSTRAINT "reading_list_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reading_list"
    ADD CONSTRAINT "reading_list_user_book_unique" UNIQUE ("user_id", "book_id");



ALTER TABLE ONLY "public"."reading_sessions"
    ADD CONSTRAINT "reading_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reading_stats"
    ADD CONSTRAINT "reading_stats_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."referrals"
    ADD CONSTRAINT "referrals_pkey" PRIMARY KEY ("referrer_id");



ALTER TABLE ONLY "public"."roadmap"
    ADD CONSTRAINT "roadmap_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."roadmap_votes"
    ADD CONSTRAINT "roadmap_votes_pkey" PRIMARY KEY ("roadmap_id");



ALTER TABLE ONLY "public"."sticky_notes"
    ADD CONSTRAINT "sticky_notes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_activity"
    ADD CONSTRAINT "user_activity_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_connection_activity"
    ADD CONSTRAINT "user_connection_activity_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_point_streak"
    ADD CONSTRAINT "user_point_streak_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."user_points"
    ADD CONSTRAINT "user_points_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."user_preferences"
    ADD CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."user_preferences"
    ADD CONSTRAINT "user_preferences_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."vocal_notes"
    ADD CONSTRAINT "vocal_notes_pkey" PRIMARY KEY ("id");



CREATE OR REPLACE TRIGGER "update_timestamps" BEFORE INSERT OR UPDATE ON "public"."reading_list" FOR EACH ROW EXECUTE FUNCTION "public"."update_timestamp_based_on_status"();



CREATE OR REPLACE TRIGGER "update_user_activity_modtime" BEFORE UPDATE ON "public"."user_activity" FOR EACH ROW EXECUTE FUNCTION "public"."update_modified_column"();



ALTER TABLE ONLY "public"."article_categories"
    ADD CONSTRAINT "article_categories_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "public"."blog_articles"("id");



ALTER TABLE ONLY "public"."article_categories"
    ADD CONSTRAINT "article_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."blog_categories"("id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "book_notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."books_like"
    ADD CONSTRAINT "books_like_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."books"("isbn_13") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."books_modifications"
    ADD CONSTRAINT "books_modifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."indie_authors_books"
    ADD CONSTRAINT "fk_author_books" FOREIGN KEY ("author_id") REFERENCES "public"."indie_authors"("author_id");



ALTER TABLE ONLY "public"."indie_authors_social"
    ADD CONSTRAINT "fk_author_social" FOREIGN KEY ("author_id") REFERENCES "public"."indie_authors"("author_id");



ALTER TABLE ONLY "public"."friends"
    ADD CONSTRAINT "friends_friend_id_fkey" FOREIGN KEY ("friend_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."friends"
    ADD CONSTRAINT "friends_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."habits"
    ADD CONSTRAINT "habits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."indie_authors"
    ADD CONSTRAINT "indie_authors_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."indie_authors"
    ADD CONSTRAINT "indie_authors_author_id_fkey1" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."indie_authors_books"
    ADD CONSTRAINT "indie_authors_books_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."indie_authors"("author_id");



ALTER TABLE ONLY "public"."indie_authors_books_links"
    ADD CONSTRAINT "indie_authors_books_links_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "public"."indie_authors_books"("book_id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."indie_authors_social"
    ADD CONSTRAINT "indie_authors_social_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."indie_authors"("author_id");



ALTER TABLE ONLY "public"."onboarding"
    ADD CONSTRAINT "onboarding_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."point_transactions"
    ADD CONSTRAINT "point_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."questions_notes"
    ADD CONSTRAINT "questions_notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."reading_list"
    ADD CONSTRAINT "reading_list_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reading_sessions"
    ADD CONSTRAINT "reading_sessions_reading_list_id_fkey" FOREIGN KEY ("reading_list_id") REFERENCES "public"."reading_list"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reading_stats"
    ADD CONSTRAINT "reading_stats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."referrals"
    ADD CONSTRAINT "referrals_referrer_id_fkey" FOREIGN KEY ("referrer_id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."roadmap_votes"
    ADD CONSTRAINT "roadmap_votes_roadmap_id_fkey" FOREIGN KEY ("roadmap_id") REFERENCES "public"."roadmap"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."roadmap_votes"
    ADD CONSTRAINT "roadmap_votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sticky_notes"
    ADD CONSTRAINT "sticky_notes_reading_session_id_fkey" FOREIGN KEY ("reading_session_id") REFERENCES "public"."reading_sessions"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sticky_notes"
    ADD CONSTRAINT "sticky_notes_user_id_fkey1" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_activity"
    ADD CONSTRAINT "user_activity_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_connection_activity"
    ADD CONSTRAINT "user_connection_activity_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_point_streak"
    ADD CONSTRAINT "user_point_streak_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_points"
    ADD CONSTRAINT "user_points_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_preferences"
    ADD CONSTRAINT "user_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vocal_notes"
    ADD CONSTRAINT "vocal_notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE SET NULL;



CREATE POLICY "Enable delete for users based on user_id" ON "public"."habits" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable delete for users based on user_id" ON "public"."questions_notes" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable delete for users based on user_id" ON "public"."sticky_notes" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable delete for users based on user_id" ON "public"."vocal_notes" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable insert for authenticated users only" ON "public"."profiles" FOR INSERT TO "supabase_admin" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."questions_notes" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable insert for authenticated users only" ON "public"."reading_sessions" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."referrals" FOR INSERT TO "authenticated", "anon" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."roadmap" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."roadmap_votes" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable insert for authenticated users only" ON "public"."vocal_notes" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable insert for users based on user_id" ON "public"."habits" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable insert for users based on user_id" ON "public"."sticky_notes" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable insert for users based on user_id" ON "public"."user_connection_activity" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable read access for all users" ON "public"."ai_conversations" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."habits" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable read access for all users" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."questions_notes" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable read access for all users" ON "public"."quotes" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."reading_sessions" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."referrals" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."roadmap" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."roadmap_votes" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."sticky_notes" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."user_connection_activity" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."vocal_notes" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable update for users based on email" ON "public"."habits" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable update for users based on email" ON "public"."profiles" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "Enable update for users based on email" ON "public"."roadmap" FOR UPDATE USING (((( SELECT "auth"."jwt"() AS "jwt") ->> 'email'::"text") = 'theodufort05@gmail.com'::"text")) WITH CHECK (((( SELECT "auth"."jwt"() AS "jwt") ->> 'email'::"text") = 'theodufort05@gmail.com'::"text"));



CREATE POLICY "Enable update for users based on email" ON "public"."roadmap_votes" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable update for users based on email" ON "public"."sticky_notes" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable update for users based on email" ON "public"."vocal_notes" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Policy with table joins" ON "public"."questions_notes" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Policy with table joins" ON "public"."reading_sessions" FOR UPDATE USING (true);



ALTER TABLE "public"."ai_conversations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "article categories are viewable" ON "public"."article_categories" FOR SELECT TO "anon" USING (true);



ALTER TABLE "public"."article_categories" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "blog articles are viewable" ON "public"."blog_articles" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "blog categories are viewable" ON "public"."blog_categories" FOR SELECT TO "anon" USING (true);



ALTER TABLE "public"."blog_articles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."blog_categories" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "book_notes are deletable only by their user" ON "public"."reviews" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "book_notes are insertable only by their user" ON "public"."reviews" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "book_notes are selectable only by their user" ON "public"."reviews" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "book_notes are updatable only by their user" ON "public"."reviews" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."books" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "books are insertable only by their user" ON "public"."books" FOR INSERT TO "authenticated", "anon" WITH CHECK (true);



CREATE POLICY "books are viewable" ON "public"."books" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "books like are viewable" ON "public"."books_like" FOR SELECT TO "authenticated", "anon" USING (true);



ALTER TABLE "public"."books_like" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."friends" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."habits" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."libraries" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "libraries are viewable" ON "public"."libraries" FOR SELECT TO "authenticated", "anon" USING (true);



ALTER TABLE "public"."point_transactions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "point_transactions are deletable only by their user" ON "public"."point_transactions" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "point_transactions are insertable only by their user" ON "public"."point_transactions" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "point_transactions are selectable only by their user" ON "public"."point_transactions" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "point_transactions are updatable only by their user" ON "public"."point_transactions" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."questions_notes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."quotes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reading_list" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "reading_list are deletable only by their user" ON "public"."reading_list" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "reading_list are insertable only by their user" ON "public"."reading_list" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "reading_list are selectable only by their user" ON "public"."reading_list" FOR SELECT USING (true);



CREATE POLICY "reading_list are updatable only by their user" ON "public"."reading_list" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."reading_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reading_stats" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "reading_stats are deletable only by their user" ON "public"."reading_stats" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "reading_stats are insertable only by their user" ON "public"."reading_stats" FOR INSERT TO "supabase_admin", "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "reading_stats are selectable only by their user" ON "public"."reading_stats" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "reading_stats are updatable only by their user" ON "public"."reading_stats" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."referrals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reviews" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."roadmap" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."roadmap_votes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sticky_notes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_activity" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_activity are deletable only by their user" ON "public"."user_activity" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "user_activity are insertable only by their user" ON "public"."user_activity" FOR INSERT TO "supabase_admin", "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "user_activity are selectable only by their user" ON "public"."user_activity" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "user_activity are updatable only by their user" ON "public"."user_activity" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."user_connection_activity" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_point_streak" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_point_streak are deletable only by their user" ON "public"."user_point_streak" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "user_point_streak are insertable only by their user" ON "public"."user_point_streak" FOR INSERT TO "supabase_admin", "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "user_point_streak are selectable only by their user" ON "public"."user_point_streak" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "user_point_streak are updatable only by their user" ON "public"."user_point_streak" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."user_points" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_points are deletable only by their user" ON "public"."user_points" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "user_points are insertable only by their user" ON "public"."user_points" FOR INSERT TO "supabase_admin", "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "user_points are selectable only by their user" ON "public"."user_points" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "user_points are updatable only by their user" ON "public"."user_points" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."user_preferences" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_preferences are deletable only by their user" ON "public"."user_preferences" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "user_preferences are insertable only by their user" ON "public"."user_preferences" FOR INSERT TO "supabase_admin", "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "user_preferences are selectable only by their user" ON "public"."user_preferences" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "user_preferences are updatable only by their user" ON "public"."user_preferences" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."vocal_notes" ENABLE ROW LEVEL SECURITY;








ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;
GRANT ALL ON SCHEMA "public" TO "anon";
GRANT ALL ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";
GRANT ALL ON SCHEMA "public" TO "supabase_admin";






































































































































































































GRANT ALL ON FUNCTION "public"."append_habit_streak"("habit_id" "uuid", "day" "text", "progress_value" integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."append_habit_streak"("habit_id" "uuid", "day" "text", "progress_value" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."append_habit_streak"("habit_id" "uuid", "day" "text", "progress_value" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."append_habit_streak"("habit_id" "uuid", "day" "text", "progress_value" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."check_book_exists"("p_isbn_13" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."check_book_exists"("p_isbn_13" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_book_exists"("p_isbn_13" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_inactive_users"("days" integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."check_inactive_users"("days" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."check_inactive_users"("days" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_inactive_users"("days" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_basic_article_info"("p_slug" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."get_basic_article_info"("p_slug" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_basic_article_info"("p_slug" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_cumulative_books_per_users_by_day"() TO "postgres";
GRANT ALL ON FUNCTION "public"."get_cumulative_books_per_users_by_day"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_cumulative_books_per_users_by_day"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_cumulative_books_per_users_by_day"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_full_article_content"("p_slug" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."get_full_article_content"("p_slug" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_full_article_content"("p_slug" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_metadata"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_metadata"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_metadata"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "postgres";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."increment"("inc" double precision, "userid" "uuid") TO "postgres";
GRANT ALL ON FUNCTION "public"."increment"("inc" double precision, "userid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."increment"("inc" double precision, "userid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment"("inc" double precision, "userid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_points_earned"("_user_id" "uuid", "_points_to_add" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."increment_points_earned"("_user_id" "uuid", "_points_to_add" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_points_earned"("_user_id" "uuid", "_points_to_add" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_votes"("row_id" "uuid", "increment" boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."increment_votes"("row_id" "uuid", "increment" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."increment_votes"("row_id" "uuid", "increment" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_votes"("row_id" "uuid", "increment" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."return_books_with_no_article"() TO "anon";
GRANT ALL ON FUNCTION "public"."return_books_with_no_article"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."return_books_with_no_article"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_modified_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_modified_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_modified_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_reading_stats"("p_user_id" "uuid", "p_books_read" integer, "p_pages_read" integer, "p_reading_time_minutes" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."update_reading_stats"("p_user_id" "uuid", "p_books_read" integer, "p_pages_read" integer, "p_reading_time_minutes" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_reading_stats"("p_user_id" "uuid", "p_books_read" integer, "p_pages_read" integer, "p_reading_time_minutes" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_timestamp_based_on_status"() TO "postgres";
GRANT ALL ON FUNCTION "public"."update_timestamp_based_on_status"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_timestamp_based_on_status"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_timestamp_based_on_status"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_points"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_points"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_points"() TO "service_role";





















GRANT ALL ON TABLE "public"."ai_conversations" TO "postgres";
GRANT ALL ON TABLE "public"."ai_conversations" TO "anon";
GRANT ALL ON TABLE "public"."ai_conversations" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_conversations" TO "service_role";



GRANT ALL ON TABLE "public"."article_categories" TO "anon";
GRANT ALL ON TABLE "public"."article_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."article_categories" TO "service_role";
GRANT TRIGGER ON TABLE "public"."article_categories" TO "supabase_admin";



GRANT ALL ON TABLE "public"."blog_articles" TO "anon";
GRANT ALL ON TABLE "public"."blog_articles" TO "authenticated";
GRANT ALL ON TABLE "public"."blog_articles" TO "service_role";
GRANT TRIGGER ON TABLE "public"."blog_articles" TO "supabase_admin";



GRANT ALL ON SEQUENCE "public"."blog_articles_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."blog_articles_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."blog_articles_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."blog_categories" TO "anon";
GRANT ALL ON TABLE "public"."blog_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."blog_categories" TO "service_role";
GRANT TRIGGER ON TABLE "public"."blog_categories" TO "supabase_admin";



GRANT ALL ON SEQUENCE "public"."blog_categories_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."blog_categories_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."blog_categories_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."reviews" TO "anon";
GRANT ALL ON TABLE "public"."reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."reviews" TO "service_role";
GRANT TRIGGER ON TABLE "public"."reviews" TO "supabase_admin";



GRANT ALL ON SEQUENCE "public"."book_notes_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."book_notes_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."book_notes_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."books" TO "anon";
GRANT ALL ON TABLE "public"."books" TO "authenticated";
GRANT ALL ON TABLE "public"."books" TO "service_role";
GRANT TRIGGER ON TABLE "public"."books" TO "supabase_admin";



GRANT ALL ON TABLE "public"."books_like" TO "anon";
GRANT ALL ON TABLE "public"."books_like" TO "authenticated";
GRANT ALL ON TABLE "public"."books_like" TO "service_role";
GRANT TRIGGER ON TABLE "public"."books_like" TO "supabase_admin";



GRANT ALL ON TABLE "public"."books_modifications" TO "postgres";
GRANT ALL ON TABLE "public"."books_modifications" TO "anon";
GRANT ALL ON TABLE "public"."books_modifications" TO "authenticated";
GRANT ALL ON TABLE "public"."books_modifications" TO "service_role";



GRANT ALL ON TABLE "public"."friends" TO "anon";
GRANT ALL ON TABLE "public"."friends" TO "authenticated";
GRANT ALL ON TABLE "public"."friends" TO "service_role";
GRANT TRIGGER ON TABLE "public"."friends" TO "supabase_admin";



GRANT ALL ON SEQUENCE "public"."friends_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."friends_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."friends_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."habits" TO "postgres";
GRANT ALL ON TABLE "public"."habits" TO "anon";
GRANT ALL ON TABLE "public"."habits" TO "authenticated";
GRANT ALL ON TABLE "public"."habits" TO "service_role";



GRANT ALL ON TABLE "public"."indie_authors" TO "postgres";
GRANT ALL ON TABLE "public"."indie_authors" TO "anon";
GRANT ALL ON TABLE "public"."indie_authors" TO "authenticated";
GRANT ALL ON TABLE "public"."indie_authors" TO "service_role";



GRANT ALL ON TABLE "public"."indie_authors_books" TO "postgres";
GRANT ALL ON TABLE "public"."indie_authors_books" TO "anon";
GRANT ALL ON TABLE "public"."indie_authors_books" TO "authenticated";
GRANT ALL ON TABLE "public"."indie_authors_books" TO "service_role";



GRANT ALL ON TABLE "public"."indie_authors_books_links" TO "postgres";
GRANT ALL ON TABLE "public"."indie_authors_books_links" TO "anon";
GRANT ALL ON TABLE "public"."indie_authors_books_links" TO "authenticated";
GRANT ALL ON TABLE "public"."indie_authors_books_links" TO "service_role";



GRANT ALL ON TABLE "public"."indie_authors_social" TO "postgres";
GRANT ALL ON TABLE "public"."indie_authors_social" TO "anon";
GRANT ALL ON TABLE "public"."indie_authors_social" TO "authenticated";
GRANT ALL ON TABLE "public"."indie_authors_social" TO "service_role";



GRANT ALL ON TABLE "public"."libraries" TO "anon";
GRANT ALL ON TABLE "public"."libraries" TO "authenticated";
GRANT ALL ON TABLE "public"."libraries" TO "service_role";
GRANT TRIGGER ON TABLE "public"."libraries" TO "supabase_admin";



GRANT ALL ON TABLE "public"."onboarding" TO "postgres";
GRANT ALL ON TABLE "public"."onboarding" TO "anon";
GRANT ALL ON TABLE "public"."onboarding" TO "authenticated";
GRANT ALL ON TABLE "public"."onboarding" TO "service_role";



GRANT ALL ON TABLE "public"."point_transactions" TO "anon";
GRANT ALL ON TABLE "public"."point_transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."point_transactions" TO "service_role";
GRANT TRIGGER ON TABLE "public"."point_transactions" TO "supabase_admin";



GRANT ALL ON SEQUENCE "public"."point_transactions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."point_transactions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."point_transactions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "postgres";
GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."questions_notes" TO "postgres";
GRANT ALL ON TABLE "public"."questions_notes" TO "anon";
GRANT ALL ON TABLE "public"."questions_notes" TO "authenticated";
GRANT ALL ON TABLE "public"."questions_notes" TO "service_role";



GRANT ALL ON TABLE "public"."quotes" TO "postgres";
GRANT ALL ON TABLE "public"."quotes" TO "anon";
GRANT ALL ON TABLE "public"."quotes" TO "authenticated";
GRANT ALL ON TABLE "public"."quotes" TO "service_role";



GRANT ALL ON TABLE "public"."reading_list" TO "anon";
GRANT ALL ON TABLE "public"."reading_list" TO "authenticated";
GRANT ALL ON TABLE "public"."reading_list" TO "service_role";
GRANT TRIGGER ON TABLE "public"."reading_list" TO "supabase_admin";



GRANT ALL ON TABLE "public"."reading_sessions" TO "postgres";
GRANT ALL ON TABLE "public"."reading_sessions" TO "anon";
GRANT ALL ON TABLE "public"."reading_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."reading_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."reading_stats" TO "anon";
GRANT ALL ON TABLE "public"."reading_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."reading_stats" TO "service_role";
GRANT ALL ON TABLE "public"."reading_stats" TO "supabase_admin";



GRANT ALL ON TABLE "public"."referrals" TO "postgres";
GRANT ALL ON TABLE "public"."referrals" TO "anon";
GRANT ALL ON TABLE "public"."referrals" TO "authenticated";
GRANT ALL ON TABLE "public"."referrals" TO "service_role";



GRANT ALL ON TABLE "public"."roadmap" TO "postgres";
GRANT ALL ON TABLE "public"."roadmap" TO "anon";
GRANT ALL ON TABLE "public"."roadmap" TO "authenticated";
GRANT ALL ON TABLE "public"."roadmap" TO "service_role";



GRANT ALL ON TABLE "public"."roadmap_votes" TO "postgres";
GRANT ALL ON TABLE "public"."roadmap_votes" TO "anon";
GRANT ALL ON TABLE "public"."roadmap_votes" TO "authenticated";
GRANT ALL ON TABLE "public"."roadmap_votes" TO "service_role";



GRANT ALL ON TABLE "public"."sticky_notes" TO "postgres";
GRANT ALL ON TABLE "public"."sticky_notes" TO "anon";
GRANT ALL ON TABLE "public"."sticky_notes" TO "authenticated";
GRANT ALL ON TABLE "public"."sticky_notes" TO "service_role";



GRANT ALL ON TABLE "public"."user_activity" TO "anon";
GRANT ALL ON TABLE "public"."user_activity" TO "authenticated";
GRANT ALL ON TABLE "public"."user_activity" TO "service_role";
GRANT TRIGGER ON TABLE "public"."user_activity" TO "supabase_admin";



GRANT ALL ON SEQUENCE "public"."user_activity_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_activity_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_activity_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_connection_activity" TO "postgres";
GRANT ALL ON TABLE "public"."user_connection_activity" TO "anon";
GRANT ALL ON TABLE "public"."user_connection_activity" TO "authenticated";
GRANT ALL ON TABLE "public"."user_connection_activity" TO "service_role";



GRANT ALL ON TABLE "public"."user_point_streak" TO "anon";
GRANT ALL ON TABLE "public"."user_point_streak" TO "authenticated";
GRANT ALL ON TABLE "public"."user_point_streak" TO "service_role";
GRANT ALL ON TABLE "public"."user_point_streak" TO "supabase_admin";



GRANT ALL ON TABLE "public"."user_points" TO "anon";
GRANT ALL ON TABLE "public"."user_points" TO "authenticated";
GRANT ALL ON TABLE "public"."user_points" TO "service_role";
GRANT ALL ON TABLE "public"."user_points" TO "supabase_admin";



GRANT ALL ON TABLE "public"."user_preferences" TO "anon";
GRANT ALL ON TABLE "public"."user_preferences" TO "authenticated";
GRANT ALL ON TABLE "public"."user_preferences" TO "service_role";
GRANT ALL ON TABLE "public"."user_preferences" TO "supabase_admin";



GRANT ALL ON TABLE "public"."vocal_notes" TO "postgres";
GRANT ALL ON TABLE "public"."vocal_notes" TO "anon";
GRANT ALL ON TABLE "public"."vocal_notes" TO "authenticated";
GRANT ALL ON TABLE "public"."vocal_notes" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
