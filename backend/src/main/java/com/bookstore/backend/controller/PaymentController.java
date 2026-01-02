package com.bookstore.backend.controller;

import com.bookstore.backend.DTO.OrdersDTO;
import com.bookstore.backend.config.VNPayConfig;
import com.bookstore.backend.service.OrdersService;
import com.bookstore.backend.service.PaymentService;
import com.bookstore.backend.service.VNPayService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import jakarta.servlet.http.HttpServletRequest;
import java.util.*;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    private static final Logger log = LoggerFactory.getLogger(PaymentController.class);

    private final PaymentService paymentService;
    private final VNPayService vnPayService;
    private final OrdersService ordersService;
    private final VNPayConfig vnPayConfig;

    @Autowired
    public PaymentController(PaymentService paymentService, VNPayService vnPayService, OrdersService ordersService, VNPayConfig vnPayConfig) {
        this.paymentService = paymentService;
        this.vnPayService = vnPayService;
        this.ordersService = ordersService;
        this.vnPayConfig = vnPayConfig;
    }

    @GetMapping("/vnpay-return")
    public RedirectView vnpayReturn(HttpServletRequest request) {
        try {
            // ✅ BƯớc 1: Lấy thông tin từ callback
            String paymentKey = request.getParameter("vnp_TxnRef");
            String transactionDate = request.getParameter("vnp_PayDate");
            String responseCode = request.getParameter("vnp_ResponseCode");
            String transactionNo = request.getParameter("vnp_TransactionNo");
            String secureHash = request.getParameter("vnp_SecureHash");
            
            if (paymentKey == null || paymentKey.isEmpty()) {
                log.warn("⚠️ Missing payment key in VNPay callback");
                return new RedirectView("http://localhost:5173/payment/result?error=missing_payment_key");
            }

            log.info("🔔 Received VNPay callback: {}", paymentKey);
            log.debug("   - Response Code: {}", responseCode);
            log.debug("   - Transaction Date: {}", transactionDate);
            log.debug("   - Transaction No: {}", transactionNo);

            // ✅ BƯớc 2: VERIFY SIGNATURE - BẢO MẬT QUAN TRỌNG!
            Map<String, String> vnpParams = new TreeMap<>();
            request.getParameterMap().forEach((key, values) -> {
                if (values != null && values.length > 0 && !"vnp_SecureHash".equals(key)) {
                    vnpParams.put(key, values[0]);
                }
            });

            // Tạo hash để verify
            StringBuilder hashData = new StringBuilder();
            vnpParams.forEach((key, value) -> {
                if (hashData.length() > 0) {
                    hashData.append("&");
                }
                try {
                    hashData.append(key).append("=").append(URLEncoder.encode(value, StandardCharsets.UTF_8));
                } catch (Exception e) {
                    log.error("❌ Error encoding parameter: {}", key, e);
                }
            });

            String calculatedHash = VNPayConfig.hmacSHA512(vnPayConfig.secretKey, hashData.toString());
            
            if (secureHash == null || !secureHash.equals(calculatedHash)) {
                log.error("🚨 SECURITY ALERT: Invalid VNPay signature! Possible attack detected.");
                log.error("   Expected: {}", calculatedHash);
                log.error("   Received: {}", secureHash);
                return new RedirectView("http://localhost:5173/payment/result?error=invalid_signature");
            }

            log.info("✅ VNPay signature verified successfully");

            // Lấy orderId từ paymentKey
            Long orderId = paymentService.getOrderIdByPaymentKey(paymentKey);
            if (orderId == null) {
                log.warn("⚠️ Order not found for paymentKey: {}", paymentKey);
                return new RedirectView("http://localhost:5173/payment/result?error=order_not_found");
            }

            // Kiểm tra xem payment đã được xử lý chưa
            String existingStatus = paymentService.getPaymentStatus(paymentKey);
            if (existingStatus != null) {
                log.info("⚠️ Payment already processed with status: {}", existingStatus);
                return new RedirectView("http://localhost:5173/payment/result?orderId=" + orderId);
            }

            // Verify với VNPay và đánh dấu thanh toán
            try {
                log.info("🔍 Verifying payment with VNPay: {}", paymentKey);
                
                com.google.gson.JsonObject vnpayResponse = vnPayService.queryTransaction(paymentKey, transactionDate);
                
                String vnpResponseCode = vnpayResponse.has("vnp_ResponseCode") 
                    ? vnpayResponse.get("vnp_ResponseCode").getAsString() : "99";
                String vnpTransactionStatus = vnpayResponse.has("vnp_TransactionStatus")
                    ? vnpayResponse.get("vnp_TransactionStatus").getAsString() : "99";
                String vnpTransactionNo = vnpayResponse.has("vnp_TransactionNo")
                    ? vnpayResponse.get("vnp_TransactionNo").getAsString() : transactionNo;

                log.debug("   VNPay Response Code: {}", vnpResponseCode);
                log.debug("   Transaction Status: {}", vnpTransactionStatus);

                if ("00".equals(vnpResponseCode) && "00".equals(vnpTransactionStatus)) {
                    log.info("✅ Payment VERIFIED and CONFIRMED as SUCCESS");
                    paymentService.markPaymentSuccess(paymentKey, vnpTransactionNo, transactionDate);
                } else {
                    log.warn("❌ Payment FAILED or NOT FOUND");
                    paymentService.markPaymentFailed(paymentKey);
                }
            } catch (Exception e) {
                log.error("❌ Error during verification: {}", e.getMessage(), e);
                // Nếu có lỗi trong quá trình verify, vẫn redirect nhưng không đánh dấu
            }

            String redirectUrl = String.format(
                "http://localhost:5173/payment/result?orderId=%d",
                orderId
            );
            
            return new RedirectView(redirectUrl);

        } catch (Exception e) {
            log.error("❌ Unexpected error in vnpay-return: {}", e.getMessage(), e);
            return new RedirectView("http://localhost:5173/payment/result?error=unknown");
        }
    }

    @GetMapping("/result")
    public ResponseEntity<OrdersDTO> getPaymentResult(@RequestParam("orderId") Long orderId) {
        try {
            OrdersDTO orderDTO = ordersService.getOrderById(orderId);
            if (orderDTO == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }

            return ResponseEntity.ok(orderDTO);

        } catch (Exception e) {
            log.error("❌ Error getting payment result for orderId {}: {}", orderId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

}