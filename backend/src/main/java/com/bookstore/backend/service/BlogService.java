package com.bookstore.backend.service;

import com.bookstore.backend.DTO.BlogCommentDTO;
import com.bookstore.backend.DTO.BlogPostDTO;
import com.bookstore.backend.model.BlogComment;
import com.bookstore.backend.model.BlogPost;
import com.bookstore.backend.repository.BlogCommentRepository;
import com.bookstore.backend.repository.BlogPostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BlogService {

    @Autowired
    private BlogPostRepository blogPostRepository;

    @Autowired
    private BlogCommentRepository blogCommentRepository;

    // Get all blog posts
    public List<BlogPostDTO> getAllPosts() {
        return blogPostRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::convertPostToDTO)
                .collect(Collectors.toList());
    }

    // Get blog post by ID
    public BlogPostDTO getPostById(Long id) {
        BlogPost post = blogPostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog post not found with id: " + id));
        return convertPostToDTO(post);
    }

    // Create new blog post (admin only)
    @Transactional
    public BlogPostDTO createPost(BlogPostDTO blogPostDTO) {
        BlogPost blogPost = new BlogPost();
        blogPost.setTitle(blogPostDTO.getTitle());
        blogPost.setDescription(blogPostDTO.getDescription());
        blogPost.setContent(blogPostDTO.getContent());
        blogPost.setCoverImage(blogPostDTO.getCoverImage());
        blogPost.setAuthor(blogPostDTO.getAuthor());
        
        BlogPost savedPost = blogPostRepository.save(blogPost);
        return convertPostToDTO(savedPost);
    }

    // Update blog post (admin only)
    @Transactional
    public BlogPostDTO updatePost(Long id, BlogPostDTO blogPostDTO) {
        BlogPost blogPost = blogPostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog post not found with id: " + id));
        
        blogPost.setTitle(blogPostDTO.getTitle());
        blogPost.setDescription(blogPostDTO.getDescription());
        blogPost.setContent(blogPostDTO.getContent());
        blogPost.setCoverImage(blogPostDTO.getCoverImage());
        
        BlogPost updatedPost = blogPostRepository.save(blogPost);
        return convertPostToDTO(updatedPost);
    }

    // Delete blog post (admin only)
    @Transactional
    public void deletePost(Long id) {
        if (!blogPostRepository.existsById(id)) {
            throw new RuntimeException("Blog post not found with id: " + id);
        }
        blogPostRepository.deleteById(id);
    }

    // Get comments for a post
    public List<BlogCommentDTO> getCommentsByPostId(Long postId) {
        return blogCommentRepository.findByBlogPostIdOrderByCreatedAtDesc(postId).stream()
                .map(this::convertCommentToDTO)
                .collect(Collectors.toList());
    }

    // Add comment to post
    @Transactional
    public BlogCommentDTO addComment(Long postId, BlogCommentDTO commentDTO) {
        BlogPost blogPost = blogPostRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Blog post not found with id: " + postId));
        
        BlogComment comment = new BlogComment();
        comment.setCommenterName(commentDTO.getCommenterName());
        comment.setContent(commentDTO.getContent());
        comment.setBlogPost(blogPost);
        
        BlogComment savedComment = blogCommentRepository.save(comment);
        return convertCommentToDTO(savedComment);
    }

    // Delete comment (admin only)
    @Transactional
    public void deleteComment(Long commentId) {
        BlogComment comment = blogCommentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found with id: " + commentId));
        blogCommentRepository.delete(comment);
    }

    // Convert BlogPost to DTO
    private BlogPostDTO convertPostToDTO(BlogPost post) {
        BlogPostDTO dto = new BlogPostDTO();
        dto.setId(post.getId());
        dto.setTitle(post.getTitle());
        dto.setDescription(post.getDescription());
        dto.setContent(post.getContent());
        dto.setCoverImage(post.getCoverImage());
        dto.setAuthor(post.getAuthor());
        dto.setCreatedAt(post.getCreatedAt());
        dto.setUpdatedAt(post.getUpdatedAt());
        dto.setCommentCount(post.getComments() != null ? post.getComments().size() : 0);
        return dto;
    }

    // Convert BlogComment to DTO
    private BlogCommentDTO convertCommentToDTO(BlogComment comment) {
        BlogCommentDTO dto = new BlogCommentDTO();
        dto.setId(comment.getId());
        dto.setCommenterName(comment.getCommenterName());
        dto.setContent(comment.getContent());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setBlogPostId(comment.getBlogPost().getId());
        return dto;
    }
}
