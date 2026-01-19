
-- 1. Trigger function for notes badges (Boboc, Bibliotecar)
CREATE OR REPLACE FUNCTION public.award_notes_badges()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_notes_count integer;
  v_badge_id uuid;
BEGIN
  -- Count user's notes
  SELECT COUNT(*) INTO v_notes_count FROM notes WHERE user_id = NEW.user_id;

  -- Check for 'Boboc' badge (1 note)
  IF v_notes_count = 1 THEN
    SELECT id INTO v_badge_id FROM badges WHERE name = 'Boboc';
    IF v_badge_id IS NOT NULL THEN
      INSERT INTO user_badges (user_id, badge_id)
      VALUES (NEW.user_id, v_badge_id)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  -- Check for 'Bibliotecar' badge (10 notes)
  IF v_notes_count = 10 THEN
    SELECT id INTO v_badge_id FROM badges WHERE name = 'Bibliotecar';
    IF v_badge_id IS NOT NULL THEN
      INSERT INTO user_badges (user_id, badge_id)
      VALUES (NEW.user_id, v_badge_id)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger on notes table
DROP TRIGGER IF EXISTS trigger_award_notes_badges ON notes;
CREATE TRIGGER trigger_award_notes_badges
  AFTER INSERT ON notes
  FOR EACH ROW
  EXECUTE FUNCTION award_notes_badges();

-- 2. Add unique constraint to prevent duplicate badges
ALTER TABLE user_badges 
  DROP CONSTRAINT IF EXISTS user_badges_user_badge_unique;
ALTER TABLE user_badges 
  ADD CONSTRAINT user_badges_user_badge_unique UNIQUE (user_id, badge_id);

-- 3. Function for awarding veteran badges (to be called by pg_cron)
CREATE OR REPLACE FUNCTION public.award_veteran_badges()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_badge_id uuid;
  v_user record;
BEGIN
  -- Get the 'Veteran (1 An)' badge ID
  SELECT id INTO v_badge_id FROM badges WHERE name = 'Veteran (1 An)';
  
  IF v_badge_id IS NULL THEN
    RETURN;
  END IF;

  -- Find all users with accounts older than 1 year who don't have the badge
  FOR v_user IN 
    SELECT p.user_id 
    FROM profiles p
    WHERE p.created_at < (NOW() - INTERVAL '1 year')
      AND p.user_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM user_badges ub 
        WHERE ub.user_id = p.user_id AND ub.badge_id = v_badge_id
      )
  LOOP
    INSERT INTO user_badges (user_id, badge_id)
    VALUES (v_user.user_id, v_badge_id)
    ON CONFLICT DO NOTHING;
  END LOOP;
END;
$$;

-- 4. Function for awarding verified badge (called from edge function)
CREATE OR REPLACE FUNCTION public.award_verified_badge(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_badge_id uuid;
BEGIN
  -- Get the 'Verified' badge ID
  SELECT id INTO v_badge_id FROM badges WHERE name = 'Verified';
  
  IF v_badge_id IS NULL THEN
    RETURN false;
  END IF;

  -- Check if user already has this badge
  IF EXISTS (SELECT 1 FROM user_badges WHERE user_id = p_user_id AND badge_id = v_badge_id) THEN
    RETURN false;
  END IF;

  -- Award the badge
  INSERT INTO user_badges (user_id, badge_id)
  VALUES (p_user_id, v_badge_id)
  ON CONFLICT DO NOTHING;

  RETURN true;
END;
$$;
