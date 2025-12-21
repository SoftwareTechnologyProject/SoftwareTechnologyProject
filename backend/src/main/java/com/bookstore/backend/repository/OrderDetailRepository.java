package com.bookstore.backend.repository;

import com.bookstore.backend.model.OrderDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderDetailRepository extends JpaRepository<OrderDetails, Integer> {

    // Lấy danh sách OrderDetail theo orderId
    List<OrderDetails> findByOrders_Id(Long orderId);

}
