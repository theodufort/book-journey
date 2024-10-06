drop policy "blog articles are viewable" on "public"."blog_articles";

drop policy "books are insertable only by their user" on "public"."books";

drop policy "books are viewable" on "public"."books";

drop policy "books like are viewable" on "public"."books_like";

drop policy "libraries are viewable" on "public"."libraries";

alter table "public"."profiles" drop constraint "fk_user_id";

alter table "public"."reading_stats" drop constraint "reading_stats_user_id_fkey";

alter table "public"."user_points" drop constraint "user_points_user_id_fkey";

alter table "public"."user_preferences" drop constraint "user_preferences_user_id_fkey";

alter table "public"."profiles" drop column "aud";

alter table "public"."profiles" drop column "banned_until";

alter table "public"."profiles" drop column "confirmation_sent_at";

alter table "public"."profiles" drop column "confirmation_token";

alter table "public"."profiles" drop column "confirmed_at";

alter table "public"."profiles" drop column "deleted_at";

alter table "public"."profiles" drop column "email";

alter table "public"."profiles" drop column "email_change";

alter table "public"."profiles" drop column "email_change_confirm_status";

alter table "public"."profiles" drop column "email_change_sent_at";

alter table "public"."profiles" drop column "email_change_token_current";

alter table "public"."profiles" drop column "email_change_token_new";

alter table "public"."profiles" drop column "email_confirmed_at";

alter table "public"."profiles" drop column "inactivity_email_sent";

alter table "public"."profiles" drop column "instance_id";

alter table "public"."profiles" drop column "invited_at";

alter table "public"."profiles" drop column "is_anonymous";

alter table "public"."profiles" drop column "is_sso_user";

alter table "public"."profiles" drop column "is_super_admin";

alter table "public"."profiles" drop column "phone";

alter table "public"."profiles" drop column "phone_change";

alter table "public"."profiles" drop column "phone_change_sent_at";

alter table "public"."profiles" drop column "phone_change_token";

alter table "public"."profiles" drop column "phone_confirmed_at";

alter table "public"."profiles" drop column "reauthentication_sent_at";

alter table "public"."profiles" drop column "reauthentication_token";

alter table "public"."profiles" drop column "recovery_sent_at";

alter table "public"."profiles" drop column "recovery_token";

alter table "public"."profiles" drop column "role";

alter table "public"."profiles" drop column "updated_at";

alter table "public"."profiles" alter column "id" set not null;

alter table "public"."profiles" enable row level security;

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."reading_stats" add constraint "reading_stats_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."reading_stats" validate constraint "reading_stats_user_id_fkey";

alter table "public"."user_points" add constraint "user_points_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."user_points" validate constraint "user_points_user_id_fkey";

alter table "public"."user_preferences" add constraint "user_preferences_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."user_preferences" validate constraint "user_preferences_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.check_inactive_users(days integer)
 RETURNS SETOF auth.users
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT *
    FROM auth.users
    WHERE created_at <= now() - INTERVAL '1 day' * days
    AND (last_sign_in_at IS NULL OR last_sign_in_at <= now() - INTERVAL '1 day' * days);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_basic_article_info(p_slug character varying)
 RETURNS TABLE(id integer, slug character varying, title character varying, description text, isbn13 character varying, image_url text, image_alt text, published_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        a.id, a.slug, a.title, a.description, a.isbn13, 
        a.image_url, a.image_alt, a.published_at
    FROM public.blog_articles a
    WHERE a.slug = p_slug;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_full_article_content(p_slug character varying)
 RETURNS TABLE(id integer, content text)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT a.id, a.content
    FROM public.blog_articles a
    WHERE a.slug = p_slug;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  insert into public.profiles (id, created_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data)
  values (new.id,new.created_at,new.updated_at,new.raw_app_meta_data, new.raw_user_meta_data);
  insert into public.user_preferences (user_id)
  values (new.id);
  insert into public.user_points (user_id)
  values (new.id);
  insert into public.user_point_streak (user_id)
  values (new.id);
  insert into public.reading_stats (user_id)
  values (new.id);
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.increment_points_earned(_user_id uuid, _points_to_add integer)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
    UPDATE public.user_points
    SET points_earned = points_earned + _points_to_add
    WHERE user_id = _user_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.return_books_with_no_article()
 RETURNS TABLE(isbn_13 text, data jsonb)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY 
        SELECT b.isbn_13, b.data
        FROM books b 
        LEFT JOIN blog_articles ba 
        ON b.isbn_13 = ba.isbn_13
        WHERE ba.isbn_13 IS NULL;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_timestamp_based_on_status()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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
$function$
;

grant delete on table "public"."ai_conversations" to "postgres";

grant insert on table "public"."ai_conversations" to "postgres";

grant references on table "public"."ai_conversations" to "postgres";

grant select on table "public"."ai_conversations" to "postgres";

grant trigger on table "public"."ai_conversations" to "postgres";

grant truncate on table "public"."ai_conversations" to "postgres";

grant update on table "public"."ai_conversations" to "postgres";

grant delete on table "public"."profiles" to "postgres";

grant insert on table "public"."profiles" to "postgres";

grant references on table "public"."profiles" to "postgres";

grant select on table "public"."profiles" to "postgres";

grant trigger on table "public"."profiles" to "postgres";

grant truncate on table "public"."profiles" to "postgres";

grant update on table "public"."profiles" to "postgres";

grant delete on table "public"."quotes" to "postgres";

grant insert on table "public"."quotes" to "postgres";

grant references on table "public"."quotes" to "postgres";

grant select on table "public"."quotes" to "postgres";

grant trigger on table "public"."quotes" to "postgres";

grant truncate on table "public"."quotes" to "postgres";

grant update on table "public"."quotes" to "postgres";

create policy "blog articles are viewable"
on "public"."blog_articles"
as permissive
for select
to anon, authenticated
using (true);


create policy "books are insertable only by their user"
on "public"."books"
as permissive
for insert
to anon, authenticated
with check (true);


create policy "books are viewable"
on "public"."books"
as permissive
for select
to anon, authenticated
using (true);


create policy "books like are viewable"
on "public"."books_like"
as permissive
for select
to anon, authenticated
using (true);


create policy "libraries are viewable"
on "public"."libraries"
as permissive
for select
to anon, authenticated
using (true);



