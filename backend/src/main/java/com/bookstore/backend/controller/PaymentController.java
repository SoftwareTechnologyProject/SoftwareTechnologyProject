package com.bookstore.backend.controller;

import com.bookstore.backend.model.Orders;
// import com.bookstore.backend.service.PaymentService;
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
@RequestMapping("/payment")
public class PaymentController {

    // private final PaymentService paymentService;
    private final VNPayService vnPayService;

    @Autowired
    public PaymentController(VNPayService vnPayService) {
        // this.paymentService = paymentService;
        this.vnPayService = vnPayService;
    }

    /**
     * Endpoint GET cho browser - Tự động redirect đến VNPay
     * Dùng khi muốn paste link vào browser: http://localhost:8080/payment/create
     */
    @GetMapping("/create")
    public RedirectView createPaymentRedirect(
            @RequestParam(value = "cart_item_ids", required = false) String cartItemIdsStr,
            @RequestParam(value = "voucher_code", required = false) String voucherCode,
            @RequestParam(value = "user_id", required = false) Long userId,
            HttpServletRequest request) {
        
        try {
            // TEST MODE: Dùng dữ liệu giả lập nếu không có tham số
            if (cartItemIdsStr == null || cartItemIdsStr.trim().isEmpty()) {
                cartItemIdsStr = "1,2,3";
            }
            if (userId == null) {
                userId = 1L;
            }
            
            // TODO: Khi ráp vào project, uncomment validation này
            // if (cartItemIdsStr == null || cartItemIdsStr.trim().isEmpty()) {
            //     return new RedirectView("/payment-error?message=Missing+cart+items");
            // }

            List<Long> cartItemIds = Arrays.stream(cartItemIdsStr.split(","))
                    .map(String::trim)
                    .map(Long::parseLong)
                    .collect(Collectors.toList());

            // TODO: Khi ráp vào project, uncomment dòng dưới
            // String paymentKey = paymentService.initiatePaymentTransaction(cartItemIds, voucherCode, userId);
            
            // TEST MODE: Tạo paymentKey giả
            String paymentKey = "payment_test_" + System.currentTimeMillis();
            
            // Tạo URL thanh toán VNPay và redirect
            String paymentUrl = vnPayService.createPaymentUrl(paymentKey, request);
            return new RedirectView(paymentUrl);

        } catch (Exception e) {
            e.printStackTrace();
            return new RedirectView("/payment-error?message=" + e.getMessage());
        }
    }

    /**
     * Xử lý yêu cầu POST để tạo giao dịch thanh toán từ các sản phẩm được chọn.
     * Trả về JSON với URL thanh toán VNPay - Dùng cho API call từ frontend.
     */
    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createPayment(
            @RequestParam(value = "cart_item_ids", required = false) String cartItemIdsStr,
            @RequestParam(value = "voucher_code", required = false) String voucherCode,
            @RequestParam(value = "user_id", required = false) Long userId,
            HttpServletRequest request) {

        Map<String, Object> response = new HashMap<>();
        
        try {
            // TEST MODE: Dùng dữ liệu giả lập nếu không có tham số
            // TODO: Khi ráp vào project, xóa block TEST này và uncomment phần validation bên dưới
            if (cartItemIdsStr == null || cartItemIdsStr.trim().isEmpty()) {
                cartItemIdsStr = "1,2,3"; // Test với cart items giả
            }
            if (userId == null) {
                userId = 1L; // Test với user ID giả
            }
            
            // TODO: Khi ráp vào project, uncomment phần validation này và thay đổi response
            // if (cartItemIdsStr == null || cartItemIdsStr.trim().isEmpty()) {
            //     response.put("code", "01");
            //     response.put("message", "Missing cart items");
            //     return ResponseEntity.badRequest().body(response);
            // }
            // if (userId == null) {
            //     response.put("code", "01");
            //     response.put("message", "Missing user ID");
            //     return ResponseEntity.badRequest().body(response);
            // }

            // Parse cart item IDs (format: "1,2,3")
            List<Long> cartItemIds = Arrays.stream(cartItemIdsStr.split(","))
                    .map(String::trim)
                    .map(Long::parseLong)
                    .collect(Collectors.toList());

            // Khởi tạo thanh toán - trả về paymentKey
            // TODO: Khi ráp vào project, uncomment dòng dưới và comment dòng test
            // String paymentKey = paymentService.initiatePaymentTransaction(cartItemIds, voucherCode, userId);
            
            // TEST MODE: Tạo paymentKey giả
            String paymentKey = "payment_test_" + System.currentTimeMillis();
            
            // Tạo URL thanh toán VNPay
            String paymentUrl = vnPayService.createPaymentUrl(paymentKey, request);
            
            response.put("code", "00");
            response.put("message", "success");
            response.put("paymentUrl", paymentUrl);
            response.put("paymentKey", paymentKey);
            
            return ResponseEntity.ok(response);

        } catch (NumberFormatException e) {
            e.printStackTrace();
            response.put("code", "02");
            response.put("message", "Invalid cart item IDs format");
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            e.printStackTrace();
            response.put("code", "99");
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
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

            // ===== TEST MODE =====
            // Nếu là payment key test, bỏ qua query VNPay và giả lập thành công
            if (paymentKey.startsWith("payment_test_")) {
                System.out.println("⚠️ TEST MODE: Bypassing VNPay query for test payment");
                System.out.println("✅ Payment VERIFIED (TEST MODE)");
                
                response.put("code", "00");
                response.put("message", "Payment verified successfully (TEST MODE)");
                response.put("paymentStatus", "SUCCESS");
                response.put("transactionNo", "TEST_" + System.currentTimeMillis());
                
                return ResponseEntity.ok(response);
            }

            // ===== REAL MODE =====
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
                
                // ===== REAL MODE =====
                // paymentService.markPaymentSuccess(paymentKey, transactionNo);
                
                response.put("code", "00");
                response.put("message", "Payment verified successfully");
                response.put("paymentStatus", "SUCCESS");
                response.put("transactionNo", transactionNo);
            } else {
                System.out.println("❌ Payment FAILED or NOT FOUND");
                
                // ===== REAL MODE =====
                // paymentService.markPaymentFailed(paymentKey);
                
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
                // ===== REAL MODE =====
                // paymentService.markPaymentSuccess(paymentKey, vnpayResponse.get("vnp_TransactionNo").getAsString());
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