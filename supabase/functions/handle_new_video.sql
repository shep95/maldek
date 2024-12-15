CREATE OR REPLACE FUNCTION public.handle_new_video()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert notifications for all followers
  INSERT INTO notifications (recipient_id, actor_id, type, post_id)
  SELECT 
    follower_id,
    NEW.user_id,
    'new_video',
    NEW.id
  FROM followers
  WHERE following_id = NEW.user_id;
  
  RETURN NEW;
END;
$$;