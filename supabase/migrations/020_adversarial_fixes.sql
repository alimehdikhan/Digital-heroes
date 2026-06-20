-- 020_adversarial_fixes.sql
-- ADVERSARIAL MODE: Harden draw performance and transactional integrity

-- 1. Optimized Data Fetching for Scalability
-- Bypasses PostgREST 1000-row limit and URL parameter limits.
CREATE OR REPLACE FUNCTION get_draw_participants()
RETURNS TABLE (
  user_id UUID,
  subscription_plan TEXT,
  charity_percentage NUMERIC,
  latest_scores INTEGER[]
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  WITH active_users AS (
    SELECT p.id, p.subscription_plan, p.charity_percentage
    FROM profiles p
    WHERE p.subscription_status IN ('active', 'trialing')
  ),
  user_scores AS (
    SELECT s.user_id, array_agg(s.score ORDER BY s.date DESC) as scores
    FROM scores s
    JOIN active_users au ON s.user_id = au.id
    GROUP BY s.user_id
  )
  SELECT 
    au.id, 
    au.subscription_plan, 
    COALESCE(au.charity_percentage, 10), 
    us.scores[1:5]
  FROM active_users au
  JOIN user_scores us ON au.id = us.user_id
  WHERE array_length(us.scores, 1) >= 5;
END;
$$;

-- 2. Atomic Transaction for Draw Results
-- Prevents partial data corruption if node server crashes mid-draw
CREATE OR REPLACE FUNCTION commit_draw_results(
  p_month INTEGER,
  p_year INTEGER,
  p_mode TEXT,
  p_winning_numbers INTEGER[],
  p_total_pool NUMERIC,
  p_jackpot_amount NUMERIC,
  p_prize_4match NUMERIC,
  p_prize_3match NUMERIC,
  p_jackpot_rolled_over BOOLEAN,
  p_rollover_amount NUMERIC,
  p_charity_contribution NUMERIC,
  p_winners JSONB
) RETURNS UUID LANGUAGE plpgsql AS $$
DECLARE
  v_draw_id UUID;
  v_winner JSONB;
BEGIN
  -- Insert draw
  INSERT INTO draws (
    month, year, mode, winning_numbers, total_pool, jackpot_amount,
    prize_4match, prize_3match, jackpot_rolled_over, rollover_amount,
    charity_contribution, status
  ) VALUES (
    p_month, p_year, p_mode, p_winning_numbers, p_total_pool, p_jackpot_amount,
    p_prize_4match, p_prize_3match, p_jackpot_rolled_over, p_rollover_amount,
    p_charity_contribution, 'in_progress'
  ) RETURNING id INTO v_draw_id;

  -- Insert winners (if any)
  IF p_winners IS NOT NULL AND jsonb_array_length(p_winners) > 0 THEN
    FOR v_winner IN SELECT * FROM jsonb_array_elements(p_winners)
    LOOP
      INSERT INTO draw_winners (
        draw_id, user_id, tier, match_count, matched_numbers, user_scores, amount, payout_status
      ) VALUES (
        v_draw_id,
        (v_winner->>'user_id')::UUID,
        v_winner->>'tier',
        (v_winner->>'match_count')::INTEGER,
        (SELECT array_agg(x::INTEGER) FROM jsonb_array_elements_text(v_winner->'matched_numbers') x),
        (SELECT array_agg(x::INTEGER) FROM jsonb_array_elements_text(v_winner->'user_scores') x),
        (v_winner->>'amount')::NUMERIC,
        'pending'
      );
    END LOOP;
  END IF;

  RETURN v_draw_id;
END;
$$;
