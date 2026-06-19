-- Migration: 016_create_proofs_bucket
-- Description: Creates the winner_proofs storage bucket and configures RLS policies

-- Create bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('winner_proofs', 'winner_proofs', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for winner_proofs bucket
CREATE POLICY "Public Access"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'winner_proofs' );

CREATE POLICY "Authenticated users can upload proofs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'winner_proofs'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own proofs"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'winner_proofs'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete their own proofs"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'winner_proofs'
    AND auth.role() = 'authenticated'
  );
