package com.bookstore.backend.repository;

import com.bookstore.backend.model.BlogComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BlogCommentRepository extends JpaRepository<BlogComment, Long> {
    List<BlogComment> findByBlogPostIdOrderByCreatedAtDesc(Long blogPostId);
}
