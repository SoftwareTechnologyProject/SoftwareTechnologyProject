package com.bookstore.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "Cart")
@Data
public class Cart {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 'userid' là tên cột khóa ngoại trong bảng Cart của bạn
    @OneToOne
    @JoinColumn(name = "userid")
    private User user; // Giả sử bạn đã có class Users entity

    // mappedBy = "cart": trỏ tới biến 'cart' bên class CartItem
    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CartItem> items = new ArrayList<>();
}