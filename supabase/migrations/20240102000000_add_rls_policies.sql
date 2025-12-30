-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Groups Policies
CREATE POLICY "Public groups are viewable by everyone"
  ON groups FOR SELECT
  USING (
    privacy = 'public' OR 
    id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Authenticated users can create groups"
  ON groups FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group admins can update groups"
  ON groups FOR UPDATE
  USING (
    id IN (
      SELECT group_id FROM group_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Group admins can delete groups"
  ON groups FOR DELETE
  USING (
    id IN (
      SELECT group_id FROM group_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Group Members Policies
CREATE POLICY "Group members are viewable by group members"
  ON group_members FOR SELECT
  USING (
    group_id IN (
      SELECT id FROM groups WHERE privacy = 'public'
    ) OR
    group_id IN (
      SELECT group_id FROM group_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Group admins can add members"
  ON group_members FOR INSERT
  WITH CHECK (
    group_id IN (
      SELECT group_id FROM group_members 
      WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
    ) OR
    user_id = auth.uid()
  );

CREATE POLICY "Group admins can update member roles"
  ON group_members FOR UPDATE
  USING (
    group_id IN (
      SELECT group_id FROM group_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Group admins and members can remove themselves"
  ON group_members FOR DELETE
  USING (
    user_id = auth.uid() OR
    group_id IN (
      SELECT group_id FROM group_members 
      WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- Events Policies
CREATE POLICY "Events are viewable by group members or from public groups"
  ON events FOR SELECT
  USING (
    group_id IN (
      SELECT group_id FROM group_members WHERE user_id = auth.uid()
    ) OR
    group_id IN (
      SELECT id FROM groups WHERE privacy = 'public'
    )
  );

CREATE POLICY "Group members can create events"
  ON events FOR INSERT
  WITH CHECK (
    group_id IN (
      SELECT group_id FROM group_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Event creators and group admins can update events"
  ON events FOR UPDATE
  USING (
    created_by = auth.uid() OR
    group_id IN (
      SELECT group_id FROM group_members 
      WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Event creators and group admins can delete events"
  ON events FOR DELETE
  USING (
    created_by = auth.uid() OR
    group_id IN (
      SELECT group_id FROM group_members 
      WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- Event Attendees Policies
CREATE POLICY "Event attendees are viewable by group members or for public groups"
  ON event_attendees FOR SELECT
  USING (
    event_id IN (
      SELECT id FROM events WHERE group_id IN (
        SELECT group_id FROM group_members WHERE user_id = auth.uid()
      )
    ) OR
    event_id IN (
      SELECT id FROM events WHERE group_id IN (
        SELECT id FROM groups WHERE privacy = 'public'
      )
    )
  );

CREATE POLICY "Users can RSVP to events"
  ON event_attendees FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    event_id IN (
      SELECT id FROM events WHERE group_id IN (
        SELECT group_id FROM group_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update their own RSVP"
  ON event_attendees FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own RSVP"
  ON event_attendees FOR DELETE
  USING (user_id = auth.uid());

-- Comments Policies
CREATE POLICY "Comments are viewable by group members or for public groups"
  ON comments FOR SELECT
  USING (
    event_id IN (
      SELECT id FROM events WHERE group_id IN (
        SELECT group_id FROM group_members WHERE user_id = auth.uid()
      )
    ) OR
    event_id IN (
      SELECT id FROM events WHERE group_id IN (
        SELECT id FROM groups WHERE privacy = 'public'
      )
    )
  );

CREATE POLICY "Group members can comment on events"
  ON comments FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    event_id IN (
      SELECT id FROM events WHERE group_id IN (
        SELECT group_id FROM group_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE
  USING (user_id = auth.uid());

-- Connections Policies
CREATE POLICY "Users can view their own connections"
  ON connections FOR SELECT
  USING (requester_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can send connection requests"
  ON connections FOR INSERT
  WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Users can update received connections"
  ON connections FOR UPDATE
  USING (receiver_id = auth.uid());

CREATE POLICY "Users can delete their own connections"
  ON connections FOR DELETE
  USING (requester_id = auth.uid() OR receiver_id = auth.uid());

-- Messages Policies
CREATE POLICY "Users can view their own messages"
  ON messages FOR SELECT
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can send messages to connections"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM connections 
      WHERE status = 'accepted' AND (
        (requester_id = auth.uid() AND receiver_id = messages.receiver_id) OR
        (receiver_id = auth.uid() AND requester_id = messages.receiver_id)
      )
    )
  );

CREATE POLICY "Users can update their received messages"
  ON messages FOR UPDATE
  USING (receiver_id = auth.uid());

-- Badges Policies
CREATE POLICY "Badges are viewable by everyone"
  ON badges FOR SELECT
  USING (true);

-- User Badges Policies
CREATE POLICY "User badges are viewable by everyone"
  ON user_badges FOR SELECT
  USING (true);

-- Subscriptions Policies
CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own subscriptions"
  ON subscriptions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own subscriptions"
  ON subscriptions FOR UPDATE
  USING (user_id = auth.uid());

-- Notifications Policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own notifications"
  ON notifications FOR DELETE
  USING (user_id = auth.uid());

