-- ================================================================
-- Migration 017: Payout Status Tracking
-- ================================================================

ALTER TABLE draw_winners
ADD COLUMN payout_status TEXT NOT NULL DEFAULT 'pending'
CHECK (payout_status IN ('pending', 'paid', 'failed'));

-- Migrate existing boolean data
UPDATE draw_winners SET payout_status = 'paid' WHERE paid_out = TRUE;

-- Drop the old column
ALTER TABLE draw_winners DROP COLUMN paid_out;
