package com.bookstore.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BlogPostDTO {
    private Long id;
    private String title;
    private String description;
    private String content;
    private String coverImage;
    private String author;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer commentCount;
}
