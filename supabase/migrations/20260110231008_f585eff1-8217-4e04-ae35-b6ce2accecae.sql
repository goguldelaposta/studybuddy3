-- Create conversations table to track conversations between users
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_1 UUID NOT NULL,
  participant_2 UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_conversation UNIQUE (participant_1, participant_2)
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for conversations
CREATE POLICY "Users can view their own conversations"
ON public.conversations
FOR SELECT
USING (auth.uid()::text IN (participant_1::text, participant_2::text));

CREATE POLICY "Users can create conversations they're part of"
ON public.conversations
FOR INSERT
WITH CHECK (auth.uid()::text IN (participant_1::text, participant_2::text));

CREATE POLICY "Users can update their own conversations"
ON public.conversations
FOR UPDATE
USING (auth.uid()::text IN (participant_1::text, participant_2::text));

-- RLS policies for messages
CREATE POLICY "Users can view messages in their conversations"
ON public.messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c 
    WHERE c.id = conversation_id 
    AND auth.uid()::text IN (c.participant_1::text, c.participant_2::text)
  )
);

CREATE POLICY "Users can send messages in their conversations"
ON public.messages
FOR INSERT
WITH CHECK (
  auth.uid()::text = sender_id::text
  AND EXISTS (
    SELECT 1 FROM public.conversations c 
    WHERE c.id = conversation_id 
    AND auth.uid()::text IN (c.participant_1::text, c.participant_2::text)
  )
);

CREATE POLICY "Users can update messages they sent"
ON public.messages
FOR UPDATE
USING (auth.uid()::text = sender_id::text);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Trigger to update conversation updated_at when message is sent
CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations 
  SET updated_at = now() 
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_message_sent
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_conversation_timestamp();