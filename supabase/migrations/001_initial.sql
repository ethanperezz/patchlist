-- PatchList: Full database schema
-- Run this as a Supabase migration

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  email text,
  role text CHECK (role IN ('admin', 'engineer')) DEFAULT 'engineer'
);

CREATE TABLE shows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  venue text,
  show_date date,
  event_type text CHECK (event_type IN ('worship', 'concert', 'corporate', 'other')),
  created_by uuid REFERENCES users(id),
  updated_at timestamptz DEFAULT now(),
  is_template boolean DEFAULT false,
  show_notes text
);

CREATE TABLE show_users (
  show_id uuid REFERENCES shows(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  permission text CHECK (permission IN ('editor', 'viewer')) DEFAULT 'viewer',
  PRIMARY KEY (show_id, user_id)
);

CREATE TABLE channel_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  show_id uuid REFERENCES shows(id) ON DELETE CASCADE,
  name text NOT NULL,
  sort_order int DEFAULT 0
);

CREATE TABLE channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  show_id uuid REFERENCES shows(id) ON DELETE CASCADE,
  channel_number int NOT NULL,
  name text NOT NULL,
  stage_port text,
  input_type text CHECK (input_type IN ('xlr_mic', 'di', 'wireless', 'line', 'comms')),
  mic_model text,
  phantom_48v boolean DEFAULT false,
  notes text,
  sort_order int DEFAULT 0,
  group_id uuid REFERENCES channel_groups(id) ON DELETE SET NULL
);

CREATE TABLE mixes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  show_id uuid REFERENCES shows(id) ON DELETE CASCADE,
  mix_number text NOT NULL,
  name text NOT NULL,
  type text CHECK (type IN ('wedge', 'iem', 'fx', 'matrix')),
  system text,
  position text,
  sort_order int DEFAULT 0,
  feeds text[]
);

CREATE TABLE mix_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mix_id uuid REFERENCES mixes(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id),
  body text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE wireless (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  show_id uuid REFERENCES shows(id) ON DELETE CASCADE,
  channel_id uuid REFERENCES channels(id) ON DELETE CASCADE UNIQUE,
  pack_id text,
  frequency numeric(7,3),
  system text
);

CREATE TABLE changelog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  show_id uuid REFERENCES shows(id) ON DELETE CASCADE,
  channel_id uuid REFERENCES channels(id) ON DELETE SET NULL,
  user_id uuid REFERENCES users(id),
  field_changed text,
  previous_value text,
  new_value text,
  changed_at timestamptz DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE show_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE mixes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mix_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE wireless ENABLE ROW LEVEL SECURITY;
ALTER TABLE changelog ENABLE ROW LEVEL SECURITY;

-- users: own row only
CREATE POLICY "users_select_own" ON users FOR SELECT USING (id = auth.uid());
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (id = auth.uid());
CREATE POLICY "users_insert_own" ON users FOR INSERT WITH CHECK (id = auth.uid());

-- show_users: any authenticated for own rows
CREATE POLICY "show_users_select" ON show_users FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "show_users_insert" ON show_users FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM show_users su WHERE su.show_id = show_users.show_id AND su.user_id = auth.uid() AND su.permission = 'editor')
);
CREATE POLICY "show_users_delete" ON show_users FOR DELETE USING (
  EXISTS (SELECT 1 FROM show_users su WHERE su.show_id = show_users.show_id AND su.user_id = auth.uid() AND su.permission = 'editor')
);

-- shows: select for show members, mutate for editors
CREATE POLICY "shows_select" ON shows FOR SELECT USING (
  is_template = true OR
  EXISTS (SELECT 1 FROM show_users WHERE show_users.show_id = shows.id AND show_users.user_id = auth.uid())
);
CREATE POLICY "shows_insert" ON shows FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "shows_update" ON shows FOR UPDATE USING (
  EXISTS (SELECT 1 FROM show_users WHERE show_users.show_id = shows.id AND show_users.user_id = auth.uid() AND show_users.permission = 'editor')
);
CREATE POLICY "shows_delete" ON shows FOR DELETE USING (
  EXISTS (SELECT 1 FROM show_users WHERE show_users.show_id = shows.id AND show_users.user_id = auth.uid() AND show_users.permission = 'editor')
);

