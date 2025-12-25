package com.bookstore.backend.controller;

import com.bookstore.backend.DTO.OrdersDTO;
import com.bookstore.backend.service.OrdersService;
import com.bookstore.backend.service.PaymentService;
import com.bookstore.backend.service.VNPayService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

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

    @GetMapping("/vnpay-return")
    public RedirectView vnpayReturn(HttpServletRequest request) {
        try {
            String paymentKey = request.getParameter("vnp_TxnRef");
            String transactionDate = request.getParameter("vnp_PayDate");
            String responseCode = request.getParameter("vnp_ResponseCode");
            String transactionNo = request.getParameter("vnp_TransactionNo");
            
            if (paymentKey == null || paymentKey.isEmpty()) {
                return new RedirectView("http://localhost:5173/payment/result?error=missing_payment_key");
            }

            System.out.println("   Received VNPay callback: " + paymentKey);
            System.out.println("   - Response Code: " + responseCode);
            System.out.println("   - Transaction Date: " + transactionDate);
            System.out.println("   - Transaction No: " + transactionNo);

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

            com.google.gson.JsonObject vnpayResponse = vnPayService.queryTransaction(paymentKey, transactionDate);

            String vnpResponseCode = vnpayResponse.has("vnp_ResponseCode") 
                ? vnpayResponse.get("vnp_ResponseCode").getAsString() : "99";
            String vnpTransactionStatus = vnpayResponse.has("vnp_TransactionStatus")
                ? vnpayResponse.get("vnp_TransactionStatus").getAsString() : "99";
            String transactionNo = vnpayResponse.has("vnp_TransactionNo")
                ? vnpayResponse.get("vnp_TransactionNo").getAsString() : "";

            System.out.println("   VNPay Response Code: " + vnpResponseCode);
            System.out.println("   Transaction Status: " + vnpTransactionStatus);

            if ("00".equals(vnpResponseCode) && "00".equals(vnpTransactionStatus)) {
                System.out.println("Payment VERIFIED and CONFIRMED as SUCCESS");
                
                try {
                    paymentService.markPaymentSuccess(paymentKey, transactionNo, transactionDate);
                } catch (Exception e) {
                    System.out.println("Payment already processed or expired: " + e.getMessage());
                }
                
                response.put("code", "00");
                response.put("message", "Payment verified successfully");
                response.put("paymentStatus", "SUCCESS");
                response.put("transactionNo", transactionNo);
            } else {
                System.out.println(" Payment FAILED or NOT FOUND");
                System.out.println("   Response Code: " + vnpResponseCode + ", Transaction Status: " + vnpTransactionStatus);
                
                try {
                    paymentService.markPaymentFailed(paymentKey);
                } catch (Exception e) {
                    System.out.println("Payment already processed or expired: " + e.getMessage());
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

    @GetMapping("/result")
    public ResponseEntity<OrdersDTO> getPaymentResult(@RequestParam("paymentKey") String paymentKey) {
        try {
            Long orderId = paymentService.getOrderIdByPaymentKey(paymentKey);
            if (orderId == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }

            OrdersDTO orderDTO = ordersService.getOrderById(orderId);
            return ResponseEntity.ok(orderDTO);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

}