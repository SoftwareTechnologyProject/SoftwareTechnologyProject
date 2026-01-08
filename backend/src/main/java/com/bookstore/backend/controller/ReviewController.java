package com.bookstore.backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.bookstore.backend.model.Reviews;
import com.bookstore.backend.model.Users;
import com.bookstore.backend.repository.ReviewRepository;
import com.bookstore.backend.service.ReviewService;
import com.bookstore.backend.service.S3Service;
import com.bookstore.backend.utils.SecurityUtils;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final ReviewRepository reviewRepo;
    private final SecurityUtils securityUtils;
    private final S3Service s3Service;

    // ================= REVIEW THEO SÁCH =================

    // Upload image for review
    @PostMapping("/reviews/upload-image")
    public ResponseEntity<?> uploadReviewImage(@RequestParam("file") MultipartFile file) {
        try {
            String imageUrl = s3Service.uploadFile(file);
            return ResponseEntity.ok(Map.of("url", imageUrl));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/books/{bookId}/reviews")
    public ResponseEntity<?> createReview(
            @PathVariable Long bookId,
            @RequestBody ReviewRequest request
    ) {
        Reviews review;
        if (request.getImages() != null && !request.getImages().isEmpty()) {
            review = reviewService.createReviewWithImages(
                    bookId,
                    request.getRating(),
                    request.getComment(),
                    request.getImages()
            );
        } else {
            review = reviewService.createReview(
                    bookId,
                    request.getRating(),
                    request.getComment()
            );
        }

        Map<String, Object> response = new HashMap<>();
        response.put("id", review.getId());
        response.put("rating", review.getRating());
        response.put("comment", review.getComment());
        response.put("status", review.getStatus());
        response.put("createdAt", review.getCreatedAt());
        response.put("userName", review.getUser().getFullName());
        response.put("images", review.getImages());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/books/{bookId}/reviews")
    public ResponseEntity<?> getReviews(@PathVariable Long bookId) {
        List<Reviews> reviews = reviewService.getApprovedReviewsByBook(bookId);

        List<Map<String, Object>> result = reviews.stream().map(r -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", r.getId());
            map.put("rating", r.getRating());
            map.put("comment", r.getComment());
            map.put("createdAt", r.getCreatedAt());
            map.put("userName", r.getUser().getFullName());
            map.put("userEmail", r.getUser().getEmail());
            map.put("images", r.getImages());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    // ================= REVIEW CỦA TÔI =================

    @GetMapping("/reviews/me")
    public ResponseEntity<?> getMyReviews(
    ) {
        List<Reviews> reviews = reviewService.getReviewsBy();

        List<Map<String, Object>> result = reviews.stream().map(r -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", r.getId());
            map.put("rating", r.getRating());
            map.put("comment", r.getComment());
            map.put("status", r.getStatus());
            map.put("createdAt", r.getCreatedAt());
            map.put("bookId", r.getBook().getId());
            map.put("bookTitle", r.getBook().getTitle());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/reviews/{reviewId}")
    public ResponseEntity<?> deleteReview(@PathVariable Long reviewId) {
        Users currentUser = securityUtils.getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.status(401).body("Bạn chưa đăng nhập");
        }

        Reviews review = reviewRepo.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review không tồn tại"));

        if (!review.getUser().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(403).body("Bạn không được quyền xóa review này");
        }

        reviewRepo.delete(review);
        return ResponseEntity.ok(Map.of("message", "Xóa thành công"));
    }

    // ================= ADMIN QUẢN LÝ REVIEW =================

    @GetMapping("/admin/reviews")
    public ResponseEntity<?> getAllReviewsForAdmin() {
        List<Reviews> reviews = reviewRepo.findAll();
        
        List<Map<String, Object>> result = reviews.stream().map(r -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", r.getId());
            map.put("rating", r.getRating());
            map.put("comment", r.getComment());
            map.put("status", r.getStatus());
            map.put("createdAt", r.getCreatedAt());
            map.put("bookId", r.getBook().getId());
            map.put("bookTitle", r.getBook().getTitle());
            map.put("userId", r.getUser().getId());
            map.put("userName", r.getUser().getFullName());
            map.put("userEmail", r.getUser().getEmail());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @PutMapping("/admin/reviews/{reviewId}/status")
    public ResponseEntity<?> updateReviewStatus(
            @PathVariable Long reviewId,
            @RequestBody Map<String, String> body
    ) {
        String status = body.get("status");
        if (status == null || (!status.equals("APPROVED") && !status.equals("REJECTED"))) {
            return ResponseEntity.badRequest().body("Status phải là APPROVED hoặc REJECTED");
        }

        Reviews review = reviewRepo.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review không tồn tại"));
        
        review.setStatus(status);
        reviewRepo.save(review);

        return ResponseEntity.ok(Map.of(
                "message", "Cập nhật trạng thái thành công",
                "id", review.getId(),
                "status", review.getStatus()
        ));
    }

    @DeleteMapping("/admin/reviews/{reviewId}")
    public ResponseEntity<?> deleteReviewByAdmin(@PathVariable Long reviewId) {
        Reviews review = reviewRepo.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review không tồn tại"));
        
        reviewRepo.delete(review);
        return ResponseEntity.ok(Map.of("message", "Xóa review thành công"));
    }
}

class ReviewRequest {
    private Integer rating;
    private String comment;
    private String images;

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public String getImages() {
        return images;
    }

    public void setImages(String images) {
        this.images = images;
    }
}