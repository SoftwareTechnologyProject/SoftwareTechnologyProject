package com.bookstore.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookstore.backend.model.Book;
import com.bookstore.backend.model.Reviews;
import com.bookstore.backend.model.Users;
import com.bookstore.backend.repository.BookRepository;
import com.bookstore.backend.repository.ReviewRepository;
import com.bookstore.backend.repository.UserRepository;
import com.bookstore.backend.utils.SecurityUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepo;
    private final BookRepository bookRepo;
    private final UserRepository userRepo;
    private final SecurityUtils securityUtils;

    private Users getCurrentUser() {
        var user = securityUtils.getCurrentUser();
        if (user == null) {
            throw new RuntimeException("Bạn chưa đăng nhập hoặc phiên đăng nhập hết hạn");
        }
        return user;
    }

    @Transactional
    public Reviews createReview(Long bookId, Integer rating, String comment) {
        Users currentUser = getCurrentUser();
        
        Book book = bookRepo.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Sách không tồn tại"));

        // Create review with instant approval (no moderation)
        Reviews review = Reviews.builder()
                .user(currentUser)
                .book(book)
                .rating(rating)
                .comment(comment)
                .status("APPROVED")  // Instant approval for better UX
                .build();

        return reviewRepo.save(review);
    }

    @Transactional
    public Reviews createReviewWithImages(Long bookId, Integer rating, String comment, String images) {
        Users currentUser = getCurrentUser();
        
        Book book = bookRepo.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Sách không tồn tại"));

        Reviews review = Reviews.builder()
                .user(currentUser)
                .book(book)
                .rating(rating)
                .comment(comment)
                .images(images)
                .status("APPROVED")
                .build();

        return reviewRepo.save(review);
    }

    public List<Reviews> getApprovedReviewsByBook(Long bookId) {
        return reviewRepo.findByBookIdAndStatus(bookId, "APPROVED");
    }

    public List<Reviews> getAllReviewsByBook(Long bookId) {
        return reviewRepo.findByBookId(bookId);
    }

    public List<Reviews> getUserReviews(Long userId) {
        return reviewRepo.findByUserId(userId);
    }
    
    public List<Reviews> getReviewsBy() {
        Users currentUser = getCurrentUser();
        return reviewRepo.findByUserId(currentUser.getId());
    }
}