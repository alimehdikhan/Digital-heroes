-- ================================================================
-- Seed Data — Development Only
-- Run AFTER all migrations in a local Supabase instance
-- ================================================================

-- Sample charities
INSERT INTO charities (name, description, logo_url, website_url, is_active, total_contributed) VALUES
  ('Golf Foundation', 'Introducing more people to golf across the UK.', NULL, 'https://golf-foundation.org.uk', TRUE, 2450.00),
  ('Macmillan Cancer Support', 'Supporting people living with cancer.', NULL, 'https://www.macmillan.org.uk', FALSE, 1200.00),
  ('Children in Need', 'Helping disadvantaged children across the UK.', NULL, 'https://www.bbcchildreninneed.co.uk', FALSE, 800.00);

-- Demo accounts (PRD test credentials): run from project root:
--   npm run seed:demo
-- Creates hero@digitalheroes.test / Hero1234! and admin@digitalheroes.test / Admin1234!

-- Sample draw (completed, no jackpot winner — rollover)
-- INSERT INTO draws (month, year, mode, winning_numbers, total_pool, jackpot_amount,
--   prize_4match, prize_3match, jackpot_rolled_over, charity_contribution,
--   participant_count, status, run_at)
-- VALUES (5, 2026, 'random', '{12,23,34,7,41}', 500.00, 270.00,
--   112.50, 67.50, TRUE, 50.00, 18, 'completed', NOW() - INTERVAL '30 days');
