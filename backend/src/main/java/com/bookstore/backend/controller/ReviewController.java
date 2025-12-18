package com.bookstore.backend.controller;

import com.bookstore.backend.model.Reviews;
import com.bookstore.backend.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/{bookId}/reviews")
    public ResponseEntity<?> createReview(
            @PathVariable Long bookId,
            @RequestBody ReviewRequest request) {
        try {
            Reviews review = reviewService.createReview(
                    bookId,
                    request.getRating(),
                    request.getComment()
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", review.getId());
            response.put("rating", review.getRating());
            response.put("comment", review.getComment());
            response.put("status", review.getStatus());
            response.put("createdAt", review.getCreatedAt());
            response.put("userName", review.getUser().getFullName());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{bookId}/reviews")
    public ResponseEntity<?> getReviews(@PathVariable Long bookId) {
        try {
            List<Reviews> reviews = reviewService.getApprovedReviewsByBook(bookId);
            
            List<Map<String, Object>> reviewList = reviews.stream()
                    .map(review -> {
                        Map<String, Object> reviewMap = new HashMap<>();
                        reviewMap.put("id", review.getId());
                        reviewMap.put("rating", review.getRating());
                        reviewMap.put("comment", review.getComment());
                        reviewMap.put("status", review.getStatus());
                        reviewMap.put("createdAt", review.getCreatedAt());
                        reviewMap.put("userName", review.getUser().getFullName());
                        reviewMap.put("userEmail", review.getUser().getEmail());
                        return reviewMap;
                    })
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(reviewList);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

class ReviewRequest {
    private Integer rating;
    private String comment;

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
}
