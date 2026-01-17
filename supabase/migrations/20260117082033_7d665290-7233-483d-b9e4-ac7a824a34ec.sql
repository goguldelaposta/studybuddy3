-- Fix function search path for is_user_blocked
CREATE OR REPLACE FUNCTION public.is_user_blocked(checker_id UUID, target_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.blocked_users
    WHERE (blocker_id = checker_id AND blocked_id = target_id)
       OR (blocker_id = target_id AND blocked_id = checker_id)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;