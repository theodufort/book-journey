-- Insert sample user (replace 'user_id_here' with an actual UUID)
INSERT INTO auth.users (id, email) VALUES 
('fcdee905-d3ae-425b-ad34-d6a776a64813', 'test@example.com');

-- Insert sample reading list entries
INSERT INTO reading_list (user_id, book_id, status, rating, review) VALUES
('fcdee905-d3ae-425b-ad34-d6a776a64813', '9780061120084', 'Finished', 4.5, 'Great book!'),
('fcdee905-d3ae-425b-ad34-d6a776a64813', '9781451673319', 'Reading', NULL, NULL),
('fcdee905-d3ae-425b-ad34-d6a776a64813', '9780316769174', 'To Read', NULL, NULL);

-- Insert sample user preferences
INSERT INTO user_preferences (user_id, preferred_categories) VALUES
('fcdee905-d3ae-425b-ad34-d6a776a64813', ARRAY['Fiction', 'Science Fiction', 'Mystery']);

-- Insert sample reading stats
INSERT INTO reading_stats (user_id,  pages_read, reading_time_minutes) VALUES
('fcdee905-d3ae-425b-ad34-d6a776a64813',  2500, 3000);

-- Insert sample user points
INSERT INTO user_points (user_id, points, points_earned, points_redeemed) VALUES
('fcdee905-d3ae-425b-ad34-d6a776a64813', 500, 750, 250);

-- Insert sample point transactions
INSERT INTO point_transactions (user_id, points, type, description) VALUES
('fcdee905-d3ae-425b-ad34-d6a776a64813', 100, 'earned', 'Finished reading a book'),
('fcdee905-d3ae-425b-ad34-d6a776a64813', 50, 'redeemed', 'Redeemed for a discount');

-- Insert sample user activity
INSERT INTO user_activity (user_id, activity_type, details) VALUES
('fcdee905-d3ae-425b-ad34-d6a776a64813', 'book_started', '{"book_id": "9781451673319", "title": "Fahrenheit 451"}'),
('fcdee905-d3ae-425b-ad34-d6a776a64813', 'book_finished', '{"book_id": "9780061120084", "title": "To Kill a Mockingbird"}'),
('fcdee905-d3ae-425b-ad34-d6a776a64813', 'points_earned', '{"amount": 100, "reason": "Finished reading a book"}');
