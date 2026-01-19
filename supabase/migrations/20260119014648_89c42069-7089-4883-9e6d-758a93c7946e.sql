-- Trigger pentru 'Geniul Sesiunii' (50 notițe) - extindere trigger existent
CREATE OR REPLACE FUNCTION public.award_notes_badges()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_notes_count integer;
  v_badge_id uuid;
BEGIN
  -- Count user's notes
  SELECT COUNT(*) INTO v_notes_count FROM notes WHERE user_id = NEW.user_id;

  -- Check for 'Boboc' badge (1 note)
  IF v_notes_count >= 1 THEN
    SELECT id INTO v_badge_id FROM badges WHERE name = 'Boboc';
    IF v_badge_id IS NOT NULL THEN
      INSERT INTO user_badges (user_id, badge_id)
      VALUES (NEW.user_id, v_badge_id)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  -- Check for 'Bibliotecar' badge (10 notes)
  IF v_notes_count >= 10 THEN
    SELECT id INTO v_badge_id FROM badges WHERE name = 'Bibliotecar';
    IF v_badge_id IS NOT NULL THEN
      INSERT INTO user_badges (user_id, badge_id)
      VALUES (NEW.user_id, v_badge_id)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  -- Check for 'Geniul Sesiunii' badge (50 notes)
  IF v_notes_count >= 50 THEN
    SELECT id INTO v_badge_id FROM badges WHERE name = 'Geniul Sesiunii';
    IF v_badge_id IS NOT NULL THEN
      INSERT INTO user_badges (user_id, badge_id)
      VALUES (NEW.user_id, v_badge_id)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- Funcție și trigger pentru 'Popular' (100 descărcări totale)
CREATE OR REPLACE FUNCTION public.award_popular_badge()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_total_downloads integer;
  v_badge_id uuid;
  v_note_owner uuid;
BEGIN
  -- Get the note owner
  SELECT user_id INTO v_note_owner FROM notes WHERE id = NEW.id;
  
  IF v_note_owner IS NULL THEN
    RETURN NEW;
  END IF;

  -- Calculate total downloads for all user's notes
  SELECT COALESCE(SUM(downloads), 0) INTO v_total_downloads 
  FROM notes 
  WHERE user_id = v_note_owner;

  -- Check for 'Popular' badge (100 total downloads)
  IF v_total_downloads >= 100 THEN
    SELECT id INTO v_badge_id FROM badges WHERE name = 'Popular';
    IF v_badge_id IS NOT NULL THEN
      INSERT INTO user_badges (user_id, badge_id)
      VALUES (v_note_owner, v_badge_id)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS award_popular_badge_trigger ON notes;

-- Create trigger for downloads update
CREATE TRIGGER award_popular_badge_trigger
AFTER UPDATE OF downloads ON notes
FOR EACH ROW
WHEN (NEW.downloads IS DISTINCT FROM OLD.downloads)
EXECUTE FUNCTION public.award_popular_badge();

-- Funcție și trigger pentru 'Prietenos' (5 prieteni acceptați)
CREATE OR REPLACE FUNCTION public.award_friendly_badge()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_friends_count integer;
  v_badge_id uuid;
  v_user_to_check uuid;
BEGIN
  -- Only proceed if status changed to 'accepted'
  IF NEW.status != 'accepted' THEN
    RETURN NEW;
  END IF;

  -- Check both users involved in the friendship
  FOR v_user_to_check IN 
    SELECT unnest(ARRAY[NEW.requester_id, NEW.addressee_id])
  LOOP
    -- Count accepted friendships for this user
    SELECT COUNT(*) INTO v_friends_count 
    FROM friendships 
    WHERE (requester_id = v_user_to_check OR addressee_id = v_user_to_check) 
      AND status = 'accepted';

    -- Check for 'Prietenos' badge (5 friends)
    IF v_friends_count >= 5 THEN
      SELECT id INTO v_badge_id FROM badges WHERE name = 'Prietenos';
      IF v_badge_id IS NOT NULL THEN
        INSERT INTO user_badges (user_id, badge_id)
        VALUES (v_user_to_check, v_badge_id)
        ON CONFLICT DO NOTHING;
      END IF;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$function$;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS award_friendly_badge_trigger ON friendships;

-- Create trigger for friendships
CREATE TRIGGER award_friendly_badge_trigger
AFTER INSERT OR UPDATE OF status ON friendships
FOR EACH ROW
EXECUTE FUNCTION public.award_friendly_badge();