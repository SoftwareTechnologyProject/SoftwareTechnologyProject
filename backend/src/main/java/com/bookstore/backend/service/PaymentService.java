package com.bookstore.backend.service;

import com.bookstore.backend.model.*;
import com.bookstore.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class PaymentService {

    private final VoucherRepository voucherRepository;
    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    
    // Lưu trữ tạm thông tin thanh toán (paymentKey -> PaymentInfo)
    private final Map<String, PaymentInfo> pendingPayments = new HashMap<>();
    
    // Inner class để lưu thông tin thanh toán tạm thời
    private static class PaymentInfo {
        List<Long> cartItemIds;
        String voucherCode;
        Long userId;
        
        PaymentInfo(List<Long> cartItemIds, String voucherCode, Long userId) {
            this.cartItemIds = cartItemIds;
            this.voucherCode = voucherCode;
            this.userId = userId;
        }
    }

    @Autowired
    public PaymentService(VoucherRepository voucherRepository, 
                         OrderRepository orderRepository, CartItemRepository cartItemRepository) {
        this.voucherRepository = voucherRepository;
        this.orderRepository = orderRepository;
        this.cartItemRepository = cartItemRepository;
    }

    /**
     * Khởi tạo giao dịch thanh toán từ các cart items được chọn
     * @param cartItemIds Danh sách ID của các cart items cần thanh toán
     * @param voucherCode Mã voucher (có thể null)
     * @param userId ID người dùng
     * @return String - Payment key để tracking
     */
    @Transactional
    public String initiatePaymentTransaction(List<Long> cartItemIds, String voucherCode, Long userId) throws Exception {
        // Validate input
        if (cartItemIds == null || cartItemIds.isEmpty()) {
            throw new Exception("No items selected for payment");
        }

        // Lấy và kiểm tra các cart items
        List<CartItems> selectedItems = cartItemRepository.findAllById(cartItemIds);
        if (selectedItems.size() != cartItemIds.size()) {
            throw new Exception("Some cart items not found");
        }
        
        // Kiểm tra tất cả items thuộc về cùng 1 user
        Long cartUserId = selectedItems.get(0).getCart().getUser().getId();
        boolean allBelongToUser = selectedItems.stream()
                .allMatch(item -> item.getCart().getUser().getId().equals(cartUserId));
        
        if (!allBelongToUser || !cartUserId.equals(userId)) {
            throw new Exception("Invalid cart items or user mismatch");
        }

        // Kiểm tra voucher nếu có
        if (voucherCode != null && !voucherCode.trim().isEmpty()) {
            Voucher voucher = voucherRepository.findByCode(voucherCode)
                    .orElseThrow(() -> new Exception("Voucher not found: " + voucherCode));
            
            if (!voucher.isValid()) {
                throw new Exception("Voucher is not valid or has expired");
            }
        }
        
        // Tạo payment key unique
        String paymentKey = "payment_" + userId + "_" + System.currentTimeMillis();
        
        // Lưu thông tin thanh toán tạm thời
        pendingPayments.put(paymentKey, new PaymentInfo(cartItemIds, voucherCode, userId));
        
        return paymentKey;
    }

    /**
     * Tạo đơn hàng từ các cart items đã chọn sau khi thanh toán thành công
     * @param paymentKey Payment key từ initiatePaymentTransaction
     * @param transactionNo Mã giao dịch VNPay
     * @param shippingAddress Địa chỉ giao hàng
     * @param phoneNumber Số điện thoại
     * @return Orders đã tạo
     */
    @Transactional
    public Orders createOrderFromCart(String paymentKey, String transactionNo, String shippingAddress, String phoneNumber) throws Exception {
        // Lấy thông tin thanh toán
        PaymentInfo paymentInfo = pendingPayments.get(paymentKey);
        if (paymentInfo == null) {
            throw new Exception("Payment information not found or expired");
        }

        // Lấy các cart items đã chọn
        List<CartItems> selectedItems = cartItemRepository.findAllById(paymentInfo.cartItemIds);
        if (selectedItems.isEmpty()) {
            throw new Exception("Selected cart items not found");
        }
        
        Users user = selectedItems.get(0).getCart().getUser();

        // Lấy voucher nếu có
        Voucher voucher = null;
        if (paymentInfo.voucherCode != null) {
            voucher = voucherRepository.findByCode(paymentInfo.voucherCode).orElse(null);
        }

        // Tạo Order mới
        Orders order = Orders.builder()
                .user(user)
                .shippingAddress(shippingAddress)
                .phoneNumber(phoneNumber)
                .status("PAID")
                .paymentType("VNPAY:" + transactionNo)
                .voucher(voucher)
                .build();

        // Tạo OrderDetails từ CartItems đã chọn
        Set<OrderDetails> orderDetailsList = new HashSet<>();
        for (CartItems cartItem : selectedItems) {
            OrderDetails orderDetail = OrderDetails.builder()
                    .order(order)
                    .bookVariant(cartItem.getBookVariant())
                    .quantity(cartItem.getQuantity())
                    .pricePurchased(cartItem.getBookVariant().getPrice())
                    .build();
            orderDetailsList.add(orderDetail);
        }
        order.setOrderDetails(orderDetailsList);

        // Lưu order
        Orders savedOrder = orderRepository.save(order);

        // Xóa các cart items đã thanh toán
        cartItemRepository.deleteAll(selectedItems);
        
        // Xóa pending payment
        pendingPayments.remove(paymentKey);

        return savedOrder;
    }

    /**
     * Hủy thanh toán khi thất bại
     */
    @Transactional
    public void cancelPayment(String paymentKey) {
        pendingPayments.remove(paymentKey);
    }

    /**
     * Tính tổng tiền của các cart items được chọn sau khi áp dụng voucher
     */
    public BigDecimal calculateFinalAmount(String paymentKey) throws Exception {
        // Lấy thông tin thanh toán
        PaymentInfo paymentInfo = pendingPayments.get(paymentKey);
        if (paymentInfo == null) {
            throw new Exception("Payment information not found");
        }
        
        // Lấy các cart items đã chọn
        List<CartItems> selectedItems = cartItemRepository.findAllById(paymentInfo.cartItemIds);
        
        // Tính tổng tiền từ cart items đã chọn
        BigDecimal totalAmount = selectedItems.stream()
                .map(item -> BigDecimal.valueOf(item.getBookVariant().getPrice())
                        .multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Áp dụng giảm giá từ voucher nếu có
        if (paymentInfo.voucherCode != null) {
            try {
                Voucher voucher = voucherRepository.findByCode(paymentInfo.voucherCode).orElse(null);
                if (voucher != null && voucher.isValid()) {
                    // Xử lý theo loại giảm giá
                    if (voucher.getDiscountType() == Voucher.DiscountType.PERCENTAGE) {
                        // Giảm theo phần trăm
                        BigDecimal discount = totalAmount
                                .multiply(BigDecimal.valueOf(voucher.getDiscountValue()))
                                .divide(BigDecimal.valueOf(100));
                        
                        // Áp dụng giới hạn giảm giá tối đa nếu có
                        if (voucher.getMaxDiscount() != null) {
                            BigDecimal maxDiscount = BigDecimal.valueOf(voucher.getMaxDiscount());
                            discount = discount.min(maxDiscount);
                        }
                        totalAmount = totalAmount.subtract(discount);
                    } else {
                        // Giảm số tiền cố định
                        BigDecimal discount = BigDecimal.valueOf(voucher.getDiscountValue());
                        totalAmount = totalAmount.subtract(discount);
                    }
                }
            } catch (Exception e) {
                // Ignore voucher error
            }
        }

        return totalAmount;
    }
}
