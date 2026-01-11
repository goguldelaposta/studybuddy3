-- Create friendships table for friend connections
CREATE TABLE public.friendships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL,
  addressee_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(requester_id, addressee_id)
);

-- Enable RLS
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Users can view friendships they are part of
CREATE POLICY "Users can view their own friendships"
ON public.friendships
FOR SELECT
USING (auth.uid()::text = requester_id::text OR auth.uid()::text = addressee_id::text);

-- Users can send friend requests
CREATE POLICY "Users can send friend requests"
ON public.friendships
FOR INSERT
WITH CHECK (auth.uid()::text = requester_id::text);

-- Users can update friendships they are addressee of (accept/reject)
CREATE POLICY "Addressee can respond to friend requests"
ON public.friendships
FOR UPDATE
USING (auth.uid()::text = addressee_id::text);

-- Users can delete their own friend requests or remove accepted friends
CREATE POLICY "Users can delete their friendships"
ON public.friendships
FOR DELETE
USING (auth.uid()::text = requester_id::text OR auth.uid()::text = addressee_id::text);

-- Create trigger to update updated_at
CREATE TRIGGER update_friendships_updated_at
BEFORE UPDATE ON public.friendships
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for friendships
ALTER PUBLICATION supabase_realtime ADD TABLE public.friendships;

-- Create helper function to check if users are friends
CREATE OR REPLACE FUNCTION public.are_friends(user1_id UUID, user2_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY INVOKER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.friendships
    WHERE status = 'accepted'
    AND (
      (requester_id = user1_id AND addressee_id = user2_id)
      OR (requester_id = user2_id AND addressee_id = user1_id)
    )
  );
$$;