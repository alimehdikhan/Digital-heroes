-- ================================================================
-- Migration 007: audit_logs
-- Full audit trail for all sensitive actions
-- ================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    UUID         REFERENCES profiles(id) ON DELETE SET NULL,
  action      TEXT         NOT NULL,         -- e.g. 'draw.run', 'proof.approve'
  entity_type TEXT         NOT NULL,         -- e.g. 'draw', 'score', 'proof'
  entity_id   UUID,
  old_values  JSONB,                         -- before state (for updates)
  new_values  JSONB,                         -- after state
  payload     JSONB,                         -- additional context
  ip_address  INET,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Partitioning-ready index (future: partition by month)
CREATE INDEX IF NOT EXISTS idx_audit_actor      ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity     ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_action     ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_logs(created_at DESC);

-- ----------------------------------------------------------------
-- FUNCTION: log_audit_event
-- Call from application layer; also used by DB triggers
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION log_audit_event(
  p_actor_id    UUID,
  p_action      TEXT,
  p_entity_type TEXT,
  p_entity_id   UUID    DEFAULT NULL,
  p_old_values  JSONB   DEFAULT NULL,
  p_new_values  JSONB   DEFAULT NULL,
  p_payload     JSONB   DEFAULT NULL
)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO audit_logs
    (actor_id, action, entity_type, entity_id, old_values, new_values, payload)
  VALUES
    (p_actor_id, p_action, p_entity_type, p_entity_id, p_old_values, p_new_values, p_payload)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;
