package com.bookstore.backend.repository;

import com.bookstore.backend.model.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, Long>{ // Sử dụng interface để tối ưu thay vì phải viết querry
    List<Book> findByCategory(String category);
    List<Book> findByAuthor(String author);
    List<Book> findByTitleContainingIgnoreCase(String keyword);
}
