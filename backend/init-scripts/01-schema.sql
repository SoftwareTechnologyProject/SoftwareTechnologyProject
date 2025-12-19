-- ==================== SCHEMA BASED ON JAVA MODELS ====================
-- Generated from Java Entity classes

-- ==================== ENUM TYPES ====================
CREATE TYPE UserRole AS ENUM ('USER', 'STAFF', 'ADMIN');
CREATE TYPE BookStatus AS ENUM ('AVAILABLE', 'OUT_OF_STOCK');
CREATE TYPE ReviewStatus AS ENUM ('PENDING', 'ACCEPTED');
CREATE TYPE StatusOrder AS ENUM ('PENDING', 'DELIVERY', 'SUCCESS');
CREATE TYPE PaymentType AS ENUM ('COD', 'BANKING');
CREATE TYPE NotificationType AS ENUM ('BROADCAST', 'PERSONAL');

-- ==================== USERS & ACCOUNTS ====================
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    fullname VARCHAR(255) NOT NULL,
    phonenumber VARCHAR(50),
    address TEXT,
    email VARCHAR(255) UNIQUE NOT NULL,
    dateofbirth DATE,
    role UserRole NOT NULL
);

CREATE TABLE accounts (
    id BIGSERIAL PRIMARY KEY,
    userid BIGINT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    verify_otp VARCHAR(255),
    is_account_verified BOOLEAN DEFAULT FALSE,
    verify_otp_expired_at BIGINT,
    reset_password_otp VARCHAR(255),
    reset_otp_expired_at BIGINT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ==================== AUTHOR & PUBLISHER ====================
CREATE TABLE author (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE publisher (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- ==================== CATEGORY ====================
CREATE TABLE category (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- ==================== BOOK ====================
CREATE TABLE book (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    publisher_id BIGINT REFERENCES publisher(id),
    publisher_year INTEGER,
    description TEXT,
    published_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- ==================== MANY-TO-MANY ====================
CREATE TABLE book_author (
    book_id BIGINT REFERENCES book(id) ON DELETE CASCADE,
    author_id BIGINT REFERENCES author(id) ON DELETE CASCADE,
    PRIMARY KEY (book_id, author_id)
);

CREATE TABLE book_category (
    book_id BIGINT REFERENCES book(id) ON DELETE CASCADE,
    category_id BIGINT REFERENCES category(id) ON DELETE CASCADE,
    PRIMARY KEY (book_id, category_id)
);

-- ==================== BOOK VARIANTS ====================
CREATE TABLE book_variants (
    id BIGSERIAL PRIMARY KEY,
    book_id BIGINT REFERENCES book(id) ON DELETE CASCADE,
    price NUMERIC(15,2) NOT NULL,
    quantity INTEGER DEFAULT 0,
    sold INTEGER DEFAULT 0,
    status VARCHAR(50) NOT NULL,
    format VARCHAR(50),
    size VARCHAR(50),
    edition VARCHAR(100),
    weight NUMERIC(10,2),
    isbn VARCHAR(50)
);

-- ==================== BOOK IMAGES ====================
CREATE TABLE book_images (
    id BIGSERIAL PRIMARY KEY,
    book_variant_id BIGINT REFERENCES book_variants(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL
);

-- ==================== CART ====================
CREATE TABLE cart (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE cart_items (
    id BIGSERIAL PRIMARY KEY,
    cart_id BIGINT REFERENCES cart(id) ON DELETE CASCADE,
    book_variant_id BIGINT REFERENCES book_variants(id),
    quantity INTEGER NOT NULL
);

-- ==================== VOUCHER ====================
CREATE TABLE voucher (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL,
    discount_value NUMERIC(15,2) NOT NULL,
    min_order_value NUMERIC(15,2),
    max_discount NUMERIC(15,2),
    quantity INTEGER,
    used_count INTEGER DEFAULT 0,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ==================== ORDERS ====================
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    shipping_address TEXT NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    status StatusOrder NOT NULL,
    payment_type PaymentType NOT NULL,
    voucher_code VARCHAR(50) REFERENCES voucher(code),
    order_date TIMESTAMP DEFAULT NOW()
);

CREATE TABLE orders_details (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
    book_variant_id BIGINT REFERENCES book_variants(id),
    quantity INTEGER NOT NULL,
    price_purchased NUMERIC(15,2) NOT NULL
);

-- ==================== REVIEWS ====================
CREATE TABLE reviews (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    book_id BIGINT REFERENCES book(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT NOW()
);

-- ==================== NOTIFICATIONS ====================
CREATE TABLE notification (
    id BIGSERIAL PRIMARY KEY,
    content TEXT,
    create_at TIMESTAMP DEFAULT NOW(),
    url VARCHAR(500),
    type NotificationType
);

CREATE TABLE usernotification (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    notification_id BIGINT REFERENCES notification(id),
    is_read BOOLEAN DEFAULT FALSE
);

-- ==================== CHATBOX ====================
CREATE TABLE conversations (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    admin_id BIGINT REFERENCES users(id),
    create_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id BIGINT REFERENCES users(id),
    receiver_id BIGINT REFERENCES users(id),
    content TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE
);

-- ==================== FORUM ====================
CREATE TABLE post (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    owner_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    content TEXT,
    create_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE comments (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT REFERENCES post(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id),
    content TEXT,
    react INTEGER DEFAULT 0,
    create_at TIMESTAMP DEFAULT NOW()
);

-- ==================== BLOG ====================
CREATE TABLE blog_posts (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    cover_image VARCHAR(500),
    author VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE blog_comments (
    id BIGSERIAL PRIMARY KEY,
    commenter_name VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    blog_post_id BIGINT NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE
);

-- ==================== INDEXES FOR PERFORMANCE ====================
CREATE INDEX idx_book_publisher ON book(publisher_id);
CREATE INDEX idx_book_title ON book(title);
CREATE INDEX idx_book_variants_book ON book_variants(book_id);
CREATE INDEX idx_book_images_variant ON book_images(book_variant_id);
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX idx_cart_items_variant ON cart_items(book_variant_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_details_order ON orders_details(order_id);
CREATE INDEX idx_reviews_book ON reviews(book_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_voucher_code ON voucher(code);
CREATE INDEX idx_blog_comments_post ON blog_comments(blog_post_id);
CREATE INDEX idx_blog_posts_created ON blog_posts(created_at);

-- ==================== SAMPLE USER DATA ====================
INSERT INTO users (fullname, phonenumber, address, email, dateofbirth, role) VALUES
('Admin User', '0123456789', 'Admin Office', 'admin@bookstore.com', '1990-01-01', 'ADMIN'),
('Test Customer', '0987654321', '123 Test Street', 'customer@test.com', '1995-05-15', 'USER'),
('Staff User', '0456789123', 'Store Location', 'staff@bookstore.com', '1992-03-10', 'STAFF');

INSERT INTO accounts (userid, username, email, password, is_account_verified, created_at) VALUES
(1, 'admin', 'admin@bookstore.com', '$2a$10$example_hashed_password_admin', TRUE, NOW()),
(2, 'customer', 'customer@test.com', '$2a$10$example_hashed_password_customer', TRUE, NOW()),
(3, 'staff', 'staff@bookstore.com', '$2a$10$example_hashed_password_staff', TRUE, NOW());

-- Create default cart for test customer
INSERT INTO cart (user_id, created_at) VALUES (2, NOW());
