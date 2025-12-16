package com.bookstore.backend.repository;

import com.bookstore.backend.model.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BookRepository extends JpaRepository<Book, Long> {

    Page<Book> findByCategoriesName(String categoryName, Pageable pageable);

    Page<Book> findByAuthorsName(String authorName, Pageable pageable);

    Page<Book> findByPublisherName(String publisherName, Pageable pageable);

    Page<Book> findByTitle(String keyword, Pageable pageable);

    @Query("""
        SELECT b.title
        FROM Book b
        WHERE LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
        ORDER BY b.title ASC
    """)
    List<String> findTop5Titles(@Param("keyword") String keyword, Pageable pageable);


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
}