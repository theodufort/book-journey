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


