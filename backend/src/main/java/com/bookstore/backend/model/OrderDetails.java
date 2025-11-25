package com.bookstore.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "orders_details")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "order_id")
    private Orders order;

    @ManyToOne
    @JoinColumn(name = "book_variant_id")
    private BookVariants bookVariant;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private Double pricePurchased;
}