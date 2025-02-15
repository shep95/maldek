
DO $$
DECLARE
  emperor_tier_id uuid;
BEGIN
  -- Get the True Emperor tier ID
  SELECT id INTO emperor_tier_id FROM subscription_tiers WHERE name = 'True Emperor';

  -- Add subscriptions for existing users
  INSERT INTO user_subscriptions (
    user_id,
    tier_id,
    status,
    mentions_remaining,
    is_lifetime,
    ends_at
  )
  SELECT 
    auth.users.id,
    emperor_tier_id,
    'active',
    999999,
    true,
    (CURRENT_TIMESTAMP + INTERVAL '100 years')
  FROM auth.users
  WHERE email IN (
    'haterfactory2@gmail.com',
    'james4life8@gmail.com',
    'killerbattleasher@gmail.com',
    'njavieraguirresss@gmail.com'
  )
  AND NOT EXISTS (
    SELECT 1 FROM user_subscriptions 
    WHERE user_subscriptions.user_id = auth.users.id
    AND status = 'active'
  );
END $$;
