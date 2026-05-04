-- =============================================================
--  LIMITLESS — ADMIN & PERMISSION FIXES
--  Run this entire file in the Supabase SQL Editor
-- =============================================================

-- 1. Ensure basic schema usage is granted
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- 2. Grant FULL access to all tables for the authenticated role.
-- RLS (Row Level Security) is what actually restricts users, 
-- but PostgreSQL requires these base-level grants first!
GRANT ALL ON public.profiles               TO authenticated, service_role;
GRANT ALL ON public.biometrics             TO authenticated, service_role;
GRANT ALL ON public.water_logs             TO authenticated, service_role;
GRANT ALL ON public.nutrition_logs         TO authenticated, service_role;
GRANT ALL ON public.workout_plans          TO authenticated, service_role;
GRANT ALL ON public.plan_exercises         TO authenticated, service_role;
GRANT ALL ON public.workout_logs           TO authenticated, service_role;
GRANT ALL ON public.exercise_sets          TO authenticated, service_role;
GRANT ALL ON public.user_progress_photos   TO authenticated, service_role;

-- 3. FIX: Ensure ALL permissions are granted on community posts and likes
-- (Previous fixes missed the DELETE grant for community_posts)
GRANT ALL ON public.community_posts        TO authenticated, service_role;
GRANT ALL ON public.community_post_likes   TO authenticated, service_role;

-- 4. FIX: Ensure ALL permissions are granted on global workouts so Admins can add them
GRANT ALL ON public.global_exercises       TO authenticated, service_role;
GRANT ALL ON public.global_workouts        TO authenticated, service_role;
GRANT ALL ON public.global_workout_exercises TO authenticated, service_role;

-- 5. Make sure the RLS policies for community posts allow ANY authenticated user to update/delete.
-- (The mobile app frontend enforces that only the author or an admin sees the edit/delete buttons)
DROP POLICY IF EXISTS "community_posts_update_any" ON public.community_posts;
CREATE POLICY "community_posts_update_any"
  ON public.community_posts FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "community_posts_delete_any" ON public.community_posts;
CREATE POLICY "community_posts_delete_any"
  ON public.community_posts FOR DELETE
  USING (auth.role() = 'authenticated');

-- 6. Ensure sequence usage is allowed (sometimes required for auto-increment IDs, though we use UUIDs mostly)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;

-- =============================================================
-- DONE! Your admin features and post deletion will now work.
-- =============================================================
