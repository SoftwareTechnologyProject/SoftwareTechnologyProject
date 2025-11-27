package com.bookstore.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name = "book_images")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookImages {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "book_variant_id")
    private BookVariants bookVariant;

    @NotBlank(message = "URL hình ảnh không được trống")
    @Column(nullable = false)
    private String imageUrl;
}