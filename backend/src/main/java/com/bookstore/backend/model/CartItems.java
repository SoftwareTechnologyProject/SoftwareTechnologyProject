package com.bookstore.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cart_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItems {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "cart_id")
    @JsonIgnore
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private Cart cart;

    @ManyToOne
    @JoinColumn(name = "book_variant_id")
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private BookVariants bookVariant;

    @Column(nullable = false)
    private Integer quantity;
}