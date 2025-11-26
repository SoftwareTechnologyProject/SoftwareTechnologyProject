package com.bookstore.backend.model;
import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "CartItems")
@Data
public class CartItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "cartId") // Khóa ngoại trỏ về bảng Cart
    @JsonIgnore
    private Cart cart;

    @ManyToOne
    @JoinColumn(name = "bookVariantsId") // Khóa ngoại trỏ về bảng BookVariants
    private BookVariant bookVariant;

    private Integer quantity;
}