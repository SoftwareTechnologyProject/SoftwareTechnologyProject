package com.bookstore.backend.repository;

import com.bookstore.backend.model.BookVariants;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookVariantsRepository extends JpaRepository<BookVariants, Long> {

}
