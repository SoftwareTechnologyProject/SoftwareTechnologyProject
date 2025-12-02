-- -----------------------
-- USERS
-- -----------------------
INSERT INTO users (id, full_name, email, phone_number, role)
VALUES
    (1, 'John Doe', 'john@example.com', '0123456789', 'CUSTOMER'),
    (2, 'Admin', 'admin@example.com', '0987654321', 'ADMIN');

-- -----------------------
-- BOOK
-- -----------------------
INSERT INTO book (id, title, publisher_id, publisher_year, description)
VALUES
    (1, 'Clean Code', NULL, 2008, 'A Handbook of Agile Software Craftsmanship'),
    (2, 'Effective Java', NULL, 2018, 'Best practices for Java programming');

-- -----------------------
-- BOOK_VARIANTS
-- -----------------------
INSERT INTO book_variants (id, book_id, price, quantity, format, status)
VALUES
    (1, 1, 500000, 10, 'Paperback', 'AVAILABLE'),
    (2, 1, 800000, 5, 'Hardcover', 'AVAILABLE'),
    (3, 2, 600000, 8, 'Paperback', 'AVAILABLE');

-- -----------------------
-- ORDERS
-- -----------------------
INSERT INTO orders (id, user_id, shipping_address, phone_number, status, payment_type, order_date)
VALUES
    (1, 1, '123 Street A', '0123456789', 'PENDING', 'COD', NOW());

-- -----------------------
-- ORDER_DETAILS
-- -----------------------
INSERT INTO orders_details (id, order_id, book_variant_id, quantity, price_purchased)
VALUES
    (1, 1, 1, 2, 500000),
    (2, 1, 3, 1, 600000);
