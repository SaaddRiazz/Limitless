-- =============================================================
--  LIMITLESS — DATABASE FIXES (Run in Supabase SQL Editor)
--  Fixes 4 runtime errors found during testing
-- =============================================================

-- =============================================================
--  FIX 1: Grant base PostgreSQL privileges to authenticated role
--
--  WHY: RLS policies are a second layer of protection. The first
--  layer is PostgreSQL-level table grants. Without GRANT, the
--  'authenticated' role gets "permission denied" even if RLS
--  would allow the operation.
--  Errors fixed:
--    - "permission denied for table profiles"
--    - "permission denied for table global_workouts"
--    (and proactively fixing all other tables too)
-- =============================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Core user tables
GRANT ALL ON public.profiles               TO authenticated, service_role;
GRANT ALL ON public.biometrics             TO authenticated, service_role;
GRANT ALL ON public.water_logs             TO authenticated, service_role;
GRANT ALL ON public.nutrition_logs         TO authenticated, service_role;
GRANT ALL ON public.workout_plans          TO authenticated, service_role;
GRANT ALL ON public.plan_exercises         TO authenticated, service_role;
GRANT ALL ON public.workout_logs           TO authenticated, service_role;
GRANT ALL ON public.exercise_sets          TO authenticated, service_role;
GRANT ALL ON public.user_progress_photos   TO authenticated, service_role;

-- Global/shared tables
GRANT SELECT, INSERT, UPDATE ON public.global_exercises         TO authenticated;
GRANT ALL                    ON public.global_exercises         TO service_role;
GRANT ALL ON public.global_workouts                             TO authenticated, service_role;
GRANT ALL ON public.global_workout_exercises                    TO authenticated, service_role;

-- Community tables
GRANT SELECT, INSERT, UPDATE ON public.community_posts          TO authenticated;
GRANT ALL                    ON public.community_posts          TO service_role;
GRANT SELECT, INSERT, DELETE ON public.community_post_likes     TO authenticated;
GRANT ALL                    ON public.community_post_likes     TO service_role;

-- Allow anon to read public content (optional, safe)
GRANT SELECT ON public.global_workouts         TO anon;
GRANT SELECT ON public.global_workout_exercises TO anon;
GRANT SELECT ON public.global_exercises        TO anon;

-- =============================================================
--  FIX 2: Fix community_posts → profiles foreign key
--
--  WHY: The PostgREST query `.select("*, profiles(username, avatar_url)")`
--  uses the FK to determine the join target. If the FK points to
--  auth.users (not public.profiles), PostgREST can't resolve
--  "profiles" and throws:
--    "Could not find a relationship between community_posts and profiles"
--
--  Fix: Drop the FK to auth.users, replace with FK to public.profiles.
--  Data integrity is maintained because profiles.id = auth.users.id.
-- =============================================================

ALTER TABLE public.community_posts
  DROP CONSTRAINT IF EXISTS community_posts_user_id_fkey;

ALTER TABLE public.community_posts
  ADD CONSTRAINT community_posts_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES public.profiles(id)
  ON DELETE CASCADE;

-- Apply the same fix to other tables that use .select("*, profiles(...)")
-- so future joins don't break:

ALTER TABLE public.community_post_likes
  DROP CONSTRAINT IF EXISTS community_post_likes_user_id_fkey;

ALTER TABLE public.community_post_likes
  ADD CONSTRAINT community_post_likes_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES public.profiles(id)
  ON DELETE CASCADE;

-- =============================================================
--  FIX 3: Ensure the handle_new_user trigger has correct grants
--
--  WHY: The trigger runs as SECURITY DEFINER (postgres role) so
--  it bypasses RLS and can insert into profiles. But the client-
--  side upsert in sign-up.tsx also needs INSERT permission.
--  This ensures both paths work.
-- =============================================================

-- Re-grant INSERT on profiles explicitly (already covered by FIX 1,
-- but be explicit for sign-up flow clarity)
GRANT INSERT ON public.profiles TO authenticated;

-- Ensure the trigger function owner has full access
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

-- =============================================================
--  FIX 4: Proactive — fix user_progress_photos FK to profiles
--  (prevents future relationship errors in photos-log)
-- =============================================================

ALTER TABLE public.user_progress_photos
  DROP CONSTRAINT IF EXISTS user_progress_photos_user_id_fkey;

ALTER TABLE public.user_progress_photos
  ADD CONSTRAINT user_progress_photos_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES public.profiles(id)
  ON DELETE CASCADE;

-- =============================================================
--  FIX 5: Proactive — fix remaining tables' user_id FK to profiles
--  (so any future joined selects like biometrics(profiles(...)) work)
-- =============================================================

ALTER TABLE public.biometrics
  DROP CONSTRAINT IF EXISTS biometrics_user_id_fkey;
ALTER TABLE public.biometrics
  ADD CONSTRAINT biometrics_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.water_logs
  DROP CONSTRAINT IF EXISTS water_logs_user_id_fkey;
ALTER TABLE public.water_logs
  ADD CONSTRAINT water_logs_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.nutrition_logs
  DROP CONSTRAINT IF EXISTS nutrition_logs_user_id_fkey;
ALTER TABLE public.nutrition_logs
  ADD CONSTRAINT nutrition_logs_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.workout_plans
  DROP CONSTRAINT IF EXISTS workout_plans_user_id_fkey;
ALTER TABLE public.workout_plans
  ADD CONSTRAINT workout_plans_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.plan_exercises
  DROP CONSTRAINT IF EXISTS plan_exercises_user_id_fkey;
ALTER TABLE public.plan_exercises
  ADD CONSTRAINT plan_exercises_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.workout_logs
  DROP CONSTRAINT IF EXISTS workout_logs_user_id_fkey;
ALTER TABLE public.workout_logs
  ADD CONSTRAINT workout_logs_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.exercise_sets
  DROP CONSTRAINT IF EXISTS exercise_sets_user_id_fkey;
ALTER TABLE public.exercise_sets
  ADD CONSTRAINT exercise_sets_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- =============================================================
--  DONE
--  After running this file:
--  1. Sign out and sign back in on the device to clear stale tokens
--  2. Generate a new Gemini API key at https://aistudio.google.com
--     and update EXPO_PUBLIC_GEMINI_API_KEY in your .env file
-- =============================================================