-- channel_groups
CREATE POLICY "channel_groups_select" ON channel_groups FOR SELECT USING (
  EXISTS (SELECT 1 FROM show_users WHERE show_users.show_id = channel_groups.show_id AND show_users.user_id = auth.uid())
);
CREATE POLICY "channel_groups_insert" ON channel_groups FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM show_users WHERE show_users.show_id = channel_groups.show_id AND show_users.user_id = auth.uid() AND show_users.permission = 'editor')
);
CREATE POLICY "channel_groups_update" ON channel_groups FOR UPDATE USING (
  EXISTS (SELECT 1 FROM show_users WHERE show_users.show_id = channel_groups.show_id AND show_users.user_id = auth.uid() AND show_users.permission = 'editor')
);
CREATE POLICY "channel_groups_delete" ON channel_groups FOR DELETE USING (
  EXISTS (SELECT 1 FROM show_users WHERE show_users.show_id = channel_groups.show_id AND show_users.user_id = auth.uid() AND show_users.permission = 'editor')
);

-- channels: select for show members, mutate for editors
CREATE POLICY "channels_select" ON channels FOR SELECT USING (
  EXISTS (SELECT 1 FROM show_users WHERE show_users.show_id = channels.show_id AND show_users.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM shows WHERE shows.id = channels.show_id AND shows.is_template = true)
);
CREATE POLICY "channels_insert" ON channels FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM show_users WHERE show_users.show_id = channels.show_id AND show_users.user_id = auth.uid() AND show_users.permission = 'editor')
);
CREATE POLICY "channels_update" ON channels FOR UPDATE USING (
  EXISTS (SELECT 1 FROM show_users WHERE show_users.show_id = channels.show_id AND show_users.user_id = auth.uid() AND show_users.permission = 'editor')
);
CREATE POLICY "channels_delete" ON channels FOR DELETE USING (
  EXISTS (SELECT 1 FROM show_users WHERE show_users.show_id = channels.show_id AND show_users.user_id = auth.uid() AND show_users.permission = 'editor')
);

-- mixes
CREATE POLICY "mixes_select" ON mixes FOR SELECT USING (
  EXISTS (SELECT 1 FROM show_users WHERE show_users.show_id = mixes.show_id AND show_users.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM shows WHERE shows.id = mixes.show_id AND shows.is_template = true)
);
CREATE POLICY "mixes_insert" ON mixes FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM show_users WHERE show_users.show_id = mixes.show_id AND show_users.user_id = auth.uid() AND show_users.permission = 'editor')
);
CREATE POLICY "mixes_update" ON mixes FOR UPDATE USING (
  EXISTS (SELECT 1 FROM show_users WHERE show_users.show_id = mixes.show_id AND show_users.user_id = auth.uid() AND show_users.permission = 'editor')
);
CREATE POLICY "mixes_delete" ON mixes FOR DELETE USING (
  EXISTS (SELECT 1 FROM show_users WHERE show_users.show_id = mixes.show_id AND show_users.user_id = auth.uid() AND show_users.permission = 'editor')
);

-- mix_notes: select for show members, insert for any show member, update/delete own only
CREATE POLICY "mix_notes_select" ON mix_notes FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM mixes m
    JOIN show_users su ON su.show_id = m.show_id
    WHERE m.id = mix_notes.mix_id AND su.user_id = auth.uid()
  )
);
CREATE POLICY "mix_notes_insert" ON mix_notes FOR INSERT WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM mixes m
    JOIN show_users su ON su.show_id = m.show_id
    WHERE m.id = mix_notes.mix_id AND su.user_id = auth.uid()
  )
);
CREATE POLICY "mix_notes_update" ON mix_notes FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "mix_notes_delete" ON mix_notes FOR DELETE USING (user_id = auth.uid());

-- wireless
CREATE POLICY "wireless_select" ON wireless FOR SELECT USING (
  EXISTS (SELECT 1 FROM show_users WHERE show_users.show_id = wireless.show_id AND show_users.user_id = auth.uid())
);
CREATE POLICY "wireless_insert" ON wireless FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM show_users WHERE show_users.show_id = wireless.show_id AND show_users.user_id = auth.uid() AND show_users.permission = 'editor')
);
CREATE POLICY "wireless_update" ON wireless FOR UPDATE USING (
  EXISTS (SELECT 1 FROM show_users WHERE show_users.show_id = wireless.show_id AND show_users.user_id = auth.uid() AND show_users.permission = 'editor')
);
CREATE POLICY "wireless_delete" ON wireless FOR DELETE USING (
  EXISTS (SELECT 1 FROM show_users WHERE show_users.show_id = wireless.show_id AND show_users.user_id = auth.uid() AND show_users.permission = 'editor')
);

