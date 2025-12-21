package com.bookstore.backend.repository;

import com.bookstore.backend.model.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BookRepository extends JpaRepository<Book, Long> {

    // Lấy toàn bộ sachs sắp xếp theo sold
    @Query(
            value = """
            SELECT b
            FROM Book b
            JOIN b.variants v
            GROUP BY b
            ORDER BY SUM(v.sold) DESC
          """,
            countQuery = """
            SELECT COUNT(DISTINCT b)
            FROM Book b
          """
    )
    Page<Book> findAllBooks(Pageable pageable);
    // Tìm sách theo tên category (có phân trang)
    @Query(
            value = """
            SELECT b
            FROM Book b
            JOIN b.categories c
            JOIN b.variants v
            WHERE c.name = :categoryName
            GROUP BY b
            ORDER BY SUM(v.sold) DESC
          """,
            countQuery = """
            SELECT COUNT(DISTINCT b)
            FROM Book b
            JOIN b.categories c
            WHERE c.name = :categoryName
          """
    )
    Page<Book> findByCategoriesName(@Param("categoryName") String categoryName, Pageable pageable);

    // Tìm sách theo tên tác giả (có phân trang)
    Page<Book> findByAuthorsName(String authorName, Pageable pageable);

    // Tìm sách theo tên nhà xuất bản (có phân trang)
    Page<Book> findByPublisherName(String publisherName, Pageable pageable);

    // Tìm sách theo tiêu đề chính xác (có phân trang)
    Page<Book> findByTitle(String keyword, Pageable pageable);

    // Lấy danh sách tối đa 5 tiêu đề sách có chứa keyword (gợi ý search)
    @Query("""
        SELECT b.title
        FROM Book b
        WHERE LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
        ORDER BY b.title ASC
    """)
    List<String> findTop5Titles(@Param("keyword") String keyword, Pageable pageable);

    // Tìm sách theo keyword trong title, category, author hoặc publisher (search tổng hợp, có phân trang)
    @Query("""
        SELECT DISTINCT b
        FROM Book b
        LEFT JOIN b.categories c
        LEFT JOIN b.authors a
        LEFT JOIN b.publisher p
        WHERE 
            LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR LOWER(a.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
    """)
    Page<Book> findByKey(@Param("keyword") String keyword, Pageable pageable);

    @Query(value = "SELECT * FROM Book ORDER BY RANDOM() LIMIT 90", nativeQuery = true)
    List<Book> findRandomBooks();
}

    // Tìm sách theo ISBN trong bảng variants (một sách có thể có nhiều biến thể với ISBN khác nhau)
    @Query("""
        SELECT DISTINCT b 
        FROM Book b 
        JOIN b.variants v 
        WHERE v.isbn = :isbn
    """)
    List<Book> findByIsbn(@Param("isbn") String isbn);
}