package com.bookstore.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "BookVariants")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "bookId", nullable = false)
    private Book book;

    @Column(nullable = false)
    private Double price;

    private Integer quantity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookStatus status;
}