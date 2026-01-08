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

            System.out.println("Received VNPay callback: " + paymentKey);
            System.out.println("   - Response Code: " + responseCode);
            System.out.println("   - Transaction Date: " + transactionDate);
            System.out.println("   - Transaction No: " + transactionNo);

            // Lấy orderId từ paymentKey
            Long orderId = paymentService.getOrderIdByPaymentKey(paymentKey);
            if (orderId == null) {
                System.out.println("Order not found for paymentKey: " + paymentKey);
                return new RedirectView("http://localhost:5173/payment/result?error=order_not_found");
            }

            // Kiểm tra xem payment đã được xử lý chưa
            String existingStatus = paymentService.getPaymentStatus(paymentKey);
            if (existingStatus != null) {
                System.out.println("Payment already processed with status: " + existingStatus);
                return new RedirectView("http://localhost:5173/payment/result?orderId=" + orderId);
            }

            // Verify với VNPay và đánh dấu thanh toán
            try {
                System.out.println("Verifying payment with VNPay: " + paymentKey);
                
                com.google.gson.JsonObject vnpayResponse = vnPayService.queryTransaction(paymentKey, transactionDate);
                
                String vnpResponseCode = vnpayResponse.has("vnp_ResponseCode") 
                    ? vnpayResponse.get("vnp_ResponseCode").getAsString() : "99";
                String vnpTransactionStatus = vnpayResponse.has("vnp_TransactionStatus")
                    ? vnpayResponse.get("vnp_TransactionStatus").getAsString() : "99";
                String vnpTransactionNo = vnpayResponse.has("vnp_TransactionNo")
                    ? vnpayResponse.get("vnp_TransactionNo").getAsString() : transactionNo;

                System.out.println("   VNPay Response Code: " + vnpResponseCode);
                System.out.println("   Transaction Status: " + vnpTransactionStatus);

                if ("00".equals(vnpResponseCode) && "00".equals(vnpTransactionStatus)) {
                    System.out.println("Payment VERIFIED and CONFIRMED as SUCCESS");
                    paymentService.markPaymentSuccess(paymentKey, vnpTransactionNo, transactionDate);
                } else {
                    System.out.println("Payment FAILED or NOT FOUND");
                    paymentService.markPaymentFailed(paymentKey);
                }
            } catch (Exception e) {
                System.out.println("Error during verification: " + e.getMessage());
                // Nếu có lỗi trong quá trình verify, vẫn redirect nhưng không đánh dấu
                e.printStackTrace();
            }

            String redirectUrl = String.format(
                "http://localhost:5173/payment/result?orderId=%d",
                orderId
            );
            
            return new RedirectView(redirectUrl);

        } catch (Exception e) {
            e.printStackTrace();
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
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

}