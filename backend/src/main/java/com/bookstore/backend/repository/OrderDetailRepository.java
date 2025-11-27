package com.bookstore.backend.repository;

import com.bookstore.backend.model.OrderDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderDetailRepository extends JpaRepository<OrderDetails, Integer> {

    // Lấy danh sách OrderDetail theo orderId
    List<OrderDetails> findByOrders_Id(int orderId);
}
