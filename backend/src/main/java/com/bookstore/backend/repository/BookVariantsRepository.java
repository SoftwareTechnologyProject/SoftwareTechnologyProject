package com.bookstore.backend.repository;

import com.bookstore.backend.model.BookVariants;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookVariantsRepository extends JpaRepository<BookVariants, Long> {

    // Kiểm tra xem ISBN đã tồn tại hay chưa (để validate unique)
    boolean existsByIsbn(String isbn);
}
