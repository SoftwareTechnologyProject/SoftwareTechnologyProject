package com.bookstore.backend.model;

import jakarta.persistence.*;
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

    @Column(nullable = false)
    private String imageUrl;
}