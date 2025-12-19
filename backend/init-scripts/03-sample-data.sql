-- =====================================================
-- SAMPLE DATA: Update Users & Vouchers
-- Auto-run when Docker starts
-- Password for all users: "password123"
-- =====================================================

-- =========================
-- 1. UPDATE USER PASSWORDS (01-schema.sql created users with invalid passwords)
-- =========================
-- BCrypt hash of "password123": $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

DO $$
BEGIN
    -- Update passwords for users created by 01-schema.sql  
    -- BCrypt hash: $2b$10$gx5SK3voCbWdcbYAI1DFvegCUlmCW70b7Oca7O41aKDIVy5d/ck/O
    UPDATE Accounts SET password = '$2b$10$gx5SK3voCbWdcbYAI1DFvegCUlmCW70b7Oca7O41aKDIVy5d/ck/O' 
    WHERE username IN ('admin', 'customer', 'staff');
    
    RAISE NOTICE 'Updated user passwords to: password123';
END $$;


-- =========================
-- 2. SAMPLE VOUCHERS
-- =========================

DO $$
BEGIN
    -- Insert vouchers (if not exists)
    IF NOT EXISTS (SELECT 1 FROM voucher WHERE code = 'WELCOME10') THEN
        INSERT INTO voucher (code, name, discounttype, discountvalue, minordervalue, maxdiscount, startdate, enddate, quantity, usedcount, description)
        VALUES ('WELCOME10', 'Welcome Discount', 'PERCENTAGE', 10, 0, 50000, NOW(), NOW() + INTERVAL '30 days', 100, 0, 'Welcome 10% discount for new customers');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM voucher WHERE code = 'BOOK50K') THEN
        INSERT INTO voucher (code, name, discounttype, discountvalue, minordervalue, maxdiscount, startdate, enddate, quantity, usedcount, description)
        VALUES ('BOOK50K', 'Book 50K Off', 'FIXED_AMOUNT', 50000, 200000, 50000, NOW(), NOW() + INTERVAL '30 days', 50, 0, '50K discount for orders above 200K');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM voucher WHERE code = 'STUDENT15') THEN
        INSERT INTO voucher (code, name, discounttype, discountvalue, minordervalue, maxdiscount, startdate, enddate, quantity, usedcount, description)
        VALUES ('STUDENT15', 'Student Discount', 'PERCENTAGE', 15, 100000, 100000, NOW(), NOW() + INTERVAL '60 days', 200, 0, 'Student discount 15%');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM voucher WHERE code = 'FLASH20') THEN
        INSERT INTO voucher (code, name, discounttype, discountvalue, minordervalue, maxdiscount, startdate, enddate, quantity, usedcount, description)
        VALUES ('FLASH20', 'Flash Sale', 'PERCENTAGE', 20, 0, 100000, NOW(), NOW() + INTERVAL '7 days', 30, 0, 'Flash sale 20% off');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM voucher WHERE code = 'EXPIRED') THEN
        INSERT INTO voucher (code, name, discounttype, discountvalue, minordervalue, maxdiscount, startdate, enddate, quantity, usedcount, description)
        VALUES ('EXPIRED', 'Expired Voucher', 'PERCENTAGE', 25, 0, 150000, NOW() - INTERVAL '30 days', NOW() - INTERVAL '1 day', 10, 0, 'Expired voucher for testing');
    END IF;
    
    RAISE NOTICE 'Sample vouchers ready';
END $$;
