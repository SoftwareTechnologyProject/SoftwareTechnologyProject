package com.bookstore.backend.controller;

import com.bookstore.backend.DTO.OrdersDTO;
import com.bookstore.backend.model.Orders;
import com.bookstore.backend.service.OrdersService;
import com.bookstore.backend.service.PaymentService;
import com.bookstore.backend.service.VNPayService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Arrays;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    private final PaymentService paymentService;
    private final VNPayService vnPayService;
    private final OrdersService ordersService;

    @Autowired
    public PaymentController(PaymentService paymentService, VNPayService vnPayService, OrdersService ordersService) {
        this.paymentService = paymentService;
        this.vnPayService = vnPayService;
        this.ordersService = ordersService;
    }

    /**
     * Return URL - VNPay redirect user về URL này sau khi thanh toán
     * Backend redirect về frontend page duy nhất để xử lý
     */
    @GetMapping("/vnpay-return")
    public RedirectView vnpayReturn(HttpServletRequest request) {
        try {
            // Lấy params từ VNPay
            String paymentKey = request.getParameter("vnp_TxnRef");
            String transactionDate = request.getParameter("vnp_PayDate");
            String responseCode = request.getParameter("vnp_ResponseCode");
            String transactionNo = request.getParameter("vnp_TransactionNo");
            String amount = request.getParameter("vnp_Amount");
            
            if (paymentKey == null || paymentKey.isEmpty()) {
                return new RedirectView("http://localhost:5173/payment/result?error=missing_payment_key");
            }

            System.out.println("📥 Received VNPay callback: " + paymentKey);
            System.out.println("   - Response Code: " + responseCode);
            System.out.println("   - Transaction Date: " + transactionDate);
            System.out.println("   - Transaction No: " + transactionNo);

            // ✅ Redirect về frontend với paymentKey và transactionDate
            // Frontend sẽ tự gọi /payment/verify để xác thực
            String redirectUrl = String.format(
                "http://localhost:5173/payment/result?paymentKey=%s&transactionDate=%s",
                paymentKey,
                transactionDate != null ? transactionDate : ""
            );
            
            return new RedirectView(redirectUrl);

        } catch (Exception e) {
            e.printStackTrace();
            return new RedirectView("http://localhost:5173/payment/result?error=unknown");
        }
    }

    /**
     * Verify và xác nhận thanh toán bằng cách query VNPay
     * Frontend gọi API này sau khi nhận callback từ VNPay
     */
    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyPayment(
            @RequestParam("paymentKey") String paymentKey,
            @RequestParam("transactionDate") String transactionDate) {

        Map<String, Object> response = new HashMap<>();

        try {
            System.out.println("🔍 Verifying payment with VNPay: " + paymentKey);
            System.out.println("   Transaction Date: " + transactionDate);
            
            // Kiểm tra xem payment đã được xử lý chưa (tránh duplicate requests)
            String existingStatus = paymentService.getPaymentStatus(paymentKey);
            if (existingStatus != null) {
                System.out.println("⚠️ Payment already processed with status: " + existingStatus);
                response.put("code", "00");
                response.put("message", "Payment already processed");
                response.put("paymentStatus", existingStatus);
                return ResponseEntity.ok(response);
            }

            // Gọi VNPay API để query và verify transaction
            com.google.gson.JsonObject vnpayResponse = vnPayService.queryTransaction(paymentKey, transactionDate);

            // Parse VNPay response
            String vnpResponseCode = vnpayResponse.has("vnp_ResponseCode") 
                ? vnpayResponse.get("vnp_ResponseCode").getAsString() : "99";
            String vnpTransactionStatus = vnpayResponse.has("vnp_TransactionStatus")
                ? vnpayResponse.get("vnp_TransactionStatus").getAsString() : "99";
            String transactionNo = vnpayResponse.has("vnp_TransactionNo")
                ? vnpayResponse.get("vnp_TransactionNo").getAsString() : "";

            System.out.println("   VNPay Response Code: " + vnpResponseCode);
            System.out.println("   Transaction Status: " + vnpTransactionStatus);

            // Xác thực và cập nhật database
            if ("00".equals(vnpResponseCode) && "00".equals(vnpTransactionStatus)) {
                System.out.println("✅ Payment VERIFIED and CONFIRMED as SUCCESS");
                
                try {
                    // Cập nhật payment status trong database
                    paymentService.markPaymentSuccess(paymentKey, transactionNo);
                } catch (Exception e) {
                    // Nếu payment đã được xử lý rồi, ignore exception
                    System.out.println("⚠️ Payment already processed or expired: " + e.getMessage());
                }
                
                response.put("code", "00");
                response.put("message", "Payment verified successfully");
                response.put("paymentStatus", "SUCCESS");
                response.put("transactionNo", transactionNo);
            } else {
                System.out.println("❌ Payment FAILED or NOT FOUND");
                System.out.println("   Response Code: " + vnpResponseCode + ", Transaction Status: " + vnpTransactionStatus);
                
                try {
                    // Đánh dấu payment thất bại
                    paymentService.markPaymentFailed(paymentKey);
                } catch (Exception e) {
                    // Nếu payment đã được xử lý rồi, ignore exception
                    System.out.println("⚠️ Payment already processed or expired: " + e.getMessage());
                }
                
                response.put("code", "01");
                response.put("message", "Payment verification failed");
                response.put("paymentStatus", "FAILED");
                response.put("vnpResponseCode", vnpResponseCode);
                response.put("vnpTransactionStatus", vnpTransactionStatus);
            }

            response.put("vnpayData", vnpayResponse.toString());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            response.put("code", "99");
            response.put("message", "Error: " + e.getMessage());
            response.put("paymentStatus", "ERROR");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Query Transaction từ VNPay - Fallback khi Return URL fail
     * Frontend gọi API này khi không nhận được kết quả sau một khoảng thời gian
     */
    @PostMapping("/query")
    public ResponseEntity<Map<String, Object>> queryTransaction(
            @RequestParam("paymentKey") String paymentKey,
            @RequestParam("transactionDate") String transactionDate) {

        Map<String, Object> response = new HashMap<>();

        try {
            System.out.println("🔍 Querying VNPay for payment: " + paymentKey);
            System.out.println("   Transaction Date: " + transactionDate);

            // Gọi VNPay API để query transaction
            com.google.gson.JsonObject vnpayResponse = vnPayService.queryTransaction(paymentKey, transactionDate);

            response.put("code", "00");
            response.put("message", "success");
            response.put("data", vnpayResponse.toString());

            // Parse VNPay response
            String vnpResponseCode = vnpayResponse.get("vnp_ResponseCode").getAsString();
            String vnpTransactionStatus = vnpayResponse.get("vnp_TransactionStatus").getAsString();

            System.out.println("   VNPay Response Code: " + vnpResponseCode);
            System.out.println("   Transaction Status: " + vnpTransactionStatus);

            // Cập nhật database nếu cần
            if ("00".equals(vnpTransactionStatus)) {
                System.out.println("✅ Transaction confirmed as SUCCESS by query");
                try {
                    // Cập nhật payment status
                    paymentService.markPaymentSuccess(paymentKey, vnpayResponse.get("vnp_TransactionNo").getAsString());
                } catch (Exception e) {
                    System.out.println("⚠️ Payment already processed or expired: " + e.getMessage());
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

    /**
     * Lấy thông tin order từ paymentKey - Frontend gọi sau khi verify thành công
     */
    @GetMapping("/result")
    public ResponseEntity<OrdersDTO> getPaymentResult(@RequestParam("paymentKey") String paymentKey) {
        try {
            // Lấy orderId từ paymentKey
            Long orderId = paymentService.getOrderIdByPaymentKey(paymentKey);
            if (orderId == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }

            // Lấy thông tin order
            OrdersDTO orderDTO = ordersService.getOrderById(orderId);
            return ResponseEntity.ok(orderDTO);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

}