-- Function to increment reputation
CREATE OR REPLACE FUNCTION increment_reputation(
  p_user_id UUID,
  p_points INTEGER
)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET reputation_score = reputation_score + p_points
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to automatically add group creator as admin
CREATE OR REPLACE FUNCTION add_group_creator_as_admin()
RETURNS trigger AS $$
BEGIN
  INSERT INTO group_members (group_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'admin');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to add group creator as admin
CREATE OR REPLACE TRIGGER on_group_created
  AFTER INSERT ON groups
  FOR EACH ROW EXECUTE FUNCTION add_group_creator_as_admin();

-- Function to check subscription limits
CREATE OR REPLACE FUNCTION check_subscription_limit(
  p_user_id UUID,
  p_limit_type TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_subscription_tier TEXT;
  v_groups_count INTEGER;
  v_events_count INTEGER;
BEGIN
  SELECT subscription_tier INTO v_subscription_tier
  FROM profiles
  WHERE id = p_user_id;

  IF v_subscription_tier = 'premium' THEN
    RETURN true;
  END IF;

  IF p_limit_type = 'groups' THEN
    SELECT COUNT(*) INTO v_groups_count
    FROM group_members
    WHERE user_id = p_user_id;
    
    RETURN v_groups_count < 3;
  ELSIF p_limit_type = 'events' THEN
    SELECT COUNT(*) INTO v_events_count
    FROM events
    WHERE created_by = p_user_id 
    AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW());
    
    RETURN v_events_count < 1;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user stats
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id UUID)
RETURNS TABLE (
  hosted_events BIGINT,
  attended_events BIGINT,
  groups_count BIGINT,
  connections_count BIGINT,
  avg_rating NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM events WHERE created_by = p_user_id) as hosted_events,
    (SELECT COUNT(*) FROM event_attendees WHERE user_id = p_user_id AND attended = true) as attended_events,
    (SELECT COUNT(*) FROM group_members WHERE user_id = p_user_id) as groups_count,
    (SELECT COUNT(*) FROM connections WHERE (requester_id = p_user_id OR receiver_id = p_user_id) AND status = 'accepted') as connections_count,
    (SELECT AVG(rating)::NUMERIC(3,2) FROM event_attendees WHERE user_id = p_user_id AND rating IS NOT NULL) as avg_rating;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get group stats
CREATE OR REPLACE FUNCTION get_group_stats(p_group_id UUID)
RETURNS TABLE (
  members_count BIGINT,
  events_count BIGINT,
  upcoming_events BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM group_members WHERE group_id = p_group_id) as members_count,
    (SELECT COUNT(*) FROM events WHERE group_id = p_group_id) as events_count,
    (SELECT COUNT(*) FROM events WHERE group_id = p_group_id AND status = 'upcoming' AND start_time > NOW()) as upcoming_events;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

