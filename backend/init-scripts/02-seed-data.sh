#!/bin/bash
# ==================== DATA SEEDING SCRIPT ====================
# This script loads sample data from CSV files into the database
# It should run after schema initialization

set -e

echo "🌱 Starting data seeding process..."

# Check if we should load sample data
if [ "${LOAD_SAMPLE_DATA:-true}" = "false" ]; then
    echo "⏭️  LOAD_SAMPLE_DATA is false, skipping data seeding"
    exit 0
fi

# Wait for PostgreSQL to be ready
until pg_isready -h localhost -p 5432 -U ${POSTGRES_USER}; do
    echo "⏳ Waiting for PostgreSQL to be ready..."
    sleep 2
done

echo "🔗 PostgreSQL is ready, starting data import..."

# Define database connection
export PGPASSWORD=${POSTGRES_PASSWORD}
DB_CONN="psql -h localhost -U ${POSTGRES_USER} -d ${POSTGRES_DB}"

# Function to execute SQL with error handling
execute_sql() {
    local sql="$1"
    local description="$2"
    
    echo "📝 $description"
    if echo "$sql" | $DB_CONN; then
        echo "✅ $description completed"
    else
        echo "❌ $description failed"
        return 1
    fi
}

# Function to load CSV data
load_csv_data() {
    local table="$1"
    local csv_file="$2"
    local columns="$3"
    local description="$4"
    
    echo "📊 $description"
    
    # Copy CSV data to temporary table first, then process
    local temp_table="${table}_temp"
    
    # Create temporary table
    execute_sql "DROP TABLE IF EXISTS $temp_table;" "Dropping temporary table $temp_table"
    
    # Copy CSV data
    if $DB_CONN -c "\\copy $table($columns) FROM '$csv_file' WITH (FORMAT csv, HEADER true, DELIMITER ',', QUOTE '\"', ESCAPE '\"')"; then
        echo "✅ $description completed"
    else
        echo "❌ $description failed"
        return 1
    fi
}

# ==================== LOAD CATEGORIES ====================
echo "📁 Loading categories data..."

# Load categories from CSV
CATEGORIES_CSV="/docker-entrypoint-initdb.d/categories.csv"
if [ -f "$CATEGORIES_CSV" ]; then
    execute_sql "
        -- Create temporary table for categories
        CREATE TEMP TABLE categories_import (
            id INTEGER,
            parent_id INTEGER,
            name TEXT,
            is_leaf BOOLEAN
        );
        
        -- Copy data from CSV
        \\copy categories_import FROM '$CATEGORIES_CSV' WITH (FORMAT csv, HEADER true);
        
        -- Insert into Category table with proper handling
        INSERT INTO Category (id, parentId, name, isLeaf)
        SELECT id, 
               CASE WHEN parent_id = 0 THEN NULL ELSE parent_id END,
               name, 
               is_leaf
        FROM categories_import
        ON CONFLICT (id) DO NOTHING;
        
        -- Update sequence
        SELECT setval('category_id_seq', COALESCE(MAX(id), 1)) FROM Category;
    " "Loading categories from CSV"
else
    echo "⚠️  Categories CSV file not found at $CATEGORIES_CSV"
fi

# ==================== LOAD BOOKS DATA ====================
echo "📚 Loading books data..."

