-- Insert sample user (replace 'user_id_here' with an actual UUID)
INSERT INTO auth.users (id, email) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'test@example.com');

-- Insert sample reading list entries
INSERT INTO reading_list (user_id, book_id, status, rating, review) VALUES
('550e8400-e29b-41d4-a716-446655440000', '9780061120084', 'Finished', 4.5, 'Great book!'),
('550e8400-e29b-41d4-a716-446655440000', '9781451673319', 'Reading', NULL, NULL),
('550e8400-e29b-41d4-a716-446655440000', '9780316769174', 'To Read', NULL, NULL);

-- Insert sample user preferences
INSERT INTO user_preferences (user_id, preferred_categories) VALUES
('550e8400-e29b-41d4-a716-446655440000', ARRAY['Fiction', 'Science Fiction', 'Mystery']);

-- Insert sample reading stats
INSERT INTO reading_stats (user_id, books_read, pages_read, reading_time_minutes) VALUES
('550e8400-e29b-41d4-a716-446655440000', 10, 2500, 3000);

-- Insert sample user points
INSERT INTO user_points (user_id, points, points_earned, points_redeemed) VALUES
('550e8400-e29b-41d4-a716-446655440000', 500, 750, 250);

-- Insert sample point transactions
INSERT INTO point_transactions (user_id, points, type, description) VALUES
('550e8400-e29b-41d4-a716-446655440000', 100, 'earned', 'Finished reading a book'),
('550e8400-e29b-41d4-a716-446655440000', 50, 'redeemed', 'Redeemed for a discount');

-- Insert sample user activity
INSERT INTO user_activity (user_id, activity_type, details) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'book_started', '{"book_id": "9781451673319", "title": "Fahrenheit 451"}'),
('550e8400-e29b-41d4-a716-446655440000', 'book_finished', '{"book_id": "9780061120084", "title": "To Kill a Mockingbird"}'),
('550e8400-e29b-41d4-a716-446655440000', 'points_earned', '{"amount": 100, "reason": "Finished reading a book"}');
