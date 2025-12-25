package com.bookstore.backend.repository;

import com.bookstore.backend.model.OrderDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderDetailRepository extends JpaRepository<OrderDetails, Integer> {

    // Lấy danh sách OrderDetail theo orderId
    List<OrderDetails> findByOrdersId(Long orderId);

    // Kiểm tra xem một BookVariant có tồn tại trong OrderDetails của các đơn hàng
    // chưa hoàn thành (status != 'SUCCESS')
    @Query("SELECT CASE WHEN COUNT(od) > 0 THEN true ELSE false END " +
            "FROM OrderDetails od " +
            "WHERE od.bookVariant.id = :variantId " +
            "AND od.orders.status != 'SUCCESS'")
    boolean existsByBookVariantAndOrderNotCompleted(@Param("variantId") Long variantId);
}
