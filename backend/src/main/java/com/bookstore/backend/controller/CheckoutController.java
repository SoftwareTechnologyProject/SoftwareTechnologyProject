package com.bookstore.backend.controller;

import com.bookstore.backend.DTO.NotificationRequestDTO;
import com.bookstore.backend.DTO.OrderCreationRequestDTO;
import com.bookstore.backend.DTO.OrderDetailDTO;
import com.bookstore.backend.DTO.OrdersDTO;
import com.bookstore.backend.model.Users;
import com.bookstore.backend.model.enums.PaymentType;
import com.bookstore.backend.service.EmailService;
import com.bookstore.backend.service.NotificationService;
import com.bookstore.backend.service.OrdersService;
import com.bookstore.backend.service.PaymentService;
import com.bookstore.backend.service.VNPayService;
import com.bookstore.backend.utils.SecurityUtils;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/checkout")
public class CheckoutController {

    private final OrdersService ordersService;
    private final PaymentService paymentService;
    private final VNPayService vnPayService;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final SecurityUtils securityUtils;

    @Autowired
    public CheckoutController(OrdersService ordersService, 
                             PaymentService paymentService,
                             VNPayService vnPayService, 
                             NotificationService notificationService, 
                             EmailService emailService,
                             SecurityUtils securityUtils) {
        this.ordersService = ordersService;
        this.paymentService = paymentService;
        this.vnPayService = vnPayService;
        this.notificationService = notificationService;
        this.emailService = emailService;
        this.securityUtils = securityUtils;
    }

    @PostMapping("")
    public ResponseEntity<Map<String, Object>> createOrderAndGetPaymentUrl(
            @RequestBody OrderCreationRequestDTO request,
            HttpServletRequest httpRequest) {

        Map<String, Object> response = new HashMap<>();

        try {
            String token = httpRequest.getHeader("Authorization");
            if (token == null || !token.startsWith("Bearer ")) {
                response.put("code", "401");
                response.put("message", "Unauthorized - Missing or invalid token");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            System.out.println("Creating order...");

            PaymentType paymentType;
            String paymentMethodStr = request.getPaymentMethod().toUpperCase();
            
            if (paymentMethodStr.equals("CASH")) {
                paymentType = PaymentType.COD;
            } else if (paymentMethodStr.equals("VNPAY") || paymentMethodStr.equals("BANKING")) {
                paymentType = PaymentType.BANKING;
            } else {
                paymentType = PaymentType.BANKING; 
            }

            // 3. Map OrderCreationRequestDTO -> OrdersService parameters
            String shippingAddress = request.getDeliveryAddress().getFullAddress();
            String phoneNumber = request.getCustomerInfo().getPhoneNumber();
            String voucherCode = request.getCouponCode();

            List<OrderDetailDTO> orderDetails = request.getItems().stream()
                    .map(item -> new OrderDetailDTO(
                            null, 
                            item.getBookId(), // bookVariantId
                            item.getBookTitle(),
                            item.getQuantity(),
                            item.getPricePurchased(), 
                            item.getSubTotal(), 
                            item.getImageUrl()
                    ))
                    .collect(Collectors.toList());

            OrdersDTO createdOrder = ordersService.createOrder(
                    orderDetails,
                    voucherCode,
                    paymentType,
                    shippingAddress,
                    phoneNumber
            );

            System.out.println("Order created: #" + createdOrder.getId());

            if (paymentType == PaymentType.BANKING) {
                String paymentKey = paymentService.initiatePaymentTransaction(createdOrder.getId());
                
                String paymentUrl = vnPayService.createPaymentUrl(paymentKey, httpRequest);

                response.put("code", "00");
                response.put("message", "Order created successfully");
                response.put("orderId", createdOrder.getId());
                response.put("paymentUrl", paymentUrl);
                response.put("paymentKey", paymentKey);
                response.put("requiresPayment", true);
            } else {
                response.put("code", "00");
                response.put("message", "Order created successfully (COD)");
                response.put("orderId", createdOrder.getId());
                response.put("requiresPayment", false);
                
                Users currentUser = securityUtils.getCurrentUser();
                NotificationRequestDTO notificationRequest = NotificationRequestDTO.builder()
                    .content("Thanh toán thành công cho đơn hàng #" + createdOrder.getId() + " của bạn")
                    .url("http://localhost:5173/payment/pending?orderId=" + createdOrder.getId())
                    .type(com.bookstore.backend.model.enums.NotificationType.PERSONAL)
                    .userId(currentUser.getId())
                    .build();
                notificationService.sendNotification(notificationRequest);
                
                // Gửi email xác nhận đơn hàng cho COD
                try {
                    emailService.sendOrderConfirmationEmail(
                        currentUser.getEmail(),
                        currentUser.getFullName(),
                        createdOrder
                    );
                    System.out.println("📧 Order confirmation email sent to: " + currentUser.getEmail());
                } catch (Exception e) {
                    System.err.println("⚠️ Failed to send order confirmation email: " + e.getMessage());
                }
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            response.put("code", "99");
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
