-- Fix show_users insert policy: allow the show creator to add themselves
-- The original policy only allowed existing editors, creating a chicken-and-egg problem
DROP POLICY IF EXISTS "show_users_insert" ON show_users;

CREATE POLICY "show_users_insert" ON show_users FOR INSERT WITH CHECK (
  -- Allow if you're an existing editor of this show
  EXISTS (
    SELECT 1 FROM show_users su
    WHERE su.show_id = show_users.show_id
    AND su.user_id = auth.uid()
    AND su.permission = 'editor'
  )
  OR
  -- Allow if you just created this show (no show_users yet)
  EXISTS (
    SELECT 1 FROM shows s
    WHERE s.id = show_users.show_id
    AND s.created_by = auth.uid()
    AND NOT EXISTS (
      SELECT 1 FROM show_users su2 WHERE su2.show_id = show_users.show_id
    )
  )
);

-- Also fix: allow inserting channel_groups for template cloning
-- (channels/mixes policies already allow editor insert)
