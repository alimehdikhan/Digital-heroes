-- ================================================================
-- Migration 003: charities
-- Only one charity active at a time (partial unique index)
-- ================================================================

CREATE TABLE IF NOT EXISTS charities (
  id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT         NOT NULL CHECK (char_length(name) >= 2),
  description         TEXT         CHECK (char_length(description) <= 1000),
  logo_url            TEXT,
  website_url         TEXT,
  registered_number   TEXT,
  is_active           BOOLEAN      NOT NULL DEFAULT FALSE,
  total_contributed   NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (total_contributed >= 0),
  is_deleted          BOOLEAN      NOT NULL DEFAULT FALSE,  -- soft delete
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Enforce only ONE active charity at any time
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_charity
  ON charities (is_active)
  WHERE is_active = TRUE AND is_deleted = FALSE;

CREATE INDEX IF NOT EXISTS idx_charities_active ON charities(is_active);

CREATE TRIGGER trg_charities_updated_at
  BEFORE UPDATE ON charities
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------
-- FUNCTION: increment charity contribution (avoids race conditions)
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION increment_charity_contribution(
  p_charity_id UUID,
  p_amount     NUMERIC
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE charities
  SET    total_contributed = total_contributed + p_amount,
         updated_at        = NOW()
  WHERE  id = p_charity_id;
END;
$$;
