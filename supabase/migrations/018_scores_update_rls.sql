-- Migration 018: Add UPDATE policy for scores
-- Enables users to edit their own scores

CREATE POLICY "scores_update_own"
  ON scores FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND (
      SELECT subscription_status FROM profiles WHERE id = auth.uid()
    ) IN ('active','trialing')
  );
