-- 019_scalability.sql
-- Prepare for Multi-Country, Campaigns, and Teams

-- Multi-Country Expansion
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country_code VARCHAR(2) DEFAULT 'US';
ALTER TABLE draws ADD COLUMN IF NOT EXISTS country_code VARCHAR(2) DEFAULT 'US';

-- Teams / Corporate Accounts
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  billing_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Note: profiles already has org_id. We just add the foreign key.
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS fk_profiles_org;
ALTER TABLE profiles ADD CONSTRAINT fk_profiles_org FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE SET NULL;

-- Campaign Module
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE draws ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL;

-- Remove hardcoded unique month/year assumption that prevents multiple campaigns/countries
ALTER TABLE draws DROP CONSTRAINT IF EXISTS uq_draw_month_year;
ALTER TABLE draws DROP CONSTRAINT IF EXISTS draws_month_year_key;
