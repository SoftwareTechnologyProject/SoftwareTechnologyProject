package com.bookstore.backend.repository;

import com.bookstore.backend.model.Reviews;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Reviews, Long> {
    List<Reviews> findByBookIdAndStatus(Long bookId, String status);
    List<Reviews> findByBookId(Long bookId);
    List<Reviews> findByUserId(Long userId);
}
