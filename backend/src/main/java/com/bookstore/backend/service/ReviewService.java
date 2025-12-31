package com.bookstore.backend.service;

import com.bookstore.backend.DTO.ReviewDTO;
import com.bookstore.backend.exception.BadRequestException;
import com.bookstore.backend.exception.ResourceNotFoundException;
import com.bookstore.backend.model.Book;
import com.bookstore.backend.model.Reviews;
import com.bookstore.backend.model.Users;
import com.bookstore.backend.repository.BookRepository;
import com.bookstore.backend.repository.ReviewRepository;
import com.bookstore.backend.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {
    
    private final ReviewRepository reviewRepository;
    private final BookRepository bookRepository;
    private final SecurityUtils securityUtils;
    
    /**
     * Lấy tất cả review đã được approve của một cuốn sách
     */
    public List<ReviewDTO> getApprovedReviewsByBookId(Long bookId) {
        // Kiểm tra sách có tồn tại không
        if (!bookRepository.existsById(bookId)) {
            throw new ResourceNotFoundException("Không tìm thấy sách với ID: " + bookId);
        }
        
        List<Reviews> reviews = reviewRepository.findApprovedReviewsByBookId(bookId);
        return reviews.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Tạo review mới (user phải đăng nhập)
     */
    @Transactional
    public ReviewDTO createReview(Long bookId, ReviewDTO reviewDTO) {
        // Lấy user hiện tại
        Users currentUser = securityUtils.getCurrentUser();
        
        // Kiểm tra sách có tồn tại không
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sách với ID: " + bookId));
        
        // Kiểm tra user đã review sách này chưa
        if (reviewRepository.existsByUserIdAndBookId(currentUser.getId(), bookId)) {
            throw new BadRequestException("Bạn đã đánh giá sách này rồi");
        }
        
        // Validate rating
        if (reviewDTO.getRating() == null || reviewDTO.getRating() < 1 || reviewDTO.getRating() > 5) {
            throw new BadRequestException("Rating phải từ 1 đến 5");
        }
        
        // Validate comment
        if (reviewDTO.getComment() == null || reviewDTO.getComment().trim().isEmpty()) {
            throw new BadRequestException("Comment không được để trống");
        }
        
        // Tạo review mới với status = PENDING (cần admin approve)
        Reviews review = Reviews.builder()
                .user(currentUser)
                .book(book)
                .rating(reviewDTO.getRating())
                .comment(reviewDTO.getComment().trim())
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build();
        
        Reviews savedReview = reviewRepository.save(review);
        return convertToDTO(savedReview);
    }
    
    /**
     * Approve review (chỉ ADMIN)
     */
    @Transactional
    public ReviewDTO approveReview(Long reviewId) {
        Reviews review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy review với ID: " + reviewId));
        
        review.setStatus("APPROVED");
        Reviews updated = reviewRepository.save(review);
        return convertToDTO(updated);
    }
    
    /**
     * Reject review (chỉ ADMIN)
     */
    @Transactional
    public ReviewDTO rejectReview(Long reviewId) {
        Reviews review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy review với ID: " + reviewId));
        
        review.setStatus("REJECTED");
        Reviews updated = reviewRepository.save(review);
        return convertToDTO(updated);
    }
    
    /**
     * Xóa review (chỉ ADMIN hoặc chính user đó)
     */
    @Transactional
    public void deleteReview(Long reviewId) {
        Reviews review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy review với ID: " + reviewId));
        
        Users currentUser = securityUtils.getCurrentUser();
        
        // Chỉ cho phép xóa nếu là ADMIN hoặc chính user tạo review
        if (!currentUser.getRole().name().equals("ADMIN") && 
            !review.getUser().getId().equals(currentUser.getId())) {
            throw new BadRequestException("Bạn không có quyền xóa review này");
        }
        
        reviewRepository.delete(review);
    }
    
    /**
     * Lấy tất cả review (bao gồm pending, dành cho admin)
     */
    public Page<ReviewDTO> getAllReviewsByBookId(Long bookId, Pageable pageable) {
        if (!bookRepository.existsById(bookId)) {
            throw new ResourceNotFoundException("Không tìm thấy sách với ID: " + bookId);
        }
        
        Page<Reviews> reviews = reviewRepository.findAllReviewsByBookId(bookId, pageable);
        return reviews.map(this::convertToDTO);
    }
    
    /**
     * Lấy rating trung bình của sách
     */
    public Double getAverageRating(Long bookId) {
        Double avgRating = reviewRepository.getAverageRatingByBookId(bookId);
        return avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0;
    }
    
    /**
     * Đếm số lượng review
     */
    public Long countReviews(Long bookId) {
        return reviewRepository.countApprovedReviewsByBookId(bookId);
    }
    
    /**
     * Convert entity sang DTO
     */
    private ReviewDTO convertToDTO(Reviews review) {
        return ReviewDTO.builder()
                .id(review.getId())
                .userId(review.getUser().getId())
                .userName(review.getUser().getFullName())
                .bookId(review.getBook().getId())
                .rating(review.getRating())
                .comment(review.getComment())
                .status(review.getStatus())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
