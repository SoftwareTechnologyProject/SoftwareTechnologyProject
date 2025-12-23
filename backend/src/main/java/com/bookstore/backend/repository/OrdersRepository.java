package com.bookstore.backend.repository;

import com.bookstore.backend.model.Orders;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface OrdersRepository extends JpaRepository<Orders, Long> {
    List<Orders> findByUsersId(Long userId);
    Optional<Orders> findById(Long id);
}