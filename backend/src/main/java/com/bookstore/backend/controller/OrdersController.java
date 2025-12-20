package com.bookstore.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;
import com.bookstore.backend.DTO.OrdersDTO;
import com.bookstore.backend.service.OrdersService;

@RestController
@RequestMapping("/api/orders")
public class OrdersController {

    private final OrdersService ordersService;

    public OrdersController(OrdersService ordersService) {
        this.ordersService = ordersService;
    }

    // Customer: tạo đơn hàng -> trả về OrdersDTO
    @PostMapping
    public ResponseEntity<OrdersDTO> createOrder(@RequestBody OrdersDTO dto) {
        OrdersDTO createdOrder = ordersService.createOrder(
                dto.getOrderDetails(),
                dto.getVoucherCode(),
                dto.getPaymentType(),
                dto.getShippingAddress(),
                dto.getPhoneNumber()
        );
        return ResponseEntity.ok(createdOrder);
    }

    // Customer: xem đơn hàng của mình -> trả về List<OrdersDTO>
    @GetMapping("/user")
    public ResponseEntity<List<OrdersDTO>> getOrdersByUser() {
        List<OrdersDTO> orders = ordersService.getOrdersByUser();
        return ResponseEntity.ok(orders);
    }

    // Admin: cập nhật trạng thái đơn hàng -> trả về DTO
    @PutMapping("/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long orderId, @RequestBody OrdersDTO dto) {
        try {
            OrdersDTO updatedOrder = ordersService.updateOrderStatus(orderId, dto.getStatus());
            if (updatedOrder == null) {
                return ResponseEntity.status(404)
                        .body(Map.of("success", false, "error", "Đơn hàng không tồn tại"));
            }
            return ResponseEntity.ok(Map.of("success", true, "data", updatedOrder));
        } catch (RuntimeException ex) {
            // Trả về HTTP 400, frontend có thể hiển thị thông báo
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "error", ex.getMessage()));
        }
    }

    // Admin: lấy tất cả đơn hàng -> trả về DTO
    @GetMapping
    public ResponseEntity<List<OrdersDTO>> getAllOrders() {
        List<OrdersDTO> orders = ordersService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    // Xem chi tiết đơn hàng -> trả về DTO
    @GetMapping("/{orderId}")
    public ResponseEntity<OrdersDTO> getOrderById(@PathVariable Long orderId) {
        OrdersDTO order = ordersService.getOrderById(orderId);
        return ResponseEntity.ok(order);
    }
}
