-- ================================================================
-- Migration 006: organizations + organization_members
-- Future: team accounts, corporate billing, seat management
-- ================================================================

CREATE TABLE IF NOT EXISTS organizations (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT         NOT NULL CHECK (char_length(name) >= 2),
  slug          TEXT         NOT NULL UNIQUE,
  logo_url      TEXT,
  country_code  TEXT         NOT NULL DEFAULT 'GB',
  billing_email TEXT,
  plan          TEXT         NOT NULL DEFAULT 'team'
                  CHECK (plan IN ('team','corporate','enterprise')),
  seat_limit    INTEGER      CHECK (seat_limit > 0),

  -- Org-level Stripe
  stripe_customer_id      TEXT UNIQUE,
  stripe_subscription_id  TEXT UNIQUE,
  subscription_status     TEXT NOT NULL DEFAULT 'inactive'
                            CHECK (subscription_status IN
                              ('active','inactive','cancelled','trialing','past_due')),

  is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS organization_members (
  id        UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id    UUID         NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id   UUID         NOT NULL REFERENCES profiles(id)      ON DELETE CASCADE,
  org_role  TEXT         NOT NULL DEFAULT 'member'
              CHECK (org_role IN ('owner','admin','member')),
  joined_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_org_member UNIQUE (org_id, user_id)
);

-- FK back to profiles (deferred so migrations can run in order)
ALTER TABLE profiles
  ADD CONSTRAINT fk_profiles_org
  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_org_members_org  ON organization_members(org_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members(user_id);

CREATE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
