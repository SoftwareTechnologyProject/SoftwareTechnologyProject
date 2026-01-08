package com.bookstore.backend.controller;

import com.bookstore.backend.DTO.BlogCommentDTO;
import com.bookstore.backend.DTO.BlogPostDTO;
import com.bookstore.backend.service.BlogService;
import com.bookstore.backend.service.GeminiService;
import com.bookstore.backend.service.S3Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/blog")
@CrossOrigin(origins = "*")
public class BlogController {

    @Autowired
    private BlogService blogService;

    @Autowired
    private S3Service s3Service;

    @Autowired
    private GeminiService geminiService;

    // Upload image to S3
    @PostMapping("/upload-image")
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            System.out.println("📤 Uploading image: " + file.getOriginalFilename());
            System.out.println("   File size: " + file.getSize() + " bytes");
            String imageUrl = s3Service.uploadFile(file);
            System.out.println("✅ Upload successful: " + imageUrl);
            Map<String, String> response = new HashMap<>();
            response.put("url", imageUrl);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Upload failed: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // Get all blog posts
    @GetMapping("/posts")
    public ResponseEntity<List<BlogPostDTO>> getAllPosts() {
        List<BlogPostDTO> posts = blogService.getAllPosts();
        return ResponseEntity.ok(posts);
    }

    // Get blog post by ID
    @GetMapping("/posts/{id}")
    public ResponseEntity<BlogPostDTO> getPostById(@PathVariable Long id) {
        BlogPostDTO post = blogService.getPostById(id);
        return ResponseEntity.ok(post);
    }

    // Create new blog post (admin only)
    @PostMapping("/posts")
    public ResponseEntity<BlogPostDTO> createPost(@RequestBody BlogPostDTO blogPostDTO) {
        BlogPostDTO createdPost = blogService.createPost(blogPostDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdPost);
    }

    // Update blog post (admin only)
    @PutMapping("/posts/{id}")
    public ResponseEntity<BlogPostDTO> updatePost(@PathVariable Long id, @RequestBody BlogPostDTO blogPostDTO) {
        BlogPostDTO updatedPost = blogService.updatePost(id, blogPostDTO);
        return ResponseEntity.ok(updatedPost);
    }

    // Delete blog post (admin only)
    @DeleteMapping("/posts/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        blogService.deletePost(id);
        return ResponseEntity.noContent().build();
    }

    // Get comments for a post
    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<List<BlogCommentDTO>> getComments(@PathVariable Long postId) {
        List<BlogCommentDTO> comments = blogService.getCommentsByPostId(postId);
        return ResponseEntity.ok(comments);
    }

    // Add comment to post
    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<?> addComment(@PathVariable Long postId, @RequestBody BlogCommentDTO commentDTO) {
        try {
            // Validate comment content with Gemini AI
            boolean isAppropriate = geminiService.isCommentAppropriate(commentDTO.getContent());
            
            if (!isAppropriate) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Bình luận của bạn chứa nội dung không phù hợp. Vui lòng sử dụng ngôn từ lịch sự.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }
            
            // If appropriate, save comment
            BlogCommentDTO createdComment = blogService.addComment(postId, commentDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdComment);
            
        } catch (Exception e) {
            System.err.println("❌ Error adding comment: " + e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Có lỗi xảy ra khi đăng bình luận");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // Delete comment (admin only)
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId) {
        blogService.deleteComment(commentId);
        return ResponseEntity.noContent().build();
    }
}
