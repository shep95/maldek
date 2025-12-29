-- Allow users to update their own notifications (for marking as read, archiving, deleting)
CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = recipient_id)
WITH CHECK (auth.uid() = recipient_id);

-- Create a trigger function to insert notifications when comments are created
CREATE OR REPLACE FUNCTION public.handle_new_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $function$
DECLARE
  post_owner_id UUID;
BEGIN
  -- Get the post owner's user_id
  SELECT user_id INTO post_owner_id
  FROM posts
  WHERE id = NEW.post_id;
  
  -- Only create notification if the commenter is not the post owner
  IF post_owner_id IS NOT NULL AND post_owner_id != NEW.user_id THEN
    INSERT INTO notifications (recipient_id, actor_id, type, post_id)
    VALUES (post_owner_id, NEW.user_id, 'comment', NEW.post_id);
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create the trigger on comments table
DROP TRIGGER IF EXISTS on_comment_created ON public.comments;
CREATE TRIGGER on_comment_created
  AFTER INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_comment();