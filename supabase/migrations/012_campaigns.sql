-- ================================================================
-- Migration 012: Campaigns
-- Adds campaign module for extensibility
-- ================================================================

CREATE TABLE IF NOT EXISTS campaigns (
  id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                  UUID        REFERENCES organizations(id) ON DELETE CASCADE,
  name                    TEXT        NOT NULL,
  description             TEXT,
  start_date              TIMESTAMPTZ NOT NULL,
  end_date                TIMESTAMPTZ,
  target_amount           NUMERIC     DEFAULT 0,
  is_active               BOOLEAN     DEFAULT true,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Link scores to campaigns
ALTER TABLE scores
ADD COLUMN campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_campaigns_org ON campaigns(org_id);
CREATE INDEX IF NOT EXISTS idx_scores_campaign ON scores(campaign_id);

-- Auto-set updated_at on every update
CREATE TRIGGER trg_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
