-- Add RLS policy to allow message recipients to mark messages as read
-- Recipients are conversation participants who are NOT the sender

CREATE POLICY "Recipients can mark messages as read" 
ON public.messages 
FOR UPDATE 
USING (
  -- User must be a participant in the conversation but NOT the sender
  sender_id != auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id
    AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
  )
)
WITH CHECK (
  -- Same condition for the new row
  sender_id != auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id
    AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
  )
);