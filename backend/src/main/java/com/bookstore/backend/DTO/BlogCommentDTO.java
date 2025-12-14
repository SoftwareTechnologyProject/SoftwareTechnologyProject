package com.bookstore.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BlogCommentDTO {
    private Long id;
    private String commenterName;
    private String content;
    private LocalDateTime createdAt;
    private Long blogPostId;
}
