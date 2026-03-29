-- Track which changelog entries each user has acknowledged
CREATE TABLE changelog_acks (
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  show_id uuid REFERENCES shows(id) ON DELETE CASCADE,
  -- Acknowledge all changes up to this timestamp
  acked_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, show_id)
);

ALTER TABLE changelog_acks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "changelog_acks_select" ON changelog_acks
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "changelog_acks_upsert" ON changelog_acks
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "changelog_acks_update" ON changelog_acks
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());
