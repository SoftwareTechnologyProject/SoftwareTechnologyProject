package com.bookstore.backend.repository;

import com.bookstore.backend.model.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookRepository extends JpaRepository<Book, Long> {

    Page<Book> findByCategoriesName(String categoryName, Pageable pageable);

    Page<Book> findByAuthorsName(String authorName, Pageable pageable);

    Page<Book> findByPublisherName(String publisherName, Pageable pageable);

    Page<Book> findByTitle(String keyword, Pageable pageable);
}