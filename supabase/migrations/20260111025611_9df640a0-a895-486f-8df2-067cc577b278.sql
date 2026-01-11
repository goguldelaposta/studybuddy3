-- Create badges table for profile ranks
CREATE TABLE public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'blue',
  category TEXT NOT NULL DEFAULT 'achievement',
  points_required INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_badges junction table
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Enable RLS
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Badges are publicly viewable
CREATE POLICY "Badges are viewable by everyone"
ON public.badges
FOR SELECT
USING (true);

-- User badges are viewable by everyone
CREATE POLICY "User badges are viewable by everyone"
ON public.user_badges
FOR SELECT
USING (true);

-- Only system can insert/update badges (via service role)
-- Users can earn badges through triggers/functions

-- Insert default badges
INSERT INTO public.badges (name, description, icon, color, category, points_required) VALUES
  ('Nou Venit', 'Te-ai alăturat comunității StudyBuddy', 'baby', 'blue', 'milestone', 0),
  ('Profil Complet', 'Ai completat toate informațiile din profil', 'user-check', 'green', 'achievement', 0),
  ('Primul Prieten', 'Ai făcut primul tău prieten pe platformă', 'user-plus', 'purple', 'social', 0),
  ('Social Butterfly', 'Ai cel puțin 5 prieteni', 'users', 'pink', 'social', 0),
  ('Networking Pro', 'Ai cel puțin 15 prieteni', 'network', 'amber', 'social', 0),
  ('Conversaționist', 'Ai trimis primul tău mesaj', 'message-circle', 'teal', 'communication', 0),
  ('Comunicator Activ', 'Ai trimis cel puțin 50 de mesaje', 'messages-square', 'cyan', 'communication', 0),
  ('Lider de Grup', 'Ai creat un grup de studiu', 'crown', 'amber', 'leadership', 0),
  ('Colaborator', 'Ești membru în cel puțin 3 grupuri', 'handshake', 'emerald', 'collaboration', 0),
  ('Contributor', 'Ai postat un anunț', 'megaphone', 'orange', 'contribution', 0),
  ('Veterean', 'Ești pe platformă de cel puțin 30 de zile', 'award', 'gold', 'milestone', 0),
  ('Early Adopter', 'Te-ai înregistrat în primele luni ale platformei', 'rocket', 'violet', 'special', 0);

-- Create function to award badge to user
CREATE OR REPLACE FUNCTION public.award_badge(p_user_id UUID, p_badge_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_badge_id UUID;
BEGIN
  -- Get badge ID
  SELECT id INTO v_badge_id FROM public.badges WHERE name = p_badge_name;
  
  IF v_badge_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Try to insert (will fail silently if already exists due to unique constraint)
  INSERT INTO public.user_badges (user_id, badge_id)
  VALUES (p_user_id, v_badge_id)
  ON CONFLICT (user_id, badge_id) DO NOTHING;
  
  RETURN TRUE;
END;
$$;

-- Create function to check and award badges based on activity
CREATE OR REPLACE FUNCTION public.check_and_award_badges(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_friend_count INTEGER;
  v_message_count INTEGER;
  v_group_count INTEGER;
  v_created_group_count INTEGER;
  v_announcement_count INTEGER;
  v_profile_complete BOOLEAN;
  v_days_on_platform INTEGER;
BEGIN
  -- Count friends
  SELECT COUNT(*) INTO v_friend_count
  FROM public.friendships
  WHERE status = 'accepted'
  AND (requester_id = p_user_id OR addressee_id = p_user_id);
  
  -- Count messages
  SELECT COUNT(*) INTO v_message_count
  FROM public.messages
  WHERE sender_id = p_user_id;
  
  -- Count group memberships
  SELECT COUNT(*) INTO v_group_count
  FROM public.group_members
  WHERE user_id = p_user_id;
  
  -- Count created groups
  SELECT COUNT(*) INTO v_created_group_count
  FROM public.groups
  WHERE created_by = p_user_id;
  
  -- Count announcements
  SELECT COUNT(*) INTO v_announcement_count
  FROM public.announcements
  WHERE user_id = p_user_id;
  
  -- Check profile completeness
  SELECT (bio IS NOT NULL AND bio != '' AND avatar_url IS NOT NULL) INTO v_profile_complete
  FROM public.profiles
  WHERE user_id = p_user_id;
  
  -- Calculate days on platform
  SELECT EXTRACT(DAY FROM (now() - created_at))::INTEGER INTO v_days_on_platform
  FROM public.profiles
  WHERE user_id = p_user_id;
  
  -- Award badges based on criteria
  IF v_friend_count >= 1 THEN
    PERFORM public.award_badge(p_user_id, 'Primul Prieten');
  END IF;
  
  IF v_friend_count >= 5 THEN
    PERFORM public.award_badge(p_user_id, 'Social Butterfly');
  END IF;
  
  IF v_friend_count >= 15 THEN
    PERFORM public.award_badge(p_user_id, 'Networking Pro');
  END IF;
  
  IF v_message_count >= 1 THEN
    PERFORM public.award_badge(p_user_id, 'Conversaționist');
  END IF;
  
  IF v_message_count >= 50 THEN
    PERFORM public.award_badge(p_user_id, 'Comunicator Activ');
  END IF;
  
  IF v_created_group_count >= 1 THEN
    PERFORM public.award_badge(p_user_id, 'Lider de Grup');
  END IF;
  
  IF v_group_count >= 3 THEN
    PERFORM public.award_badge(p_user_id, 'Colaborator');
  END IF;
  
  IF v_announcement_count >= 1 THEN
    PERFORM public.award_badge(p_user_id, 'Contributor');
  END IF;
  
  IF v_profile_complete THEN
    PERFORM public.award_badge(p_user_id, 'Profil Complet');
  END IF;
  
  IF v_days_on_platform >= 30 THEN
    PERFORM public.award_badge(p_user_id, 'Veterean');
  END IF;
END;
$$;