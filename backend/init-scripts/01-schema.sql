-- ==================== SCHEMA INITIALIZATION ====================
-- This file creates the database schema
-- It should run before any data seeding

-- ==================== ENUM TYPES ====================
CREATE TYPE UserRole AS ENUM ('CUSTOMER', 'STAFF', 'OWNER');
CREATE TYPE BookStatus AS ENUM ('AVAILABLE', 'OUT_OF_STOCK');
CREATE TYPE ReviewStatus AS ENUM ('PENDING', 'ACCEPTED');
CREATE TYPE StatusOrder AS ENUM ('PENDING', 'DELIVERY', 'SUCCESS');
CREATE TYPE PaymentType AS ENUM ('COD', 'BANKING');

-- ==================== USERS & ACCOUNTS ====================
CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    fullName VARCHAR(255) NOT NULL,
    phoneNumber VARCHAR(50),
    address TEXT,
    email VARCHAR(255) UNIQUE NOT NULL,
    dateOfBirth DATE,
    role UserRole NOT NULL
);

CREATE TABLE Accounts (
    id SERIAL PRIMARY KEY,
    userId INTEGER REFERENCES Users(id) ON DELETE CASCADE,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT NOW(),
    lastLogin TIMESTAMP
);

-- ==================== CATEGORIES ====================
CREATE TABLE Category (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parentId INTEGER REFERENCES Category(id),
    isLeaf BOOLEAN DEFAULT FALSE
);

-- ==================== BOOKS ====================
CREATE TABLE Book (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    author VARCHAR(255),
    authorId INTEGER,
    isbn13 VARCHAR(20),
    publisher VARCHAR(255),
    manufacturer VARCHAR(255),
    publishYear INTEGER,
    pages INTEGER,
    bookCover VARCHAR(50),
    description TEXT,
    categoryId INTEGER REFERENCES Category(id),
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW()
);

CREATE TABLE BookVariant (
    id SERIAL PRIMARY KEY,
    bookId INTEGER REFERENCES Book(id) ON DELETE CASCADE,
    price DECIMAL(15,2) NOT NULL,
    originalPrice DECIMAL(15,2),
    discountRate DECIMAL(5,2) DEFAULT 0,
    quantity INTEGER NOT NULL DEFAULT 0,
    status BookStatus NOT NULL DEFAULT 'AVAILABLE',
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW()
);

-- ==================== SHOPPING CART ====================
CREATE TABLE Cart (
    id SERIAL PRIMARY KEY,
    userId INTEGER REFERENCES Users(id) ON DELETE CASCADE,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW()
);

CREATE TABLE CartItem (
    id SERIAL PRIMARY KEY,
    cartId INTEGER REFERENCES Cart(id) ON DELETE CASCADE,
    bookVariantId INTEGER REFERENCES BookVariant(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    createdAt TIMESTAMP DEFAULT NOW(),
    UNIQUE(cartId, bookVariantId)
);

-- ==================== ORDERS ====================
CREATE TABLE "Order" (
    id SERIAL PRIMARY KEY,
    userId INTEGER REFERENCES Users(id),
    totalAmount DECIMAL(15,2) NOT NULL,
    shippingAddress TEXT NOT NULL,
    status StatusOrder NOT NULL DEFAULT 'PENDING',
    paymentType PaymentType NOT NULL DEFAULT 'COD',
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW()
);

CREATE TABLE OrderItem (
    id SERIAL PRIMARY KEY,
    orderId INTEGER REFERENCES "Order"(id) ON DELETE CASCADE,
    bookVariantId INTEGER REFERENCES BookVariant(id),
    quantity INTEGER NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    createdAt TIMESTAMP DEFAULT NOW()
);

-- ==================== REVIEWS ====================
CREATE TABLE Review (
    id SERIAL PRIMARY KEY,
    userId INTEGER REFERENCES Users(id),
    bookId INTEGER REFERENCES Book(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    reviewText TEXT,
    status ReviewStatus NOT NULL DEFAULT 'PENDING',
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW()
);

-- ==================== VOUCHERS ====================
CREATE TABLE Voucher (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    discountType VARCHAR(20) NOT NULL CHECK (discountType IN ('PERCENTAGE', 'FIXED_AMOUNT')),
    discountValue DECIMAL(15,2) NOT NULL,
    minOrderValue DECIMAL(15,2) DEFAULT 0,
    maxDiscount DECIMAL(15,2) DEFAULT 0,
    quantity INTEGER,
    usedCount INTEGER DEFAULT 0,
    startDate TIMESTAMP,
    endDate TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW()
);

-- ==================== NOTIFICATIONS ====================
CREATE TABLE Notification (
    id SERIAL PRIMARY KEY,
    userId INTEGER REFERENCES Users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    isRead BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT NOW()
);

-- ==================== INDEXES FOR PERFORMANCE ====================
CREATE INDEX idx_book_category ON Book(categoryId);
CREATE INDEX idx_book_title ON Book(title);
CREATE INDEX idx_book_author ON Book(author);
CREATE INDEX idx_bookvariant_book ON BookVariant(bookId);
CREATE INDEX idx_cartitem_cart ON CartItem(cartId);
CREATE INDEX idx_cartitem_variant ON CartItem(bookVariantId);
CREATE INDEX idx_orderitem_order ON OrderItem(orderId);
CREATE INDEX idx_review_book ON Review(bookId);
CREATE INDEX idx_review_user ON Review(userId);
CREATE INDEX idx_notification_user ON Notification(userId);
CREATE INDEX idx_voucher_code ON Voucher(code);
CREATE INDEX idx_voucher_status ON Voucher(status);

-- ==================== SAMPLE USER DATA ====================
-- Insert default admin user
INSERT INTO Users (fullName, phoneNumber, address, email, dateOfBirth, role) VALUES
('Admin User', '0123456789', 'Admin Office', 'admin@bookstore.com', '1990-01-01', 'OWNER'),
('Test Customer', '0987654321', '123 Test Street', 'customer@test.com', '1995-05-15', 'CUSTOMER'),
('Staff User', '0456789123', 'Store Location', 'staff@bookstore.com', '1992-03-10', 'STAFF');

-- Insert accounts for users
INSERT INTO Accounts (userId, username, password, createdAt) VALUES
(1, 'admin', '$2a$10$example_hashed_password_admin', NOW()),
(2, 'customer', '$2a$10$example_hashed_password_customer', NOW()),
(3, 'staff', '$2a$10$example_hashed_password_staff', NOW());

-- Create default cart for test customer
INSERT INTO Cart (userId, createdAt) VALUES (2, NOW());