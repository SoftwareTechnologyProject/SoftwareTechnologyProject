package com.bookstore.backend.service;

import com.bookstore.backend.model.*;
import com.bookstore.backend.model.enums.PaymentType;
import com.bookstore.backend.model.enums.PaymentStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
public class PaymentService {

    private final OrdersService ordersService;
    
    // Lưu trữ tạm thông tin thanh toán (paymentKey -> OrderId)
    private final Map<String, Long> pendingPayments = new HashMap<>();

    @Autowired
    public PaymentService(OrdersService ordersService) {
        this.ordersService = ordersService;
    }

    /**
     * Khởi tạo giao dịch thanh toán từ orderId
     * @param orderId ID của đơn hàng đã được tạo
     * @return String - Payment key để tracking
     */
    @Transactional
    public String initiatePaymentTransaction(Long orderId) throws Exception {
        // Validate input
        if (orderId == null) {
            throw new Exception("Order ID is required");
        }

        // Kiểm tra order tồn tại
        Orders order = ordersService.getOrderEntityById(orderId);
        
        // Kiểm tra order chưa được thanh toán
        if (PaymentStatus.PAID.equals(order.getPaymentStatus())) {
            throw new Exception("Order has already been paid");
        }
        
        // Tạo payment key unique
        String paymentKey = "payment_" + orderId + "_" + System.currentTimeMillis();
        
        // Lưu mapping paymentKey -> orderId
        pendingPayments.put(paymentKey, orderId);
        
        return paymentKey;
    }

    /**
     * Đánh dấu thanh toán thành công
     * @param paymentKey Payment key từ initiatePaymentTransaction
     * @param transactionNo Mã giao dịch VNPay
     */
    @Transactional
    public void markPaymentSuccess(String paymentKey, String transactionNo) throws Exception {
        // Lấy orderId từ paymentKey
        Long orderId = pendingPayments.get(paymentKey);
        if (orderId == null) {
            throw new Exception("Payment information not found or expired");
        }

        // Cập nhật payment status thông qua OrdersService
        ordersService.updatePaymentStatus(orderId, PaymentStatus.PAID, PaymentType.BANKING);
        
        // Xóa pending payment
        pendingPayments.remove(paymentKey);
        
        System.out.println("✅ Order #" + orderId + " marked as PAID. Transaction: " + transactionNo);
    }

    /**
     * Đánh dấu thanh toán thất bại
     * @param paymentKey Payment key từ initiatePaymentTransaction
     */
    @Transactional
    public void markPaymentFailed(String paymentKey) throws Exception {
        // Lấy orderId từ paymentKey
        Long orderId = pendingPayments.get(paymentKey);
        if (orderId == null) {
            throw new Exception("Payment information not found or expired");
        }

        // Cập nhật payment status thông qua OrdersService
        ordersService.updatePaymentStatus(orderId, PaymentStatus.FAILED, null);
        
        // Xóa pending payment
        pendingPayments.remove(paymentKey);
        
        System.out.println("❌ Order #" + orderId + " marked as FAILED");
    }

    /**
     * Kiểm tra payment status của order
     * @param paymentKey Payment key để lấy orderId
     * @return Payment status (PAID/FAILED) hoặc null nếu chưa xử lý
     */
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

    /**
     * Tính tổng tiền của order
     * @param paymentKey Payment key để lấy orderId
     * @return Tổng tiền order
     */
    public BigDecimal calculateFinalAmount(String paymentKey) throws Exception {
        // Lấy orderId từ paymentKey
        Long orderId = pendingPayments.get(paymentKey);
        if (orderId == null) {
            throw new Exception("Payment information not found");
        }
        
        // Tính tổng tiền thông qua OrdersService
        return ordersService.calculateOrderTotalAmount(orderId);
    }

    /**
     * Lấy orderId từ paymentKey
     * @param paymentKey Payment key
     * @return orderId hoặc null nếu không tìm thấy
     */
    public Long getOrderIdByPaymentKey(String paymentKey) {
        Long orderId = pendingPayments.get(paymentKey);
        if (orderId != null) {
            return orderId;
        }
        
        // Nếu không tìm thấy trong pending, thử parse từ paymentKey
        // Format: payment_{orderId}_{timestamp}
        try {
            String[] parts = paymentKey.split("_");
            if (parts.length >= 2) {
                return Long.parseLong(parts[1]);
            }
        } catch (NumberFormatException e) {
            // Ignore
        }
        
        return null;
    }
}