-- changelog: select only, insert via trigger
CREATE POLICY "changelog_select" ON changelog FOR SELECT USING (
  EXISTS (SELECT 1 FROM show_users WHERE show_users.show_id = changelog.show_id AND show_users.user_id = auth.uid())
);

-- ============================================================
-- CHANGELOG TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION log_channel_changes()
RETURNS TRIGGER AS $$
DECLARE
  col text;
  old_val text;
  new_val text;
BEGIN
  FOREACH col IN ARRAY ARRAY['name', 'channel_number', 'stage_port', 'input_type', 'mic_model', 'phantom_48v', 'notes', 'group_id', 'sort_order'] LOOP
    EXECUTE format('SELECT ($1).%I::text, ($2).%I::text', col, col) INTO old_val, new_val USING OLD, NEW;
    IF old_val IS DISTINCT FROM new_val THEN
      INSERT INTO changelog (show_id, channel_id, user_id, field_changed, previous_value, new_value, changed_at)
      VALUES (NEW.show_id, NEW.id, auth.uid(), col, old_val, new_val, now());
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER channel_changelog_trigger
  AFTER UPDATE ON channels
  FOR EACH ROW
  EXECUTE FUNCTION log_channel_changes();

-- Allow the trigger function to insert into changelog
CREATE POLICY "changelog_insert_trigger" ON changelog FOR INSERT WITH CHECK (true);

-- ============================================================
-- REALTIME
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE channels;
ALTER PUBLICATION supabase_realtime ADD TABLE mixes;
ALTER PUBLICATION supabase_realtime ADD TABLE mix_notes;
ALTER PUBLICATION supabase_realtime ADD TABLE changelog;

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_channels_show_id ON channels(show_id);
CREATE INDEX idx_channels_group_id ON channels(group_id);
CREATE INDEX idx_mixes_show_id ON mixes(show_id);
CREATE INDEX idx_mix_notes_mix_id ON mix_notes(mix_id);
CREATE INDEX idx_wireless_show_id ON wireless(show_id);
CREATE INDEX idx_changelog_show_id ON changelog(show_id);
CREATE INDEX idx_changelog_channel_id ON changelog(channel_id);
CREATE INDEX idx_show_users_user_id ON show_users(user_id);
CREATE INDEX idx_channel_groups_show_id ON channel_groups(show_id);

-- ============================================================
-- SEED TEMPLATES
-- ============================================================

-- Worship default template
INSERT INTO shows (id, name, venue, event_type, is_template) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Worship Default', 'Template', 'worship', true);

INSERT INTO channel_groups (id, show_id, name, sort_order) VALUES
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000001', 'Drums', 0),
  ('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000001', 'Bass / Keys', 1),
  ('00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000001', 'Guitars', 2),
  ('00000000-0000-0000-0001-000000000004', '00000000-0000-0000-0000-000000000001', 'Vocals', 3);

