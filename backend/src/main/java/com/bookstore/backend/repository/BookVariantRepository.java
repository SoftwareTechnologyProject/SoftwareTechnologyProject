package com.bookstore.backend.repository;

import com.bookstore.backend.model.BookVariants;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookVariantRepository extends JpaRepository<BookVariants, Long> {

}
