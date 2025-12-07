package com.bookstore.backend.service;

import com.bookstore.backend.config.VNPayConfig;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import jakarta.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class VNPayService {
    private final PaymentService paymentService;
    private final VNPayConfig vnPayConfig;

    @Autowired
    public VNPayService(PaymentService paymentService, VNPayConfig vnPayConfig) {
        this.paymentService = paymentService;
        this.vnPayConfig = vnPayConfig;
    }

    // --- 1. Tạo URL Thanh toán ---
    public String createPaymentUrl(String paymentKey, HttpServletRequest request) throws Exception {
        String vnp_TxnRef = paymentKey;
        String vnp_IpAddr = VNPayConfig.getIpAddress(request);
        
        // Tính tổng tiền
        // TODO: Khi ráp vào project, uncomment dòng dưới và comment dòng test
        // BigDecimal finalAmount = paymentService.calculateFinalAmount(paymentKey);
        // long amount = finalAmount.multiply(new BigDecimal("100")).longValue();
        
        // TEST MODE: Dùng số tiền giả lập (10,000 VND = 1,000,000 đồng)
        long amount = 1000000; // 10,000 VND

        Map<String, String> vnp_Params = new HashMap<>();
        
        vnp_Params.put("vnp_Version", vnPayConfig.vnpVersion); 
        vnp_Params.put("vnp_Command", vnPayConfig.vnpCommand);
        vnp_Params.put("vnp_TmnCode", vnPayConfig.vnpTmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang: " + paymentKey);
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnPayConfig.vnpReturnUrl);
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

        ZonedDateTime now = ZonedDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        vnp_Params.put("vnp_CreateDate", now.format(formatter));
        vnp_Params.put("vnp_ExpireDate", now.plusMinutes(15).format(formatter));

        // ✅ Sắp xếp và build hash giống servlet
        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                // Build hash data
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8)); // ✅ UTF-8
                
                // Build query
                query.append(URLEncoder.encode(fieldName, StandardCharsets.UTF_8));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8));
                
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }

        String queryUrl = query.toString();
        
        // ✅ Tạo hash giống servlet
        String vnp_SecureHash = VNPayConfig.hmacSHA512(vnPayConfig.secretKey, hashData.toString());
        
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
        String paymentUrl = vnPayConfig.vnpPayUrl + "?" + queryUrl;

        return paymentUrl;
    }

    // --- 2. Verify VNPay callback ---
    public boolean verifyCallback(Map<String, String> params) {
        String vnp_SecureHash = params.get("vnp_SecureHash");
        params.remove("vnp_SecureHashType");
        params.remove("vnp_SecureHash");

        // ✅ Sử dụng VNPayConfig.hashAllFields (giống servlet)
        String hash = vnPayConfig.hashAllFields(params); 
        return hash.equals(vnp_SecureHash);
    }
}