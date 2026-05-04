-- =============================================================
--  LIMITLESS FITNESS APP — SUPABASE DATABASE SCHEMA
--  Run this entire file in the Supabase SQL Editor
-- =============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============================================================
--  STORAGE BUCKETS (cannot be created via SQL — create manually
--  in Supabase Dashboard → Storage → New Bucket)
-- =============================================================
-- Bucket: avatars          (public: true)
-- Bucket: progress_photos  (public: true)
-- Bucket: community_photos (public: true)

-- =============================================================
--  TABLES
-- =============================================================

-- ---------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    text NOT NULL DEFAULT '',
  avatar_url  text,
  xp          int4 NOT NULL DEFAULT 0,
  level       int4 NOT NULL DEFAULT 1,
  streak      int4 NOT NULL DEFAULT 0,
  updated_at  timestamptz
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_all"
  ON public.profiles FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ---------------------------------------------------------------
-- biometrics
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.biometrics (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight_kg   float8 NOT NULL,
  height_cm   float8 NOT NULL,
  bmi         float8,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.biometrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "biometrics_own"
  ON public.biometrics FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index for fast per-user latest lookups
CREATE INDEX IF NOT EXISTS biometrics_user_created_idx
  ON public.biometrics (user_id, created_at DESC);

-- ---------------------------------------------------------------
-- water_logs
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.water_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_ml   int4 NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "water_logs_own"
  ON public.water_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS water_logs_user_created_idx
  ON public.water_logs (user_id, created_at DESC);

-- ---------------------------------------------------------------
-- nutrition_logs
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.nutrition_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  food_name   text NOT NULL,
  description text,
  calories    int4 NOT NULL DEFAULT 0,
  meal_type   text NOT NULL CHECK (meal_type IN ('Breakfast', 'Lunch', 'Dinner', 'Snacks')),
  logged_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.nutrition_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "nutrition_logs_own"
  ON public.nutrition_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS nutrition_logs_user_logged_idx
  ON public.nutrition_logs (user_id, logged_at DESC);

-- ---------------------------------------------------------------
-- workout_plans
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.workout_plans (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text NOT NULL,
  description text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workout_plans_own"
  ON public.workout_plans FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------
-- plan_exercises
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.plan_exercises (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id         uuid NOT NULL REFERENCES public.workout_plans(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_name   text NOT NULL,
  target_sets     int4 NOT NULL DEFAULT 3,
  target_reps     int4 NOT NULL DEFAULT 10,
  target_weight   float8,
  order_index     int4 NOT NULL DEFAULT 0
);

ALTER TABLE public.plan_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "plan_exercises_own"
  ON public.plan_exercises FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS plan_exercises_plan_idx
  ON public.plan_exercises (plan_id, order_index);

-- ---------------------------------------------------------------
-- workout_logs
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.workout_logs (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id          uuid REFERENCES public.workout_plans(id) ON DELETE SET NULL,
  workout_name     text NOT NULL,
  duration_minutes int4 NOT NULL DEFAULT 0,
  completed_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workout_logs_own"
  ON public.workout_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS workout_logs_user_completed_idx
  ON public.workout_logs (user_id, completed_at DESC);

-- ---------------------------------------------------------------
-- exercise_sets
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exercise_sets (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_log_id   uuid NOT NULL REFERENCES public.workout_logs(id) ON DELETE CASCADE,
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_name    text NOT NULL,
  set_number       int4 NOT NULL,
  weight           float8 NOT NULL DEFAULT 0,
  reps             int4 NOT NULL DEFAULT 0,
  is_completed     bool NOT NULL DEFAULT false
);

ALTER TABLE public.exercise_sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "exercise_sets_own"
  ON public.exercise_sets FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS exercise_sets_log_idx
  ON public.exercise_sets (workout_log_id);

-- ---------------------------------------------------------------
-- global_exercises
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.global_exercises (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL UNIQUE,
  met_value   float8,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.global_exercises ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read
CREATE POLICY "global_exercises_select"
  ON public.global_exercises FOR SELECT
  USING (auth.role() = 'authenticated');

-- Authenticated users can insert (admin screens handle auth at app level)
CREATE POLICY "global_exercises_insert"
  ON public.global_exercises FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Only service_role can delete
CREATE POLICY "global_exercises_delete"
  ON public.global_exercises FOR DELETE
  USING (auth.role() = 'service_role');

-- ---------------------------------------------------------------
-- global_workouts
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.global_workouts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  description text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.global_workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "global_workouts_all_auth"
  ON public.global_workouts FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ---------------------------------------------------------------
-- global_workout_exercises
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.global_workout_exercises (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id      uuid NOT NULL REFERENCES public.global_workouts(id) ON DELETE CASCADE,
  exercise_name   text NOT NULL,
  target_sets     int4 NOT NULL DEFAULT 3,
  target_reps     int4 NOT NULL DEFAULT 10,
  order_index     int4 NOT NULL DEFAULT 0
);

ALTER TABLE public.global_workout_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "global_workout_exercises_all_auth"
  ON public.global_workout_exercises FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS global_workout_exercises_workout_idx
  ON public.global_workout_exercises (workout_id, order_index);

-- ---------------------------------------------------------------
-- community_posts
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.community_posts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content     text NOT NULL,
  image_url   text,
  likes_count int4 NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can read
CREATE POLICY "community_posts_select"
  ON public.community_posts FOR SELECT
  USING (auth.role() = 'authenticated');

-- Users can only insert their own posts
CREATE POLICY "community_posts_insert_own"
  ON public.community_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own (for likes_count via app)
CREATE POLICY "community_posts_update_any"
  ON public.community_posts FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Any authenticated user can delete (admin moderation handled at app level)
CREATE POLICY "community_posts_delete_any"
  ON public.community_posts FOR DELETE
  USING (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS community_posts_created_idx
  ON public.community_posts (created_at DESC);

-- ---------------------------------------------------------------
-- community_post_likes
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.community_post_likes (
  id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id  uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE (post_id, user_id)
);

ALTER TABLE public.community_post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "community_post_likes_select"
  ON public.community_post_likes FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "community_post_likes_insert_own"
  ON public.community_post_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "community_post_likes_delete_own"
  ON public.community_post_likes FOR DELETE
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------
-- user_progress_photos
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_progress_photos (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url     text NOT NULL,
  storage_path  text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_progress_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_progress_photos_own"
  ON public.user_progress_photos FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS user_progress_photos_user_created_idx
  ON public.user_progress_photos (user_id, created_at DESC);

-- =============================================================
--  AUTO-CREATE PROFILE ON SIGN UP TRIGGER
-- =============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, xp, level, streak)
  VALUES (new.id, '', 0, 1, 0)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if present, then recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- =============================================================
--  END OF SCHEMA
-- =============================================================
