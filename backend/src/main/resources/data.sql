-- ==================== SEED DATA - AUTO RUN BY SPRING BOOT ====================
-- Password for all accounts: password123
-- BCrypt hash generated with bcrypt.hashpw(b'password123', bcrypt.gensalt(rounds=10))

-- Insert test users
INSERT INTO users (fullname, phonenumber, address, email, dateofbirth, role) VALUES
('Admin User', '0123456789', 'Admin Office', 'ndtoan.work@gmail.com', '1990-01-01', 'ADMIN'),
('Test Customer', '0987654321', '123 Test Street', 'customer@gamil.com', '1995-05-15', 'USER'),
('Staff User', '0456789123', 'Store Location', 'staff@gmail.com', '1992-03-10', 'STAFF');

-- Insert accounts with verified status
-- Password: password123 (BCrypt hash generated with Java BCryptPasswordEncoder, strength=10)
INSERT INTO accounts (userid, username, email, password, is_account_verified, created_at, status) VALUES
(1, 'admin', 'ndtoan.work@gmail.com', '$2a$10$Ons6x3qAWGYOK1wYv1m6JOgBjczmdWoB1LDMr9X7xmUIaMvan26Pq', TRUE, NOW(), 'ACTIVE'),
(2, 'customer', 'customer@gmail.com', '$2a$10$Ons6x3qAWGYOK1wYv1m6JOgBjczmdWoB1LDMr9X7xmUIaMvan26Pq', TRUE, NOW(), 'ACTIVE'),
(3, 'staff', 'staff@gmail.com', '$2a$10$Ons6x3qAWGYOK1wYv1m6JOgBjczmdWoB1LDMr9X7xmUIaMvan26Pq', TRUE, NOW(), 'ACTIVE');

-- Create default cart for test customer
INSERT INTO cart (user_id, created_at) VALUES (2, NOW());
