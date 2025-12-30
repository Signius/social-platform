-- Seed data for badges
INSERT INTO badges (name, description, icon, criteria) VALUES
  ('Early Adopter', 'Joined EventConnect in the first month', '🌟', '{"type": "early_user"}'),
  ('Social Butterfly', 'Connected with 50+ people', '🦋', '{"type": "connections", "count": 50}'),
  ('Event Master', 'Hosted 20+ successful events', '👑', '{"type": "hosted_events", "count": 20}'),
  ('Super Attendee', 'Attended 50+ events', '⭐', '{"type": "attended_events", "count": 50}'),
  ('Group Leader', 'Created and managed 5+ groups', '🎯', '{"type": "created_groups", "count": 5}'),
  ('Reputation Hero', 'Reached 1000 reputation points', '🏆', '{"type": "reputation", "points": 1000}'),
  ('5-Star Host', 'Received 10+ five-star ratings', '⭐⭐⭐⭐⭐', '{"type": "ratings", "count": 10, "stars": 5}'),
  ('Community Builder', 'Helped 100+ people connect', '🤝', '{"type": "facilitated_connections", "count": 100}')
ON CONFLICT DO NOTHING;

-- Note: You can add sample users, groups, and events here for testing
-- Make sure to use actual user IDs from your Supabase auth after creating test users

