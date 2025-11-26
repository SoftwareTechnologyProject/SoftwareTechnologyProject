package com.bookstore.backend.model;

import com.bookstore.backend.model.enums.BookStatus;
import jakarta.persistence.*;
import lombok.*;
import java.util.Set;

@Entity
@Table(name = "book_variants")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookVariants {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "book_id")
    private Book book;

    @Column(nullable = false)
    private Double price;

    @Builder.Default
    private Integer quantity = 0;

    @Builder.Default
    private Integer sold = 0;

    @Column(nullable = false)
    private String status;

    private String format;
    private String size;
    private String edition;
    private Double weight;
    private String isbn;

    @OneToMany(mappedBy = "bookVariant", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<BookImages> images;
}