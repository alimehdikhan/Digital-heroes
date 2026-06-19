-- ================================================================
-- Migration 001: profiles
-- Extends auth.users with app-specific fields
-- ================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id                      UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name                    TEXT        NOT NULL,
  avatar_url              TEXT,
  role                    TEXT        NOT NULL DEFAULT 'user'
                            CHECK (role IN ('user', 'admin', 'super_admin')),

  -- Subscription (synced from Stripe via webhook)
  subscription_status     TEXT        NOT NULL DEFAULT 'inactive'
                            CHECK (subscription_status IN
                              ('active','inactive','cancelled','trialing','past_due')),
  subscription_plan       TEXT        CHECK (subscription_plan IN ('monthly','yearly')),
  subscription_expires_at TIMESTAMPTZ,

  -- Stripe identifiers
  stripe_customer_id      TEXT        UNIQUE,
  stripe_subscription_id  TEXT        UNIQUE,

  -- Future: org / multi-country
  org_id                  UUID,       -- FK added in migration 006
  country_code            TEXT        NOT NULL DEFAULT 'GB',
  currency                TEXT        NOT NULL DEFAULT 'GBP',

  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-set updated_at on every update
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role
  ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status
  ON profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer
  ON profiles(stripe_customer_id);
