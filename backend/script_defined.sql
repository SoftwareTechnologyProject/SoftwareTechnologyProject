-- =========================
-- Tạo tài khoản với thứ tự đúng để tránh constraint violation
-- =========================

-- Tạm thời disable triggers/constraints
SET session_replication_role = 'replica';

-- =========================
-- 1️⃣ Tạo tài khoản STAFF (ID account = 1)
-- =========================
INSERT INTO accounts (
    id,
    username,
    password,
    status,
    is_account_verified,
    email,
    created_at,
    updated_at,
    user_id
) VALUES (
    1,
    'admin',
    '$2a$10$kyKpu7ujjptlAKj7TSrM0.Cae/bbktadVYDNBFFj5jyTW0MipPLb.', -- mật khẩu hash
    'ACTIVE',
    true,
    'admin@gmail.com',
    now(),
    now(),
    1  -- Tạm thời set user_id = 1
);

INSERT INTO users (
    id,
    full_name,
    email,
    role,
    account_id
) VALUES (
    1,
    'Admin Staff',
    'admin@gmail.com',
    'STAFF',
    1
);

-- =========================
-- 2️⃣ Tạo tài khoản USER (ID account = 2)
-- =========================
INSERT INTO accounts (
    id,
    username,
    password,
    status,
    is_account_verified,
    email,
    created_at,
    updated_at,
    user_id
) VALUES (
    2,
    'mamatqlee',
    '$2a$10$kyKpu7ujjptlAKj7TSrM0.Cae/bbktadVYDNBFFj5jyTW0MipPLb.', -- mật khẩu hash
    'ACTIVE',
    true,
    'mamatqlee1903@gmail.com',
    now(),
    now(),
    2  -- Tạm thời set user_id = 2
);

INSERT INTO users (
    id,
    full_name,
    email,
    role,
    account_id
) VALUES (
    2,
    'Luong Ngoc Huy',
    'mamatqlee1903@gmail.com',
    'USER',
    2
);

-- Enable lại constraints
SET session_replication_role = 'origin';
