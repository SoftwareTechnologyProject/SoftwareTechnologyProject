-- ==================== SEED DATA - AUTO RUN BY SPRING BOOT ====================
-- Password for all accounts: password123
-- BCrypt hash generated with bcrypt.hashpw(b'password123', bcrypt.gensalt(rounds=10))

-- Insert test users
INSERT INTO users (fullname, phonenumber, address, email, dateofbirth, role) VALUES
('Admin User', '0123456789', 'Admin Office', 'ndtoan.work@gmail.com', '1990-01-01', 'ADMIN'),
('Test Customer', '0987654321', '123 Test Street', 'customer@test.com', '1995-05-15', 'USER'),
('Staff User', '0456789123', 'Store Location', 'staff@bookstore.com', '1992-03-10', 'STAFF');

-- Insert accounts with verified status
INSERT INTO accounts (userid, username, email, password, is_account_verified, created_at) VALUES
(1, 'admin', 'ndtoan.work@gmail.com', '$2b$10$kzMt2Jtah1LXY9E8uTfAg.vxUDd93Hw3xzw4Y46yyzpX4hBPBMx.u', TRUE, NOW()),
(2, 'customer', 'customer@test.com', '$2b$10$kzMt2Jtah1LXY9E8uTfAg.vxUDd93Hw3xzw4Y46yyzpX4hBPBMx.u', TRUE, NOW()),
(3, 'staff', 'staff@bookstore.com', '$2b$10$kzMt2Jtah1LXY9E8uTfAg.vxUDd93Hw3xzw4Y46yyzpX4hBPBMx.u', TRUE, NOW());

-- Create default cart for test customer
INSERT INTO cart (user_id, created_at) VALUES (2, NOW());
