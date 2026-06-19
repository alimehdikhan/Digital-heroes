-- ================================================================
-- Migration 014: Update get_draw_participants
-- ================================================================

CREATE OR REPLACE FUNCTION get_draw_participants(
  p_month SMALLINT,
  p_year  SMALLINT
)
RETURNS TABLE (user_id UUID, scores SMALLINT[], subscription_plan TEXT)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT
    s.user_id,
    ARRAY_AGG(s.score ORDER BY s.date DESC) AS scores,
    p.subscription_plan
  FROM (
    SELECT
      user_id,
      score,
      date,
      ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY date DESC) AS rn
    FROM scores
    WHERE EXTRACT(MONTH FROM date) = p_month
      AND EXTRACT(YEAR  FROM date) = p_year
  ) s
  JOIN profiles p ON p.id = s.user_id
  WHERE s.rn <= 5
    AND p.subscription_status IN ('active','trialing')
  GROUP BY s.user_id, p.subscription_plan;
$$;
