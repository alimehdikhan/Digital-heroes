-- ============================================================
-- Digital Heroes — Supabase Schema
-- Run this in the Supabase SQL editor to bootstrap the DB
-- ============================================================

-- -----------------------------------------------
-- PROFILES (extends auth.users)
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  subscription_status TEXT DEFAULT 'inactive'
    CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'trialing')),
  subscription_plan TEXT CHECK (subscription_plan IN ('monthly', 'yearly')),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on new user sign-up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- -----------------------------------------------
-- CHARITIES (defined before draws — FK dependency)
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS charities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  is_active BOOLEAN DEFAULT FALSE,
  total_contributed NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------
-- DRAWS
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS draws (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL CHECK (year >= 2024),
  mode TEXT NOT NULL CHECK (mode IN ('random', 'algorithmic')),
  winning_numbers INTEGER[] NOT NULL,
  jackpot_amount NUMERIC(10,2) DEFAULT 0,
  jackpot_rolled_over BOOLEAN DEFAULT FALSE,
  prize_4match NUMERIC(10,2) DEFAULT 0,
  prize_3match NUMERIC(10,2) DEFAULT 0,
  total_pool NUMERIC(10,2) DEFAULT 0,
  charity_id UUID REFERENCES charities(id),
  charity_contribution NUMERIC(10,2) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  participants INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(month, year)
);

-- -----------------------------------------------
-- DRAW WINNERS
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS draw_winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id UUID REFERENCES draws(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  tier TEXT NOT NULL CHECK (tier IN ('jackpot', 'silver', 'bronze')),
  matched_numbers INTEGER[],
  amount NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------
-- SCORES
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Auto-delete oldest score when user exceeds 5
CREATE OR REPLACE FUNCTION enforce_max_scores()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  DELETE FROM scores
  WHERE id IN (
    SELECT id FROM scores
    WHERE user_id = NEW.user_id
    ORDER BY date DESC
    OFFSET 5
  );
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS after_score_insert ON scores;
CREATE TRIGGER after_score_insert
  AFTER INSERT ON scores
  FOR EACH ROW EXECUTE FUNCTION enforce_max_scores();

-- -----------------------------------------------
-- WINNER PROOFS
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS winner_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  draw_id UUID REFERENCES draws(id) ON DELETE CASCADE,
  draw_winner_id UUID REFERENCES draw_winners(id) ON DELETE CASCADE,
  proof_url TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- PROFILES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- SCORES
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own scores"
  ON scores USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all scores"
  ON scores FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- DRAWS (public read)
ALTER TABLE draws ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read draws" ON draws FOR SELECT USING (true);
CREATE POLICY "Only service role can write draws" ON draws
  FOR ALL USING (auth.role() = 'service_role');

-- DRAW WINNERS (public read)
ALTER TABLE draw_winners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read draw_winners" ON draw_winners FOR SELECT USING (true);
CREATE POLICY "Only service role can write draw_winners" ON draw_winners
  FOR ALL USING (auth.role() = 'service_role');

-- CHARITIES (public read, admin write)
ALTER TABLE charities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read charities" ON charities FOR SELECT USING (true);
CREATE POLICY "Only service role can write charities" ON charities
  FOR ALL USING (auth.role() = 'service_role');

-- WINNER PROOFS
ALTER TABLE winner_proofs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own proofs"
  ON winner_proofs USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all proofs"
  ON winner_proofs FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can update proof status"
  ON winner_proofs FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- STORAGE BUCKET (run separately or via Supabase dashboard)
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('winner-proofs', 'winner-proofs', false);
-- CREATE POLICY "Users upload own proofs" ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'winner-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Admins view all proofs" ON storage.objects FOR SELECT
--   USING (bucket_id = 'winner-proofs' AND
--     EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
