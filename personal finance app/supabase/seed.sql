-- Sample data for development and testing
-- This file should only be used in development environments

-- Note: You'll need to replace the user_id with actual user IDs from your auth.users table
-- This is just a template for seeding data

-- Insert sample transactions (replace 'your-user-id-uuid' with actual user ID)
INSERT INTO transactions (user_id, merchant, amount_cents, category, date, description, ai_confidence) VALUES
  ('your-user-id-uuid', 'Starbucks', 650, 'Food', '2024-01-15 08:30:00', 'Morning coffee', 0.92),
  ('your-user-id-uuid', 'Shell Gas Station', 4500, 'Transport', '2024-01-14 17:45:00', 'Gas fill-up', 0.95),
  ('your-user-id-uuid', 'Amazon', 2999, 'Shopping', '2024-01-13 10:20:00', 'Office supplies', 0.85),
  ('your-user-id-uuid', 'Netflix', 1599, 'Entertainment', '2024-01-12 00:00:00', 'Monthly subscription', 0.98),
  ('your-user-id-uuid', 'Whole Foods', 8750, 'Food', '2024-01-11 18:30:00', 'Grocery shopping', 0.90),
  ('your-user-id-uuid', 'Pacific Gas & Electric', 12500, 'Bills', '2024-01-10 00:00:00', 'Monthly utility bill', 0.97),
  ('your-user-id-uuid', 'CVS Pharmacy', 1250, 'Healthcare', '2024-01-09 14:15:00', 'Prescription pickup', 0.88),
  ('your-user-id-uuid', 'Uber', 1800, 'Transport', '2024-01-08 20:30:00', 'Ride home', 0.93),
  ('your-user-id-uuid', 'Target', 5699, 'Shopping', '2024-01-07 16:45:00', 'Household items', 0.87),
  ('your-user-id-uuid', 'Chipotle', 1200, 'Food', '2024-01-06 12:00:00', 'Lunch', 0.94);

-- Insert sample category rules (replace 'your-user-id-uuid' with actual user ID)
INSERT INTO category_rules (user_id, merchant, category, confidence, usage_count, last_used) VALUES
  ('your-user-id-uuid', 'Starbucks', 'Food', 0.95, 15, '2024-01-15 08:30:00'),
  ('your-user-id-uuid', 'Shell Gas Station', 'Transport', 0.98, 8, '2024-01-14 17:45:00'),
  ('your-user-id-uuid', 'Netflix', 'Entertainment', 0.99, 12, '2024-01-12 00:00:00'),
  ('your-user-id-uuid', 'Pacific Gas & Electric', 'Bills', 0.99, 12, '2024-01-10 00:00:00'),
  ('your-user-id-uuid', 'CVS Pharmacy', 'Healthcare', 0.92, 6, '2024-01-09 14:15:00');