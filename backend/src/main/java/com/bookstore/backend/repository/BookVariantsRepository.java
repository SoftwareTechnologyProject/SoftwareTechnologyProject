package com.bookstore.backend.repository;

import com.bookstore.backend.model.BookVariants;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookVariantsRepository extends JpaRepository<BookVariants, Long> {
    List<BookVariants> findByBookId(Long bookId);
}