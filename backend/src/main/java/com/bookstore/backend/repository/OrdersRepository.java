package com.bookstore.backend.repository;

import com.bookstore.backend.model.Orders;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface OrdersRepository extends JpaRepository<Orders, Integer> {
    List<Orders> findByUsers_Id(Long userId);
    List<Orders> findAllByOrderDateBetween(LocalDateTime startDate, LocalDateTime endDate);
}