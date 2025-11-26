package com.bookstore.backend.repository;

import com.bookstore.backend.model.CartItems;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartItemRepository extends JpaRepository<CartItems, Long> {

}