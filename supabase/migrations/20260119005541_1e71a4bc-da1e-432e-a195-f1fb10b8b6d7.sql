-- Add automatic_criteria column to badges table for automation rules
ALTER TABLE public.badges ADD COLUMN IF NOT EXISTS automatic_criteria text DEFAULT NULL;

-- Add is_manual column to distinguish manual from automatic badges
ALTER TABLE public.badges ADD COLUMN IF NOT EXISTS is_manual boolean DEFAULT false;

-- Clear existing badges and insert the required ones
DELETE FROM public.user_badges;
DELETE FROM public.badges;

-- Insert the required badges
INSERT INTO public.badges (name, icon, color, description, category, is_manual, automatic_criteria) VALUES
  ('Fondator', 'crown', 'gold', 'Membru fondator al platformei', 'special', true, NULL),
  ('Moderator', 'shield-check', 'blue', 'Moderator oficial al platformei', 'special', true, NULL),
  ('Verified', 'user-check', 'cyan', 'Email verificat cu succes', 'milestone', false, 'email_verified'),
  ('Top Contribuitor', 'book-open', 'green', 'A încărcat peste 10 notițe pe platformă', 'contribution', false, 'notes_count_10'),
  ('Activ', 'flame', 'orange', 'Membru activ de peste 30 de zile', 'milestone', false, 'account_age_30');

-- Enable RLS policies for admin badge management
CREATE POLICY "Admins can insert badges" ON public.badges FOR INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins can update badges" ON public.badges FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Admins can delete badges" ON public.badges FOR DELETE USING (is_admin(auth.uid()));

-- Allow admins to manage user badges
CREATE POLICY "Admins can insert user badges" ON public.user_badges FOR INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins can delete user badges" ON public.user_badges FOR DELETE USING (is_admin(auth.uid()));

-- Update the check_and_award_badges function to handle new automatic criteria
CREATE OR REPLACE FUNCTION public.check_and_award_badges(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_id uuid;
  v_notes_count integer;
  v_account_age_days integer;
  v_badge record;
BEGIN
  -- Get the profile id
  SELECT id INTO v_profile_id FROM profiles WHERE user_id = p_user_id;
  IF v_profile_id IS NULL THEN
    RETURN;
  END IF;

  -- Count user's notes
  SELECT COUNT(*) INTO v_notes_count FROM notes WHERE user_id = p_user_id;

  -- Calculate account age in days
  SELECT EXTRACT(DAY FROM (NOW() - created_at))::integer INTO v_account_age_days 
  FROM profiles WHERE user_id = p_user_id;

  -- Loop through automatic badges
  FOR v_badge IN SELECT * FROM badges WHERE is_manual = false AND automatic_criteria IS NOT NULL LOOP
    -- Skip if user already has this badge
    IF EXISTS (SELECT 1 FROM user_badges WHERE user_id = p_user_id AND badge_id = v_badge.id) THEN
      CONTINUE;
    END IF;

    -- Check each automatic criteria
    CASE v_badge.automatic_criteria
      WHEN 'notes_count_10' THEN
        IF v_notes_count >= 10 THEN
          INSERT INTO user_badges (user_id, badge_id) VALUES (p_user_id, v_badge.id);
        END IF;
      WHEN 'account_age_30' THEN
        IF v_account_age_days >= 30 THEN
          INSERT INTO user_badges (user_id, badge_id) VALUES (p_user_id, v_badge.id);
        END IF;
      ELSE
        -- Other criteria will be handled by edge functions or triggers
        NULL;
    END CASE;
  END LOOP;
END;
$$;

-- Create a function to award verified badge when email is confirmed
-- This will be called from an edge function that monitors auth state
CREATE OR REPLACE FUNCTION public.award_verified_badge(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_badge_id uuid;
BEGIN
  -- Get the Verified badge id
  SELECT id INTO v_badge_id FROM badges WHERE automatic_criteria = 'email_verified' LIMIT 1;
  
  IF v_badge_id IS NULL THEN
    RETURN false;
  END IF;

  -- Check if user already has this badge
  IF EXISTS (SELECT 1 FROM user_badges WHERE user_id = p_user_id AND badge_id = v_badge_id) THEN
    RETURN false;
  END IF;

  -- Award the badge
  INSERT INTO user_badges (user_id, badge_id) VALUES (p_user_id, v_badge_id);
  RETURN true;
END;
$$;