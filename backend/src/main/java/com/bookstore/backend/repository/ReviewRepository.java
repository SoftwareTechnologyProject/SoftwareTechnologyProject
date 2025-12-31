package com.bookstore.backend.repository;

import com.bookstore.backend.model.Reviews;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Reviews, Long> {
    
    // Lấy tất cả review của một cuốn sách (chỉ status = APPROVED)
    @Query("SELECT r FROM Reviews r WHERE r.book.id = :bookId AND r.status = 'APPROVED' ORDER BY r.createdAt DESC")
    List<Reviews> findApprovedReviewsByBookId(@Param("bookId") Long bookId);
    
    // Lấy tất cả review của một cuốn sách (bao gồm cả pending, dành cho admin)
    @Query("SELECT r FROM Reviews r WHERE r.book.id = :bookId ORDER BY r.createdAt DESC")
    Page<Reviews> findAllReviewsByBookId(@Param("bookId") Long bookId, Pageable pageable);
    
    // Kiểm tra user đã review sách này chưa
    @Query("SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END FROM Reviews r WHERE r.user.id = :userId AND r.book.id = :bookId")
    boolean existsByUserIdAndBookId(@Param("userId") Long userId, @Param("bookId") Long bookId);
    
    // Tính rating trung bình của sách
    @Query("SELECT AVG(r.rating) FROM Reviews r WHERE r.book.id = :bookId AND r.status = 'APPROVED'")
    Double getAverageRatingByBookId(@Param("bookId") Long bookId);
    
    // Đếm số lượng review của sách
    @Query("SELECT COUNT(r) FROM Reviews r WHERE r.book.id = :bookId AND r.status = 'APPROVED'")
    Long countApprovedReviewsByBookId(@Param("bookId") Long bookId);
}