BOOKS_CSV="/docker-entrypoint-initdb.d/data.csv"
if [ -f "$BOOKS_CSV" ]; then
    execute_sql "
        -- Create temporary table for books import
        CREATE TEMP TABLE books_import (
            category_id INTEGER,
            id INTEGER,
            title TEXT,
            author TEXT,
            author_id INTEGER,
            price DECIMAL(15,2),
            original_price DECIMAL(15,2),
            discount_rate DECIMAL(5,2),
            rating_average DECIMAL(3,2),
            review_count INTEGER,
            review_text TEXT,
            quantity_sold INTEGER,
            publisher TEXT,
            manufacturer TEXT,
            publish_year INTEGER,
            isbn13 TEXT,
            book_cover TEXT,
            pages INTEGER,
            seller_name TEXT,
            seller_id INTEGER
        );
        
        -- Copy data from CSV
        \\copy books_import FROM '$BOOKS_CSV' WITH (FORMAT csv, HEADER true);
        
        -- Insert books (clean up duplicates by title + author)
        INSERT INTO Book (id, title, author, authorId, isbn13, publisher, manufacturer, publishYear, pages, bookCover, categoryId)
        SELECT DISTINCT ON (title, author)
               id,
               title,
               author,
               author_id,
               CASE WHEN isbn13 = '' THEN NULL ELSE isbn13 END,
               CASE WHEN publisher = '' THEN NULL ELSE publisher END,
               CASE WHEN manufacturer = '' THEN NULL ELSE manufacturer END,
               CASE WHEN publish_year = 0 THEN NULL ELSE publish_year END,
               CASE WHEN pages = 0 THEN NULL ELSE pages END,
               CASE WHEN book_cover = '' THEN NULL ELSE book_cover END,
               CASE WHEN category_id = 0 THEN NULL ELSE category_id END
        FROM books_import
        WHERE title IS NOT NULL AND title != ''
        ORDER BY title, author, id
        ON CONFLICT (id) DO NOTHING;
        
        -- Insert book variants
        INSERT INTO BookVariant (bookId, price, originalPrice, discountRate, quantity, status)
        SELECT b.id,
               bi.price,
               bi.original_price,
               bi.discount_rate,
               GREATEST(bi.quantity_sold, 10), -- Ensure minimum stock
               CASE WHEN bi.quantity_sold > 0 THEN 'AVAILABLE'::BookStatus 
                    ELSE 'OUT_OF_STOCK'::BookStatus END
        FROM books_import bi
        JOIN Book b ON b.id = bi.id
        ON CONFLICT DO NOTHING;
        
        -- Update sequences
        SELECT setval('book_id_seq', COALESCE(MAX(id), 1)) FROM Book;
        SELECT setval('bookvariant_id_seq', COALESCE(MAX(id), 1)) FROM BookVariant;
        
    " "Loading books and variants from CSV"
else
    echo "⚠️  Books CSV file not found at $BOOKS_CSV"
fi

# ==================== CREATE SAMPLE VOUCHERS ====================
echo "🎫 Creating sample vouchers..."

execute_sql "
    INSERT INTO Voucher (code, name, description, discountType, discountValue, minOrderValue, maxDiscount, quantity, usedCount, startDate, endDate, status) VALUES
    ('WELCOME10', 'Chào mừng khách hàng mới', 'Giảm 10% cho đơn hàng đầu tiên', 'PERCENTAGE', 10, 100000, 50000, 100, 0, NOW(), NOW() + INTERVAL '30 days', 'ACTIVE'),
    ('BOOK50K', 'Giảm 50K', 'Giảm 50.000đ cho đơn từ 500.000đ', 'FIXED_AMOUNT', 50000, 500000, 0, 50, 5, NOW(), NOW() + INTERVAL '60 days', 'ACTIVE'),
    ('STUDENT15', 'Ưu đãi sinh viên', 'Giảm 15% cho sinh viên', 'PERCENTAGE', 15, 200000, 100000, 200, 10, NOW(), NOW() + INTERVAL '90 days', 'ACTIVE'),
    ('FLASH20', 'Flash Sale', 'Giảm 20% - Số lượng có hạn', 'PERCENTAGE', 20, 300000, 150000, 20, 15, NOW(), NOW() + INTERVAL '7 days', 'ACTIVE'),
    ('EXPIRED', 'Voucher hết hạn', 'Voucher đã hết hạn để test', 'PERCENTAGE', 25, 100000, 100000, 10, 2, NOW() - INTERVAL '10 days', NOW() - INTERVAL '1 day', 'EXPIRED');
" "Creating sample vouchers"

# ==================== FINAL STATISTICS ====================
echo "📊 Data loading completed! Database statistics:"

execute_sql "
    SELECT 'Categories' as table_name, COUNT(*) as record_count FROM Category
    UNION ALL
    SELECT 'Books' as table_name, COUNT(*) as record_count FROM Book  
    UNION ALL
    SELECT 'Book Variants' as table_name, COUNT(*) as record_count FROM BookVariant
    UNION ALL
    SELECT 'Vouchers' as table_name, COUNT(*) as record_count FROM Voucher
    UNION ALL
    SELECT 'Users' as table_name, COUNT(*) as record_count FROM Users;
" "Displaying final statistics"

echo "🎉 Sample data seeding completed successfully!"