-- Add DELETE policy for conversations
-- Users can delete conversations where they are a participant
CREATE POLICY "Users can delete their own conversations"
ON public.conversations
FOR DELETE
USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- Add DELETE policy for messages
-- Users can delete messages they sent
CREATE POLICY "Users can delete their own messages"
ON public.messages
FOR DELETE
USING (auth.uid() = sender_id);