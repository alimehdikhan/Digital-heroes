-- ================================================================
-- Migration 011: Add supported_charity_id to profiles
-- Allows users to select a preferred charity to support
-- ================================================================

ALTER TABLE profiles
ADD COLUMN supported_charity_id UUID REFERENCES charities(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_supported_charity ON profiles(supported_charity_id);
