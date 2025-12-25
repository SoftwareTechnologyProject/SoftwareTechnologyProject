package com.bookstore.backend.service;

import com.bookstore.backend.model.*;
import com.bookstore.backend.model.enums.PaymentType;
import com.bookstore.backend.model.enums.PaymentStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.bookstore.backend.DTO.NotificationRequestDTO;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
public class PaymentService {

    private final OrdersService ordersService;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final Map<String, Long> pendingPayments = new HashMap<>();

    @Autowired
    public PaymentService(OrdersService ordersService, NotificationService notificationService, EmailService emailService) {
        this.ordersService = ordersService;
        this.notificationService = notificationService;
        this.emailService = emailService;
    }

    @Transactional
    public String initiatePaymentTransaction(Long orderId) throws Exception {
        if (orderId == null) {
            throw new Exception("Order ID is required");
        }

        Orders order = ordersService.getOrderEntityById(orderId);
        
        if (PaymentStatus.PAID.equals(order.getPaymentStatus())) {
            throw new Exception("Order has already been paid");
        }
        
        String paymentKey = "payment_" + orderId + "_" + System.currentTimeMillis();
        
        pendingPayments.put(paymentKey, orderId);
        
        return paymentKey;
    }

    @Transactional
    public void markPaymentSuccess(String paymentKey, String transactionNo, String transactionDate) throws Exception {
        Long orderId = pendingPayments.get(paymentKey);
        if (orderId == null) {
            throw new Exception("Payment information not found or expired");
        }

        Orders order = ordersService.getOrderEntityById(orderId);
        Long userIdFromOrder = order.getUsers().getId();

        ordersService.updatePaymentStatus(orderId, PaymentStatus.PAID, PaymentType.BANKING);
        
        pendingPayments.remove(paymentKey);
        
        System.out.println("✅ Order #" + orderId + " marked as PAID. Transaction: " + transactionNo);
        NotificationRequestDTO notificationRequest = NotificationRequestDTO.builder()
                .content("Thanh toán thành công cho đơn hàng #" + orderId + " của bạn")
                .url("http://localhost:5173/payment/result?paymentKey=" + paymentKey + "&transactionDate=" + transactionDate)
                .type(com.bookstore.backend.model.enums.NotificationType.PERSONAL)
                .userId(userIdFromOrder)
                .build();
        notificationService.sendNotification(notificationRequest);

        // Gửi email xác nhận đơn hàng
        try {
            Users user = order.getUsers();
            com.bookstore.backend.DTO.OrdersDTO orderDTO = ordersService.getOrderById(orderId);
            
            emailService.sendOrderConfirmationEmail(
                user.getEmail(),
                user.getFullName(),
                orderDTO
            );
            System.out.println("📧 Order confirmation email sent to: " + user.getEmail());
        } catch (Exception e) {
            System.err.println("⚠️ Failed to send order confirmation email: " + e.getMessage());
        }
    }

    @Transactional
    public void markPaymentFailed(String paymentKey) throws Exception {
        Long orderId = pendingPayments.get(paymentKey);
        if (orderId == null) {
            throw new Exception("Payment information not found or expired");
        }

        ordersService.updatePaymentStatus(orderId, PaymentStatus.FAILED, null);
        
        pendingPayments.remove(paymentKey);
        
        System.out.println("❌ Order #" + orderId + " marked as FAILED");
    }

    public String getPaymentStatus(String paymentKey) {
        try {
            Long orderId = pendingPayments.get(paymentKey);
            if (orderId == null) {
                // Payment key không tồn tại trong pending -> đã được xử lý rồi
                // Thử tìm order bằng cách parse orderId từ paymentKey
                String[] parts = paymentKey.split("_");
                if (parts.length >= 2) {
                    orderId = Long.parseLong(parts[1]);
                    Orders order = ordersService.getOrderEntityById(orderId);
                    return order.getPaymentStatus() != null ? order.getPaymentStatus().name() : null;
                }
                return null;
            }
            
            // Nếu vẫn còn trong pending, chưa xử lý
            return null;
        } catch (Exception e) {
            return null;
        }
    }

    public BigDecimal calculateFinalAmount(String paymentKey) throws Exception {
        Long orderId = pendingPayments.get(paymentKey);
        if (orderId == null) {
            throw new Exception("Payment information not found");
        }
        
        return ordersService.calculateOrderTotalAmount(orderId);
    }

    public Long getOrderIdByPaymentKey(String paymentKey) {
        Long orderId = pendingPayments.get(paymentKey);
        if (orderId != null) {
            return orderId;
        }

        try {
            String[] parts = paymentKey.split("_");
            if (parts.length >= 2) {
                return Long.parseLong(parts[1]);
            }
        } catch (NumberFormatException e) {
        }
        
        return null;
    }
}
