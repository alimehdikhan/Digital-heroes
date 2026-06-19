-- ================================================================
-- Migration 015: Add charity percentage
-- ================================================================

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS charity_percentage NUMERIC(5,2) NOT NULL DEFAULT 10.00
CHECK (charity_percentage >= 10.00);
