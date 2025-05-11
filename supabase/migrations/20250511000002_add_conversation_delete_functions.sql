
-- Create a function to safely delete messages in a conversation
CREATE OR REPLACE FUNCTION public.delete_conversation_messages(conversation_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.messages
  WHERE conversation_id = $1;
END;
$$;

-- Create a function to safely delete a conversation and its participants
CREATE OR REPLACE FUNCTION public.delete_conversation(conversation_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete conversation participants
  DELETE FROM public.conversation_participants
  WHERE conversation_id = $1;
  
  -- Delete the conversation itself
  DELETE FROM public.conversations
  WHERE id = $1;
END;
$$;
