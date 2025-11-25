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
    userName VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    userId INT UNIQUE REFERENCES Users(id) ON DELETE CASCADE
);


-- ==================== VOUCHER ====================
CREATE TABLE Voucher (
    code VARCHAR(50) PRIMARY KEY, 
    effectiveDate DATE NOT NULL
);


-- ==================== AUTHOR / PUBLISHER / CATEGORY ====================
CREATE TABLE Author (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255)
);

CREATE TABLE Publisher (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255)
);

CREATE TABLE Category (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255)
);


-- ==================== BOOK ====================
CREATE TABLE Book (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    publisherId INT REFERENCES Publisher(id),
    publisherYear INT,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    description TEXT
);


-- ==================== MANY-TO-MANY ====================
CREATE TABLE book_author (
    bookId INT REFERENCES Book(id) ON DELETE CASCADE,
    authorId INT REFERENCES Author(id) ON DELETE CASCADE,
    PRIMARY KEY (bookId, authorId)
);

CREATE TABLE book_category (
    bookId INT REFERENCES Book(id) ON DELETE CASCADE,
    categoryId INT REFERENCES Category(id) ON DELETE CASCADE,
    PRIMARY KEY (bookId, categoryId)
);


-- ==================== BOOK VARIANTS ====================
CREATE TABLE BookVariants (
    id SERIAL PRIMARY KEY,
    bookId INT REFERENCES Book(id) ON DELETE CASCADE,
    price NUMERIC(12,2) NOT NULL,
    quantity INT DEFAULT 0,
    sold INT DEFAULT 0,
    status BookStatus NOT NULL,

    -- Additional variant-specific fields
    format VARCHAR(50),
    size VARCHAR(50),
    edition VARCHAR(100),
    weight NUMERIC(10,2),
    isbn VARCHAR(50)
);

CREATE TABLE BookImages (
    id SERIAL PRIMARY KEY,
    bookVariantsId INT REFERENCES BookVariants(id) ON DELETE CASCADE,
    image_url VARCHAR(255) NOT NULL
);


-- ==================== REVIEWS ====================
CREATE TABLE Reviews (
    id SERIAL PRIMARY KEY,
    userId INT REFERENCES Users(id) ON DELETE CASCADE,
    product_id INT REFERENCES Book(id) ON DELETE CASCADE,
    rating SMALLINT NOT NULL CHECK(rating BETWEEN 1 AND 5),
    comment TEXT, 
    status ReviewStatus NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ==================== ORDERS ====================
CREATE TABLE Orders (
    id SERIAL PRIMARY KEY,
    userId INT REFERENCES Users(id) ON DELETE CASCADE,
    shippingAddress TEXT NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    status StatusOrder NOT NULL,
    voucherCode VARCHAR(50) REFERENCES Voucher(code),
    paymentType PaymentType NOT NULL,
    orderDate TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE OrdersDetails (
    id SERIAL PRIMARY KEY,
    orderId INT REFERENCES Orders(id) ON DELETE CASCADE,
    bookVariantsId INT REFERENCES BookVariants(id),
    quantity INT NOT NULL,
    pricePurchased NUMERIC(12,2) NOT NULL
);


-- ==================== CART ====================
CREATE TABLE Cart ( 
    id SERIAL PRIMARY KEY,
    userId INT UNIQUE REFERENCES Users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE CartItems (
    id SERIAL PRIMARY KEY,
    cartId INT REFERENCES Cart(id) ON DELETE CASCADE,
    bookVariantsId INT REFERENCES BookVariants(id),
    quantity INT NOT NULL
);


-- ==================== WISHLIST ====================
CREATE TABLE Wishlists (
    id SERIAL PRIMARY KEY,
    userId INT REFERENCES Users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE WishlistItems (
    id SERIAL PRIMARY KEY,
    wishlistId INT REFERENCES Wishlists(id) ON DELETE CASCADE,
    bookVariantsId INT REFERENCES BookVariants(id)
);


-- ==================== NOTIFICATIONS ====================
CREATE TABLE Notifications (
    id SERIAL PRIMARY KEY,
    content TEXT,
    customerId INT REFERENCES Users(id) ON DELETE CASCADE,
    createAt TIMESTAMPTZ DEFAULT NOW(),
    isRead BOOLEAN DEFAULT FALSE
);


-- ==================== CHATBOX ====================
CREATE TABLE Conversations (
    id SERIAL PRIMARY KEY,
    customerId INT REFERENCES Users(id) ON DELETE CASCADE,
    createAt TIMESTAMPTZ DEFAULT NOW(),
    updatedAt TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE Messages (
    id SERIAL PRIMARY KEY,
    conversation_id INT REFERENCES Conversations(id) ON DELETE CASCADE,
    sender_id INT REFERENCES Users(id),
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE
);


-- ==================== FORUM ====================
CREATE TABLE Post (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    owner_id INT REFERENCES Users(id) ON DELETE CASCADE,
    content TEXT,
    createAt TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE Comments (
    comment_id SERIAL PRIMARY KEY,
    post_id INT REFERENCES Post(id) ON DELETE CASCADE,
    user_id INT REFERENCES Users(id),
    content TEXT,
    react INT DEFAULT 0,
    createAt TIMESTAMPTZ DEFAULT NOW()
);