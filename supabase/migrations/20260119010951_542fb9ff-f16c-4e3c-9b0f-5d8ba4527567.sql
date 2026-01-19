-- Update the check_and_award_badges function to handle all new automatic criteria
CREATE OR REPLACE FUNCTION public.check_and_award_badges(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_id uuid;
  v_notes_count integer;
  v_total_downloads integer;
  v_friends_count integer;
  v_messages_count integer;
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

  -- Count total downloads on user's notes
  SELECT COALESCE(SUM(downloads), 0) INTO v_total_downloads FROM notes WHERE user_id = p_user_id;

  -- Count accepted friendships
  SELECT COUNT(*) INTO v_friends_count 
  FROM friendships 
  WHERE (requester_id = p_user_id OR addressee_id = p_user_id) 
    AND status = 'accepted';

  -- Count messages sent
  SELECT COUNT(*) INTO v_messages_count FROM messages WHERE sender_id = p_user_id;

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
      -- Notes count criteria
      WHEN 'notes_count_1' THEN
        IF v_notes_count >= 1 THEN
          INSERT INTO user_badges (user_id, badge_id) VALUES (p_user_id, v_badge.id);
        END IF;
      WHEN 'notes_count_10' THEN
        IF v_notes_count >= 10 THEN
          INSERT INTO user_badges (user_id, badge_id) VALUES (p_user_id, v_badge.id);
        END IF;
      WHEN 'notes_count_50' THEN
        IF v_notes_count >= 50 THEN
          INSERT INTO user_badges (user_id, badge_id) VALUES (p_user_id, v_badge.id);
        END IF;
      
      -- Downloads criteria
      WHEN 'downloads_100' THEN
        IF v_total_downloads >= 100 THEN
          INSERT INTO user_badges (user_id, badge_id) VALUES (p_user_id, v_badge.id);
        END IF;
      
      -- Friends criteria
      WHEN 'friends_count_5' THEN
        IF v_friends_count >= 5 THEN
          INSERT INTO user_badges (user_id, badge_id) VALUES (p_user_id, v_badge.id);
        END IF;
      
      -- Messages criteria
      WHEN 'messages_count_20' THEN
        IF v_messages_count >= 20 THEN
          INSERT INTO user_badges (user_id, badge_id) VALUES (p_user_id, v_badge.id);
        END IF;
      
      -- Account age criteria
      WHEN 'account_age_30' THEN
        IF v_account_age_days >= 30 THEN
          INSERT INTO user_badges (user_id, badge_id) VALUES (p_user_id, v_badge.id);
        END IF;
      WHEN 'account_age_365' THEN
        IF v_account_age_days >= 365 THEN
          INSERT INTO user_badges (user_id, badge_id) VALUES (p_user_id, v_badge.id);
        END IF;
      
      ELSE
        -- Other criteria (email_verified, night_owl, likes_received_10) handled by edge functions
        NULL;
    END CASE;
  END LOOP;
END;
$$;