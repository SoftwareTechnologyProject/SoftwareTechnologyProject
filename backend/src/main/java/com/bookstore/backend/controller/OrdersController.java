package com.bookstore.backend.controller;

import com.bookstore.backend.DTO.CreateOrderRequestDTO;
import com.bookstore.backend.DTO.OrdersDTO;
import com.bookstore.backend.DTO.UpdateOrderStatusDTO;
import com.bookstore.backend.model.Orders;
import com.bookstore.backend.model.enums.StatusOrder;
import com.bookstore.backend.service.OrdersService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
public class OrdersController {

    private final OrdersService ordersService;

    public OrdersController(OrdersService ordersService) {
        this.ordersService = ordersService;
    }

    // Customer: tạo đơn hàng
    @PostMapping
    public Orders createOrder(@RequestParam int userId, @RequestBody CreateOrderRequestDTO dto) {
        return ordersService.createOrder(
                userId,
                dto.getOrderDetails(),
                dto.getVoucherCode(),
                dto.getPaymentType(),
                dto.getShippingAddress(),
                dto.getPhoneNumber()
        );
    }

//     Customer: xem đơn hàng của mình
    @GetMapping("/user/{userId}")
    public List<Orders> getOrdersByUser(@PathVariable int userId) {
        return ordersService.getOrdersByUser(userId);
    }


    // Admin: cập nhật trạng thái đơn hàng
    @PutMapping("/{orderId}/status")
    public Orders updateOrderStatus(@PathVariable int orderId, @RequestBody UpdateOrderStatusDTO dto) {
        return ordersService.updateOrderStatus(orderId, dto.getStatus());
    }

    // Admin: lấy tất cả đơn hàng
    @GetMapping
    public List<Orders> getAllOrders() {
        return ordersService.getAllOrders();
    }

    // Xem đơn hàng bằng id
    @GetMapping("/{orderId}")
    public Orders getOrderById(@PathVariable int orderId) {
        return ordersService.getOrderById(orderId);
    }

}

