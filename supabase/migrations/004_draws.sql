-- ================================================================
-- Migration 004: draws + draw_winners
-- Monthly draw records with 3-tier winners and jackpot rollover
-- ================================================================

CREATE TABLE IF NOT EXISTS draws (
  id                    UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  month                 SMALLINT      NOT NULL CHECK (month BETWEEN 1 AND 12),
  year                  SMALLINT      NOT NULL CHECK (year >= 2024),
  mode                  TEXT          NOT NULL CHECK (mode IN ('random','algorithmic')),

  -- The 5 drawn winning numbers (each 1–45)
  winning_numbers       SMALLINT[]    NOT NULL,

  -- Prize pool breakdown
  total_pool            NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (total_pool >= 0),
  jackpot_amount        NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (jackpot_amount >= 0),
  prize_4match          NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (prize_4match >= 0),
  prize_3match          NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (prize_3match >= 0),

  -- Jackpot rollover
  jackpot_rolled_over   BOOLEAN       NOT NULL DEFAULT FALSE,
  rollover_from_draw_id UUID          REFERENCES draws(id),
  rollover_amount       NUMERIC(12,2) NOT NULL DEFAULT 0,

  -- Charity
  charity_id            UUID          REFERENCES charities(id),
  charity_contribution  NUMERIC(12,2) NOT NULL DEFAULT 0,
  charity_percentage    NUMERIC(5,2)  NOT NULL DEFAULT 10.00
                          CHECK (charity_percentage >= 10),

  -- Metadata
  participant_count     INTEGER       NOT NULL DEFAULT 0,
  status                TEXT          NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending','in_progress','completed','cancelled')),
  run_by                UUID          REFERENCES profiles(id),
  run_at                TIMESTAMPTZ,
  created_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  -- Business rule: one draw per calendar month
  CONSTRAINT uq_draw_month_year UNIQUE (month, year)
);

CREATE INDEX IF NOT EXISTS idx_draws_status     ON draws(status);
CREATE INDEX IF NOT EXISTS idx_draws_month_year ON draws(year DESC, month DESC);
CREATE INDEX IF NOT EXISTS idx_draws_charity    ON draws(charity_id);

-- ----------------------------------------------------------------
-- Draw winners (one row per winner per tier per draw)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS draw_winners (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id         UUID          NOT NULL REFERENCES draws(id)    ON DELETE CASCADE,
  user_id         UUID          NOT NULL REFERENCES profiles(id)  ON DELETE CASCADE,
  tier            TEXT          NOT NULL CHECK (tier IN ('jackpot','silver','bronze')),
  match_count     SMALLINT      NOT NULL CHECK (match_count IN (3,4,5)),
  matched_numbers SMALLINT[]    NOT NULL,  -- which of the user's scores matched
  user_scores     SMALLINT[]    NOT NULL,  -- snapshot of scores used in the draw
  amount          NUMERIC(12,2) NOT NULL DEFAULT 0,
  paid_out        BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_draw_winners_draw   ON draw_winners(draw_id);
CREATE INDEX IF NOT EXISTS idx_draw_winners_user   ON draw_winners(user_id);
CREATE INDEX IF NOT EXISTS idx_draw_winners_tier   ON draw_winners(tier);
