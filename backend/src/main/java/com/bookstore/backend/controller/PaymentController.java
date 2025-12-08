package com.bookstore.backend.controller;

import com.bookstore.backend.model.Orders;
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
@RequestMapping("/payment")
public class PaymentController {

    private final PaymentService paymentService;
    private final VNPayService vnPayService;

    @Autowired
    public PaymentController(PaymentService paymentService, VNPayService vnPayService) {
        this.paymentService = paymentService;
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
     * Xử lý callback từ VNPay sau khi thanh toán.
     * Endpoint này sẽ được VNPay gọi sau khi user hoàn tất thanh toán.
     * Có thể trả về JSON hoặc redirect tùy theo cách frontend xử lý.
     */
    @GetMapping("/vnpay-return")
    public ResponseEntity<Map<String, Object>> vnpayReturn(
            HttpServletRequest request,
            @RequestParam(value = "shipping_address", required = false) String shippingAddress,
            @RequestParam(value = "phone_number", required = false) String phoneNumber) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Lấy tất cả parameters từ VNPay
            Map<String, String> params = new HashMap<>();
            Enumeration<String> parameterNames = request.getParameterNames();
            while (parameterNames.hasMoreElements()) {
                String paramName = parameterNames.nextElement();
                String paramValue = request.getParameter(paramName);
                params.put(paramName, paramValue);
            }

            // Verify chữ ký từ VNPay
            boolean isValid = vnPayService.verifyCallback(params);
            
            if (!isValid) {
                response.put("code", "97");
                response.put("message", "Invalid signature");
                return ResponseEntity.badRequest().body(response);
            }

            // Lấy thông tin giao dịch
            String vnp_ResponseCode = params.get("vnp_ResponseCode");
            String vnp_TxnRef = params.get("vnp_TxnRef"); // Chính là paymentKey
            String vnp_Amount = params.get("vnp_Amount");
            String vnp_BankCode = params.get("vnp_BankCode");
            String vnp_TransactionNo = params.get("vnp_TransactionNo");
            String paymentKey = vnp_TxnRef;

            if ("00".equals(vnp_ResponseCode)) {
                // Thanh toán thành công - Tạo đơn hàng
                // TODO: Khi ráp vào project, uncomment block dưới và comment phần TEST
                // Orders order = paymentService.createOrderFromCart(
                //     paymentKey, 
                //     vnp_TransactionNo,
                //     shippingAddress != null ? shippingAddress : "Default Address",
                //     phoneNumber != null ? phoneNumber : "0000000000"
                // );
                // response.put("code", "00");
                // response.put("message", "Payment successful");
                // response.put("orderId", order.getId());
                // response.put("paymentKey", paymentKey);
                // response.put("transactionNo", vnp_TransactionNo);
                // return ResponseEntity.ok(response);
                
                // TEST MODE: Chỉ trả về thông tin thanh toán thành công
                response.put("code", "00");
                response.put("message", "Payment successful (TEST MODE)");
                response.put("paymentKey", paymentKey);
                response.put("transactionNo", vnp_TransactionNo);
                response.put("amount", vnp_Amount);
                response.put("bankCode", vnp_BankCode);
                return ResponseEntity.ok(response);
                
            } else {
                // Thanh toán thất bại - Hủy thanh toán
                // TODO: Khi ráp vào project, uncomment dòng dưới
                // paymentService.cancelPayment(paymentKey);
                
                response.put("code", vnp_ResponseCode);
                response.put("message", "Payment failed");
                response.put("paymentKey", paymentKey);
                return ResponseEntity.badRequest().body(response);
            }

        } catch (Exception e) {
            e.printStackTrace();
            response.put("code", "99");
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}