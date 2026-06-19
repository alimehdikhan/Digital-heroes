-- ================================================================
-- Migration 016: Add charity events
-- ================================================================

ALTER TABLE charities
ADD COLUMN IF NOT EXISTS hero_image_url TEXT,
ADD COLUMN IF NOT EXISTS events JSONB DEFAULT '[]'::jsonb;
