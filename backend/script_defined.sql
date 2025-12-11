INSERT INTO account (
    id,
    created_at,
    email,
    is_account_verified,
    password,
    reset_otp_expired_at,
    reset_password_otp,
    status,
    updated_at,
    username,
    verify_otp,
    verify_otp_expired_at,
    user_id
)
VALUES (
    1,
    '2025-12-11 09:10:41.506649',
    NULL,
    'f',
    '$2a$10$1DoZ5zv7eSd.BBQtrydEdeYR/DmSyx.CphNNX9CkJMAN/bxQiY54.',
    0,
    NULL,
    'ACTIVE',
    '2025-12-11 09:10:41.638088',
    'Luong Ngoc Huy',
    '660931',
    1765505441631,
    1
);

INSERT INTO users (
    id,
    address,
    date_of_birth,
    email,
    full_name,
    phone_number,
    role,
    account_id
)
VALUES (
    1,
    'HCm',
    '1999-03-03 07:00:00',
    'mamatqlee1903@gmail.com',
    'Luong Ngoc Huy',
    '0941516362',
    'USER',
    1
);
