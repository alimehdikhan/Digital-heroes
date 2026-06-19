-- ================================================================
-- Migration 005: winner_proofs
-- Winner proof upload with admin approval workflow
-- ================================================================

CREATE TABLE IF NOT EXISTS winner_proofs (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_winner_id  UUID         NOT NULL REFERENCES draw_winners(id) ON DELETE CASCADE,
  user_id         UUID         NOT NULL REFERENCES profiles(id)     ON DELETE CASCADE,
  draw_id         UUID         NOT NULL REFERENCES draws(id)        ON DELETE CASCADE,

  -- Supabase Storage
  proof_url       TEXT         NOT NULL,
  storage_path    TEXT         NOT NULL,  -- path within the bucket
  file_name       TEXT,
  file_size       INTEGER      CHECK (file_size > 0),
  mime_type       TEXT,

  -- Admin review
  status          TEXT         NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','approved','rejected')),
  admin_note      TEXT         CHECK (char_length(admin_note) <= 500),
  reviewed_by     UUID         REFERENCES profiles(id),
  reviewed_at     TIMESTAMPTZ,

  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  -- One proof per draw winner
  CONSTRAINT uq_proof_per_winner UNIQUE (draw_winner_id)
);

CREATE INDEX IF NOT EXISTS idx_proofs_status    ON winner_proofs(status);
CREATE INDEX IF NOT EXISTS idx_proofs_user      ON winner_proofs(user_id);
CREATE INDEX IF NOT EXISTS idx_proofs_draw      ON winner_proofs(draw_id);
