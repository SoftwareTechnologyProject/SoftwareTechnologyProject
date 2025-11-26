package com.bookstore.backend.repository;

import com.bookstore.backend.model.BookVariant;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookVariantRepository extends JpaRepository<BookVariant, Long> {

}
