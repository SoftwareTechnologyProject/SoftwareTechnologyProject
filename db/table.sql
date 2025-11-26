CREATE TABLE Accounts (
    id SERIAL PRIMARY KEY,
    userId INT,
    userName VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    fullName VARCHAR(255) NOT NULL,
    phoneNumber VARCHAR(50),
    address TEXT,
    email VARCHAR(255) UNIQUE NOT NULL,
    dateOfBirth DATE,
    role UserRole NOT NULL, --ENUM
    accountId INT REFERENCES Accounts(id)
);

CREATE TABLE Voucher (
    code VARCHAR(50) PRIMARY KEY, 
    effectiveDate DATE NOT NULL
);

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

CREATE TABLE Book (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    authorId INT,
    categoryId INT,
    publisherId INT,
    published IMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    description TEXT
);

CREATE TABLE book_category (
    bookId INT,
    categoryId INT,
    PRIMARY KEY (bookId, categoryId),
    FOREIGN KEY (bookId) REFERENCES Book(id) ON DELETE CASCADE,
    FOREIGN KEY (categoryId) REFERENCES Category(id) ON DELETE CASCADE
);

CREATE TABLE BookVariants (
    id SERIAL PRIMARY KEY,
    bookId INT REFERENCES Book(id),
    price DOUBLE NOT NULL,
    quantity INT,
    status BookStatus NOT NULL -- ENUM
);

CREATE TABLE BookImages (
    id SERIAL PRIMARY KEY,
    bookVariantsId INT REFERENCES BookVariants(id),
    image_url VARCHAR(255) NOT NULL
);

CREATE TABLE Reviews (
    id SERIAL PRIMARY KEY,
    userId INT REFERENCES Users(id),
    product_id INT REFERENCES Book(id),
    rating SMALLINT NOT NULL CHECK(rating BETWEEN 1 AND 5), --nếu đánh giá sao
    comment TEXT, 
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE Orders (
    id SERIAL PRIMARY KEY,
    userId INT REFERENCES Users(id),
    shipping_address TEXT NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    status StatusOrder NOT NULL, --ENUM
    voucherCode VARCHAR(50) REFERENCES Voucher(code), 
    paymentType PaymentType NOT NULL,
    orderDate DATE NOT NULL
);

CREATE TABLE OrdersDetails (
    id SERIAL PRIMARY KEY,
    orderId INT REFERENCES Orders(id),
    bookVariantsId REFERENCES BookVariants(id),
    quantity INT,
    pricePurchased DOUBLE
);

CREATE TABLE Cart (
    id SERIAL PRIMARY KEY,
    userid INT REFERENCES Users(id), 
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE CartItems (
    id SERIAL PRIMARY KEY,
    cartId INT REFERENCES Cart(id), 
    bookVariantsId REFERENCES BookVariants(id),
    quantity INT
);

CREATE TABLE Conversations (
    id SERIAL PRIMARY KEY,
    customerId INT REFERENCES Users(id), 
    content TEXT NOT NULL,
    createAt TIMESTAMPTZ DEFAULT NOW(),
    updatedAt TIMESTAMPTZ DEFAULT NOW()
);

--Nếu lưu message thì dùng
CREATE TABLE Messages (
    id SERIAL PRIMARY KEY,
    conversation_id INT REFERENCES Conversations(id) ON DELETE CASCADE,
    sender_id INT REFERENCES users(id),
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE
);
