-- ================================================================
-- Migration 008: Row Level Security Policies
-- Applied after all tables exist
-- ================================================================

-- ----------------------------------------------------------------
-- Helper: get current user role without N+1 sub-selects
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$;

-- ================================================================
-- PROFILES
-- ================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = (SELECT role FROM profiles WHERE id = auth.uid())  -- cannot self-escalate role
  );

CREATE POLICY "profiles_admin_select_all"
  ON profiles FOR SELECT
  USING (current_user_role() IN ('admin','super_admin'));

CREATE POLICY "profiles_admin_update_all"
  ON profiles FOR UPDATE
  USING (current_user_role() IN ('admin','super_admin'));

-- ================================================================
-- SCORES
-- ================================================================
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "scores_select_own"
  ON scores FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "scores_insert_own"
  ON scores FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND (
      SELECT subscription_status FROM profiles WHERE id = auth.uid()
    ) IN ('active','trialing')
  );

CREATE POLICY "scores_delete_own"
  ON scores FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "scores_admin_all"
  ON scores FOR ALL
  USING (current_user_role() IN ('admin','super_admin'));

-- ================================================================
-- CHARITIES (public read, service_role write)
-- ================================================================
ALTER TABLE charities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "charities_public_read"
  ON charities FOR SELECT
  USING (is_deleted = FALSE);

CREATE POLICY "charities_admin_all"
  ON charities FOR ALL
  USING (auth.role() = 'service_role');

-- ================================================================
-- DRAWS (public read, service_role write)
-- ================================================================
ALTER TABLE draws ENABLE ROW LEVEL SECURITY;

CREATE POLICY "draws_public_read"
  ON draws FOR SELECT
  USING (true);

CREATE POLICY "draws_service_write"
  ON draws FOR ALL
  USING (auth.role() = 'service_role');

-- ================================================================
-- DRAW WINNERS (public read, service_role write)
-- ================================================================
ALTER TABLE draw_winners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "draw_winners_public_read"
  ON draw_winners FOR SELECT
  USING (true);

CREATE POLICY "draw_winners_service_write"
  ON draw_winners FOR ALL
  USING (auth.role() = 'service_role');

-- ================================================================
-- WINNER PROOFS
-- ================================================================
ALTER TABLE winner_proofs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "proofs_select_own"
  ON winner_proofs FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "proofs_insert_own"
  ON winner_proofs FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "proofs_admin_select_all"
  ON winner_proofs FOR SELECT
  USING (current_user_role() IN ('admin','super_admin'));

CREATE POLICY "proofs_admin_update_all"
  ON winner_proofs FOR UPDATE
  USING (current_user_role() IN ('admin','super_admin'));

-- ================================================================
-- ORGANIZATIONS
-- ================================================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orgs_member_select"
  ON organizations FOR SELECT
  USING (
    id IN (
      SELECT org_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "orgs_super_admin_all"
  ON organizations FOR ALL
  USING (current_user_role() = 'super_admin');

ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_members_select_own_org"
  ON organization_members FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

-- ================================================================
-- AUDIT LOGS (super_admin read only, service_role write)
-- ================================================================
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_super_admin_read"
  ON audit_logs FOR SELECT
  USING (current_user_role() = 'super_admin');

CREATE POLICY "audit_service_write"
  ON audit_logs FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- ================================================================
-- STORAGE BUCKET POLICIES
-- Create buckets first in Dashboard: winner-proofs (private), charity-logos (public)
-- ================================================================

-- winner-proofs bucket: users upload to their own folder, admins read all
CREATE POLICY "proofs_storage_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'winner-proofs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "proofs_storage_own_read"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'winner-proofs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "proofs_storage_admin_read"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'winner-proofs'
    AND current_user_role() IN ('admin','super_admin')
  );

-- charity-logos bucket: public read, service_role write
CREATE POLICY "charity_logos_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'charity-logos');
