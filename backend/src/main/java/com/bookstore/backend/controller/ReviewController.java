package com.bookstore.backend.controller;

import com.bookstore.backend.DTO.ReviewDTO;
import com.bookstore.backend.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class ReviewController {
    
    private final ReviewService reviewService;
    
    /**
     * GET /api/books/{bookId}/reviews - Lấy tất cả review đã approve của sách
     * Public endpoint - không cần đăng nhập
     */
    @GetMapping("/{bookId}/reviews")
    public ResponseEntity<List<ReviewDTO>> getReviewsByBookId(@PathVariable Long bookId) {
        List<ReviewDTO> reviews = reviewService.getApprovedReviewsByBookId(bookId);
        return ResponseEntity.ok(reviews);
    }
    
    /**
     * POST /api/books/{bookId}/reviews - Tạo review mới
     * Yêu cầu đăng nhập
     */
    @PostMapping("/{bookId}/reviews")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ReviewDTO> createReview(
            @PathVariable Long bookId,
            @Valid @RequestBody ReviewDTO reviewDTO) {
        ReviewDTO created = reviewService.createReview(bookId, reviewDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    /**
     * GET /api/books/{bookId}/reviews/all - Lấy tất cả review (bao gồm pending)
     * Chỉ ADMIN
     */
    @GetMapping("/{bookId}/reviews/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<ReviewDTO>> getAllReviews(
            @PathVariable Long bookId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ReviewDTO> reviews = reviewService.getAllReviewsByBookId(bookId, pageable);
        return ResponseEntity.ok(reviews);
    }
    
    /**
     * PUT /api/reviews/{reviewId}/approve - Approve review
     * Chỉ ADMIN
     */
    @PutMapping("/reviews/{reviewId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReviewDTO> approveReview(@PathVariable Long reviewId) {
        ReviewDTO approved = reviewService.approveReview(reviewId);
        return ResponseEntity.ok(approved);
    }
    
    /**
     * PUT /api/reviews/{reviewId}/reject - Reject review
     * Chỉ ADMIN
     */
    @PutMapping("/reviews/{reviewId}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReviewDTO> rejectReview(@PathVariable Long reviewId) {
        ReviewDTO rejected = reviewService.rejectReview(reviewId);
        return ResponseEntity.ok(rejected);
    }
    
    /**
     * DELETE /api/reviews/{reviewId} - Xóa review
     * ADMIN hoặc chính user tạo review
     */
    @DeleteMapping("/reviews/{reviewId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteReview(@PathVariable Long reviewId) {
        reviewService.deleteReview(reviewId);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * GET /api/books/{bookId}/reviews/stats - Lấy thống kê review
     * Public endpoint
     */
    @GetMapping("/{bookId}/reviews/stats")
    public ResponseEntity<ReviewStatsResponse> getReviewStats(@PathVariable Long bookId) {
        Double avgRating = reviewService.getAverageRating(bookId);
        Long count = reviewService.countReviews(bookId);
        
        ReviewStatsResponse stats = new ReviewStatsResponse(avgRating, count);
        return ResponseEntity.ok(stats);
    }
    
    // Inner class cho response stats
    record ReviewStatsResponse(Double averageRating, Long totalReviews) {}
}
