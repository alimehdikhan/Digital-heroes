-- ================================================================
-- Migration 009: Functions, Triggers, and Supabase Auth Hooks
-- ================================================================

-- ----------------------------------------------------------------
-- TRIGGER: Auto-create profile on auth.users insert
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar_url, supported_charity_id, charity_percentage)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url',
    (NEW.raw_user_meta_data->>'supported_charity_id')::UUID,
    COALESCE((NEW.raw_user_meta_data->>'charity_percentage')::NUMERIC, 10.00)
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ----------------------------------------------------------------
-- JWT HOOK: Inject role into access token claims
-- Configure in: Supabase Dashboard → Auth → Hooks → Custom Access Token
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION add_role_to_jwt(event JSONB)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT role INTO v_role FROM profiles WHERE id = (event->>'user_id')::UUID;
  RETURN jsonb_set(event, '{claims,role}', to_jsonb(COALESCE(v_role, 'user')));
END;
$$;

-- ----------------------------------------------------------------
-- FUNCTION: Get user's draw entry for a specific month
-- Returns the user's last 5 scores within the draw month
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_user_draw_entry(
  p_user_id UUID,
  p_month   SMALLINT,
  p_year    SMALLINT
)
RETURNS TABLE (score SMALLINT, date DATE)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT score, date
  FROM   scores
  WHERE  user_id = p_user_id
    AND  EXTRACT(MONTH FROM date) = p_month
    AND  EXTRACT(YEAR  FROM date) = p_year
  ORDER  BY date DESC
  LIMIT  5;
$$;

-- ----------------------------------------------------------------
-- FUNCTION: Get all participants for a draw month (admin/service only)
-- Returns user_id + their up-to-5 scores for the month
-- ----------------------------------------------------------------
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

-- ----------------------------------------------------------------
-- FUNCTION: Get platform admin stats
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS TABLE (
  total_active_members    BIGINT,
  pending_proofs          BIGINT,
  total_charity_contributed NUMERIC,
  current_jackpot         NUMERIC
)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT
    (SELECT COUNT(*) FROM profiles WHERE subscription_status IN ('active','trialing')),
    (SELECT COUNT(*) FROM winner_proofs WHERE status = 'pending'),
    (SELECT COALESCE(SUM(total_contributed), 0) FROM charities),
    (
      SELECT COALESCE(jackpot_amount, 0)
      FROM   draws
      WHERE  jackpot_rolled_over = TRUE
      ORDER  BY year DESC, month DESC
      LIMIT  1
    );
$$;
