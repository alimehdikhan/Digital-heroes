-- ================================================================
-- Migration 013: Subscription Start Date
-- Adds subscription_start_date to profiles
-- ================================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMPTZ;
