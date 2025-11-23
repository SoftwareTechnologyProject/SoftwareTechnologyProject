package com.bookstore.backend.repository;

import com.bookstore.backend.model.OrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderDetailRepository extends JpaRepository<OrderDetail, Integer> {

    // Lấy danh sách OrderDetail theo orderId
    List<OrderDetail> findByOrders_Id(int orderId);
}
