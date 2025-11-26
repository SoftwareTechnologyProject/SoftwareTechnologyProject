package com.bookstore.backend.repository;

import com.bookstore.backend.model.Cart;
import com.bookstore.backend.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {
    Optional<Cart> findByUserId(Long userId);
}