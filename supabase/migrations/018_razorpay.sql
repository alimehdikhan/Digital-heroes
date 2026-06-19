-- ================================================================
-- Migration 018: Swap Stripe for Razorpay
-- Renames stripe identifiers to razorpay identifiers
-- ================================================================

-- Rename in profiles table
ALTER TABLE profiles RENAME COLUMN stripe_customer_id TO razorpay_customer_id;
ALTER TABLE profiles RENAME COLUMN stripe_subscription_id TO razorpay_subscription_id;

-- Drop old stripe indexes
DROP INDEX IF EXISTS idx_profiles_stripe_customer;

-- Create new razorpay indexes
CREATE INDEX IF NOT EXISTS idx_profiles_razorpay_customer
  ON profiles(razorpay_customer_id);

-- Rename in organizations table (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='organizations' AND column_name='stripe_customer_id') THEN
    ALTER TABLE organizations RENAME COLUMN stripe_customer_id TO razorpay_customer_id;
    ALTER TABLE organizations RENAME COLUMN stripe_subscription_id TO razorpay_subscription_id;
  END IF;
END $$;
