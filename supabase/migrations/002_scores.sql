-- ================================================================
-- Migration 002: scores
-- Stableford score records, max 5 per user enforced by trigger
-- ================================================================

CREATE TABLE IF NOT EXISTS scores (
  id          UUID     PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID     NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score       SMALLINT NOT NULL CHECK (score >= 1 AND score <= 45),
  date        DATE     NOT NULL,
  notes       TEXT     CHECK (char_length(notes) <= 500),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Business rule: one score per user per date
  CONSTRAINT uq_score_user_date UNIQUE (user_id, date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_scores_user_id      ON scores(user_id);
CREATE INDEX IF NOT EXISTS idx_scores_date         ON scores(date);
CREATE INDEX IF NOT EXISTS idx_scores_user_date    ON scores(user_id, date DESC);

-- ----------------------------------------------------------------
-- TRIGGER: Enforce max 5 scores per user
-- After every insert, delete any scores beyond 5 (oldest by date)
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION enforce_max_five_scores()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  DELETE FROM scores
  WHERE id IN (
    SELECT id
    FROM   scores
    WHERE  user_id = NEW.user_id
    ORDER  BY date DESC
    OFFSET 5
  );
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_max_scores
  AFTER INSERT ON scores
  FOR EACH ROW EXECUTE FUNCTION enforce_max_five_scores();
