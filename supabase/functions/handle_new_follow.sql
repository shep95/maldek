CREATE OR REPLACE FUNCTION public.handle_new_follow()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Insert a notification for the new follow
  INSERT INTO notifications (recipient_id, actor_id, type, post_id)
  VALUES (NEW.following_id, NEW.follower_id, 'new_follow', NEW.following_id::text);
  RETURN NEW;
END;
$function$;