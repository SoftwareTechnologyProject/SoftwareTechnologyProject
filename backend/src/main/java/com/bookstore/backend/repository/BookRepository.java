package com.bookstore.backend.repository;

import com.bookstore.backend.model.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    // Tìm sách theo tên category
    List<Book> findByCategoriesNameIgnoreCase(String categoryName);
    
    // Tìm sách theo tên author
    List<Book> findByAuthorsNameIgnoreCase(String authorName);
    
    // Tìm sách theo tên publisher
    List<Book> findByPublisherNameIgnoreCase(String publisherName);
    
    // Tìm sách theo title
    List<Book> findByTitleContainingIgnoreCase(String keyword);
}

