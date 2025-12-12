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
    updated_at
) VALUES (
    1,
    'admin',
    '$2a$10$kyKpu7ujjptlAKj7TSrM0.Cae/bbktadVYDNBFFj5jyTW0MipPLb.', -- mật khẩu hash
    'ACTIVE',
    true,
    'admin@gmail.com',
    now(),
    now()
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
    updated_at
) VALUES (
    2,
    'mamatqlee',
    '$2a$10$kyKpu7ujjptlAKj7TSrM0.Cae/bbktadVYDNBFFj5jyTW0MipPLb.', -- mật khẩu hash
    'ACTIVE',
    true,
    'mamatqlee1903@gmail.com',
    now(),
    now()
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