INSERT INTO channels (show_id, channel_number, name, input_type, mic_model, phantom_48v, group_id, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000001', 1, 'Kick In', 'xlr_mic', 'Beta 91A', true, '00000000-0000-0000-0001-000000000001', 0),
  ('00000000-0000-0000-0000-000000000001', 2, 'Kick Out', 'xlr_mic', 'Beta 52A', false, '00000000-0000-0000-0001-000000000001', 1),
  ('00000000-0000-0000-0000-000000000001', 3, 'Snare Top', 'xlr_mic', 'SM57', false, '00000000-0000-0000-0001-000000000001', 2),
  ('00000000-0000-0000-0000-000000000001', 4, 'Snare Btm', 'xlr_mic', 'SM57', false, '00000000-0000-0000-0001-000000000001', 3),
  ('00000000-0000-0000-0000-000000000001', 5, 'Hi-Hat', 'xlr_mic', 'SM81', true, '00000000-0000-0000-0001-000000000001', 4),
  ('00000000-0000-0000-0000-000000000001', 6, 'Tom 1', 'xlr_mic', 'e604', false, '00000000-0000-0000-0001-000000000001', 5),
  ('00000000-0000-0000-0000-000000000001', 7, 'Tom 2', 'xlr_mic', 'e604', false, '00000000-0000-0000-0001-000000000001', 6),
  ('00000000-0000-0000-0000-000000000001', 8, 'OH L', 'xlr_mic', 'KSM32', true, '00000000-0000-0000-0001-000000000001', 7),
  ('00000000-0000-0000-0000-000000000001', 9, 'OH R', 'xlr_mic', 'KSM32', true, '00000000-0000-0000-0001-000000000001', 8),
  ('00000000-0000-0000-0000-000000000001', 10, 'Bass DI', 'di', null, false, '00000000-0000-0000-0001-000000000002', 0),
  ('00000000-0000-0000-0000-000000000001', 11, 'Keys L', 'di', null, false, '00000000-0000-0000-0001-000000000002', 1),
  ('00000000-0000-0000-0000-000000000001', 12, 'Keys R', 'di', null, false, '00000000-0000-0000-0001-000000000002', 2),
  ('00000000-0000-0000-0000-000000000001', 13, 'Synth L', 'di', null, false, '00000000-0000-0000-0001-000000000002', 3),
  ('00000000-0000-0000-0000-000000000001', 14, 'Synth R', 'di', null, false, '00000000-0000-0000-0001-000000000002', 4),
  ('00000000-0000-0000-0000-000000000001', 15, 'Acoustic', 'di', null, false, '00000000-0000-0000-0001-000000000003', 0),
  ('00000000-0000-0000-0000-000000000001', 16, 'Electric L', 'xlr_mic', 'SM57', false, '00000000-0000-0000-0001-000000000003', 1),
  ('00000000-0000-0000-0000-000000000001', 17, 'Electric R', 'xlr_mic', 'SM57', false, '00000000-0000-0000-0001-000000000003', 2),
  ('00000000-0000-0000-0000-000000000001', 18, 'Lead Vox', 'wireless', 'SM58', false, '00000000-0000-0000-0001-000000000004', 0),
  ('00000000-0000-0000-0000-000000000001', 19, 'BG Vox 1', 'wireless', 'SM58', false, '00000000-0000-0000-0001-000000000004', 1),
  ('00000000-0000-0000-0000-000000000001', 20, 'BG Vox 2', 'wireless', 'SM58', false, '00000000-0000-0000-0001-000000000004', 2),
  ('00000000-0000-0000-0000-000000000001', 21, 'BG Vox 3', 'wireless', 'SM58', false, '00000000-0000-0000-0001-000000000004', 3),
  ('00000000-0000-0000-0000-000000000001', 22, 'Pastor', 'wireless', 'DPA 4088', false, '00000000-0000-0000-0001-000000000004', 4);

INSERT INTO mixes (show_id, mix_number, name, type, system, position, sort_order, feeds) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Mix 1', 'Drums Wedge', 'wedge', 'QSC K12.2', 'Drum riser', 0, ARRAY['Kick In','Snare Top','OH L','OH R','Keys L','Bass DI']),
  ('00000000-0000-0000-0000-000000000001', 'Mix 2', 'Lead IEM', 'iem', 'Sennheiser 300 G4', 'SR', 1, ARRAY['Lead Vox','Keys L','Keys R','Acoustic','Electric L','Kick In','Snare Top']),
  ('00000000-0000-0000-0000-000000000001', 'Mix 3-4', 'BG Vox IEM', 'iem', 'Sennheiser 300 G4', 'SR', 2, ARRAY['BG Vox 1','BG Vox 2','BG Vox 3','Lead Vox','Keys L','Bass DI']),
  ('00000000-0000-0000-0000-000000000001', 'Mix 5', 'Keys Wedge', 'wedge', 'QSC K10.2', 'Keys position', 3, ARRAY['Keys L','Keys R','Synth L','Synth R','Lead Vox','Bass DI']),
  ('00000000-0000-0000-0000-000000000001', 'Mix 6', 'Guitar Wedge', 'wedge', 'QSC K10.2', 'Guitar position', 4, ARRAY['Electric L','Electric R','Lead Vox','Kick In','Snare Top']);

-- Concert default template
INSERT INTO shows (id, name, venue, event_type, is_template) VALUES
  ('00000000-0000-0000-0000-000000000002', 'Concert Default', 'Template', 'concert', true);

INSERT INTO channel_groups (id, show_id, name, sort_order) VALUES
  ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0000-000000000002', 'Drums', 0),
  ('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0000-000000000002', 'Bass / Keys', 1),
  ('00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0000-000000000002', 'Guitars', 2),
  ('00000000-0000-0000-0002-000000000004', '00000000-0000-0000-0000-000000000002', 'Vocals', 3),
  ('00000000-0000-0000-0002-000000000005', '00000000-0000-0000-0000-000000000002', 'Playback', 4);

INSERT INTO channels (show_id, channel_number, name, input_type, mic_model, phantom_48v, group_id, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000002', 1, 'Kick', 'xlr_mic', 'Beta 91A', true, '00000000-0000-0000-0002-000000000001', 0),
  ('00000000-0000-0000-0000-000000000002', 2, 'Snare', 'xlr_mic', 'SM57', false, '00000000-0000-0000-0002-000000000001', 1),
  ('00000000-0000-0000-0000-000000000002', 3, 'HH', 'xlr_mic', 'SM81', true, '00000000-0000-0000-0002-000000000001', 2),
  ('00000000-0000-0000-0000-000000000002', 4, 'Tom 1', 'xlr_mic', 'e604', false, '00000000-0000-0000-0002-000000000001', 3),
  ('00000000-0000-0000-0000-000000000002', 5, 'Tom 2', 'xlr_mic', 'e604', false, '00000000-0000-0000-0002-000000000001', 4),
  ('00000000-0000-0000-0000-000000000002', 6, 'Floor Tom', 'xlr_mic', 'e602', false, '00000000-0000-0000-0002-000000000001', 5),
  ('00000000-0000-0000-0000-000000000002', 7, 'OH L', 'xlr_mic', 'KSM32', true, '00000000-0000-0000-0002-000000000001', 6),
  ('00000000-0000-0000-0000-000000000002', 8, 'OH R', 'xlr_mic', 'KSM32', true, '00000000-0000-0000-0002-000000000001', 7),
  ('00000000-0000-0000-0000-000000000002', 9, 'Bass DI', 'di', null, false, '00000000-0000-0000-0002-000000000002', 0),
  ('00000000-0000-0000-0000-000000000002', 10, 'Bass Amp', 'xlr_mic', 'RE20', false, '00000000-0000-0000-0002-000000000002', 1),
  ('00000000-0000-0000-0000-000000000002', 11, 'Keys L', 'di', null, false, '00000000-0000-0000-0002-000000000002', 2),
  ('00000000-0000-0000-0000-000000000002', 12, 'Keys R', 'di', null, false, '00000000-0000-0000-0002-000000000002', 3),
  ('00000000-0000-0000-0000-000000000002', 13, 'Guitar 1', 'xlr_mic', 'SM57', false, '00000000-0000-0000-0002-000000000003', 0),
  ('00000000-0000-0000-0000-000000000002', 14, 'Guitar 2', 'xlr_mic', 'SM57', false, '00000000-0000-0000-0002-000000000003', 1),
  ('00000000-0000-0000-0000-000000000002', 15, 'Lead Vox', 'wireless', 'SM58', false, '00000000-0000-0000-0002-000000000004', 0),
  ('00000000-0000-0000-0000-000000000002', 16, 'BG Vox 1', 'xlr_mic', 'SM58', false, '00000000-0000-0000-0002-000000000004', 1),
  ('00000000-0000-0000-0000-000000000002', 17, 'BG Vox 2', 'xlr_mic', 'SM58', false, '00000000-0000-0000-0002-000000000004', 2),
  ('00000000-0000-0000-0000-000000000002', 18, 'Track L', 'line', null, false, '00000000-0000-0000-0002-000000000005', 0),
  ('00000000-0000-0000-0000-000000000002', 19, 'Track R', 'line', null, false, '00000000-0000-0000-0002-000000000005', 1),
  ('00000000-0000-0000-0000-000000000002', 20, 'Click', 'line', null, false, '00000000-0000-0000-0002-000000000005', 2);

INSERT INTO mixes (show_id, mix_number, name, type, system, position, sort_order, feeds) VALUES
  ('00000000-0000-0000-0000-000000000002', 'Mix 1', 'Drum Fill', 'wedge', 'QSC K12.2', 'Drum riser', 0, ARRAY['Kick','Snare','Keys L','Bass DI','Click']),
  ('00000000-0000-0000-0000-000000000002', 'Mix 2', 'Lead IEM', 'iem', 'Shure PSM300', 'SR', 1, ARRAY['Lead Vox','Guitar 1','Keys L','Kick','Snare']),
  ('00000000-0000-0000-0000-000000000002', 'Mix 3', 'Guitar 1 Wedge', 'wedge', 'QSC K10.2', 'SL', 2, ARRAY['Guitar 1','Lead Vox','Kick','Snare','Bass DI']),
  ('00000000-0000-0000-0000-000000000002', 'Mix 4', 'Guitar 2 Wedge', 'wedge', 'QSC K10.2', 'SR', 3, ARRAY['Guitar 2','Lead Vox','Kick','Snare','Bass DI']);

-- Corporate default template
INSERT INTO shows (id, name, venue, event_type, is_template) VALUES
  ('00000000-0000-0000-0000-000000000003', 'Corporate Default', 'Template', 'corporate', true);

INSERT INTO channel_groups (id, show_id, name, sort_order) VALUES
  ('00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0000-000000000003', 'Presenters', 0),
  ('00000000-0000-0000-0003-000000000002', '00000000-0000-0000-0000-000000000003', 'Panel', 1),
  ('00000000-0000-0000-0003-000000000003', '00000000-0000-0000-0000-000000000003', 'Playback / Comms', 2);

INSERT INTO channels (show_id, channel_number, name, input_type, mic_model, phantom_48v, group_id, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000003', 1, 'Presenter 1', 'wireless', 'DPA 4088', false, '00000000-0000-0000-0003-000000000001', 0),
  ('00000000-0000-0000-0000-000000000003', 2, 'Presenter 2', 'wireless', 'DPA 4088', false, '00000000-0000-0000-0003-000000000001', 1),
  ('00000000-0000-0000-0000-000000000003', 3, 'Handheld 1', 'wireless', 'SM58', false, '00000000-0000-0000-0003-000000000001', 2),
  ('00000000-0000-0000-0000-000000000003', 4, 'Handheld 2', 'wireless', 'SM58', false, '00000000-0000-0000-0003-000000000001', 3),
  ('00000000-0000-0000-0000-000000000003', 5, 'Panel 1', 'xlr_mic', 'MX418', true, '00000000-0000-0000-0003-000000000002', 0),
  ('00000000-0000-0000-0000-000000000003', 6, 'Panel 2', 'xlr_mic', 'MX418', true, '00000000-0000-0000-0003-000000000002', 1),
  ('00000000-0000-0000-0000-000000000003', 7, 'Panel 3', 'xlr_mic', 'MX418', true, '00000000-0000-0000-0003-000000000002', 2),
  ('00000000-0000-0000-0000-000000000003', 8, 'Panel 4', 'xlr_mic', 'MX418', true, '00000000-0000-0000-0003-000000000002', 3),
  ('00000000-0000-0000-0000-000000000003', 9, 'Laptop 1', 'line', null, false, '00000000-0000-0000-0003-000000000003', 0),
  ('00000000-0000-0000-0000-000000000003', 10, 'Laptop 2', 'line', null, false, '00000000-0000-0000-0003-000000000003', 1),
  ('00000000-0000-0000-0000-000000000003', 11, 'Video Playback', 'line', null, false, '00000000-0000-0000-0003-000000000003', 2),
  ('00000000-0000-0000-0000-000000000003', 12, 'Comms', 'comms', null, false, '00000000-0000-0000-0003-000000000003', 3);

INSERT INTO mixes (show_id, mix_number, name, type, system, position, sort_order, feeds) VALUES
  ('00000000-0000-0000-0000-000000000003', 'Mix 1', 'Lectern Fill', 'wedge', 'QSC K8.2', 'Lectern', 0, ARRAY['Presenter 1','Presenter 2','Laptop 1']),
  ('00000000-0000-0000-0000-000000000003', 'Mix 2', 'Panel Fill', 'wedge', 'QSC K10.2', 'Panel table', 1, ARRAY['Panel 1','Panel 2','Panel 3','Panel 4','Handheld 1']),
  ('00000000-0000-0000-0000-000000000003', 'Mix 3', 'Presenter IEM', 'iem', 'Sennheiser 300 G4', 'SR', 2, ARRAY['Presenter 1','Laptop 1','Video Playback']);
