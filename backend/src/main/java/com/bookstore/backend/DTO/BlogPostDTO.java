package com.bookstore.backend.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BlogPostDTO {
    private Long id;
    
    @NotBlank(message = "Tiêu đề không được để trống")
    @Size(max = 200, message = "Tiêu đề không quá 200 ký tự")
    private String title;
    
    @NotBlank(message = "Mô tả không được để trống")
    @Size(max = 500, message = "Mô tả không quá 500 ký tự")
    private String description;
    
    @NotBlank(message = "Nội dung không được để trống")
    @Size(min = 50, message = "Nội dung phải ít nhất 50 ký tự")
    private String content;
    
    @NotBlank(message = "Ảnh bìa không được để trống")
    private String coverImage;
    
    @NotBlank(message = "Tác giả không được để trống")
    @Size(max = 100, message = "Tên tác giả không quá 100 ký tự")
    private String author;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer commentCount;
}
