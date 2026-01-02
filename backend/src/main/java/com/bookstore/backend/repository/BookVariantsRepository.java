package com.bookstore.backend.repository;

import com.bookstore.backend.model.BookVariants;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;
import java.util.Optional;

public interface BookVariantsRepository extends JpaRepository<BookVariants, Long> {

    // Kiểm tra xem ISBN đã tồn tại hay chưa (để validate unique)
    boolean existsByIsbn(String isbn);

    // Pessimistic lock để tránh race condition khi trừ stock
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT bv FROM BookVariants bv WHERE bv.id = :id")
    Optional<BookVariants> findByIdWithLock(@Param("id") Long id);
}
