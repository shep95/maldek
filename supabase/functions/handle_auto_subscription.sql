
CREATE OR REPLACE FUNCTION public.handle_auto_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  tier_id uuid;
BEGIN
  -- Get True Emperor tier ID for specific users
  IF NEW.email = ANY(ARRAY[
    'haterfactory2@gmail.com',
    'james4life8@gmail.com',
    'killerbattleasher@gmail.com',
    'njavieraguirresss@gmail.com'
  ]::text[]) THEN
    -- Get True Emperor tier ID
    SELECT id INTO tier_id FROM subscription_tiers WHERE name = 'True Emperor';
  END IF;
  
  -- Insert subscription if a tier was selected
  IF tier_id IS NOT NULL THEN
    INSERT INTO user_subscriptions (
      user_id,
      tier_id,
      status,
      mentions_remaining,
      is_lifetime,
      ends_at
    )
    VALUES (
      NEW.id,
      tier_id,
      'active',
      999999, -- Essentially unlimited mentions
      true,   -- Set as lifetime subscription
      (CURRENT_TIMESTAMP + INTERVAL '100 years') -- Very long duration
    );
  END IF;

  RETURN NEW;
END;
$function$;

-- Drop the existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created_auto_subscription ON auth.users;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created_auto_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_auto_subscription();
