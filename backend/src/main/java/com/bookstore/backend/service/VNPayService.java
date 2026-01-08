package com.bookstore.backend.service;

import com.bookstore.backend.config.VNPayConfig;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import jakarta.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import com.google.gson.Gson;
import com.google.gson.JsonObject;

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
        
        // Tính tổng tiền từ order
        BigDecimal finalAmount = paymentService.calculateFinalAmount(paymentKey);
        long amount = finalAmount.multiply(new BigDecimal("100")).longValue();

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
        // vnp_Params.put("vnp_IpnUrl", vnPayConfig.vnpIpnUrl); // ❌ Comment IPN nếu chưa đăng ký
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

        // Sử dụng VNPayConfig.hashAllFields (giống servlet)
        String hash = vnPayConfig.hashAllFields(params); 
        return hash.equals(vnp_SecureHash);
    }

    // --- 3. Query Transaction từ VNPay ---
    public JsonObject queryTransaction(String paymentKey, String transactionDate) throws Exception {
        Gson gson = new Gson();
        
        System.out.println("🔍 Query params: paymentKey=" + paymentKey + ", transactionDate=" + transactionDate);
        
        // Build request data theo đúng format VNPay yêu cầu
        ZonedDateTime now = ZonedDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        String requestId = now.format(formatter) + VNPayConfig.getRandomNumber(6);
        
        Map<String, String> vnp_Params = new LinkedHashMap<>();
        vnp_Params.put("vnp_RequestId", requestId);
        vnp_Params.put("vnp_Version", vnPayConfig.vnpVersion);
        vnp_Params.put("vnp_Command", "querydr");
        vnp_Params.put("vnp_TmnCode", vnPayConfig.vnpTmnCode);
        vnp_Params.put("vnp_TxnRef", paymentKey);
        vnp_Params.put("vnp_OrderInfo", "Query transaction: " + paymentKey);
        vnp_Params.put("vnp_TransactionNo", ""); // Để trống nếu không có
        vnp_Params.put("vnp_TransactionDate", transactionDate);
        vnp_Params.put("vnp_CreateDate", now.format(formatter));
        vnp_Params.put("vnp_IpAddr", "127.0.0.1");

        // Create secure hash cho QueryDR API (Dùng dấu | theo đúng spec VNPay)
        String hashData = buildQueryDRHashData(vnp_Params);
        String vnp_SecureHash = VNPayConfig.hmacSHA512(vnPayConfig.secretKey, hashData);
        
        System.out.println("QueryDR Hash Data: " + hashData);
        
        // JSON request body
        JsonObject requestJson = new JsonObject();
        for (Map.Entry<String, String> entry : vnp_Params.entrySet()) {
            requestJson.addProperty(entry.getKey(), entry.getValue());
        }
        requestJson.addProperty("vnp_SecureHash", vnp_SecureHash);

        System.out.println("Query request: " + requestJson.toString());

        // Send POST request to VNPay
        URL url = new URL(vnPayConfig.vnpApiUrl);
        HttpURLConnection con = (HttpURLConnection) url.openConnection();
        con.setRequestMethod("POST");
        con.setRequestProperty("Content-Type", "application/json");
        con.setDoOutput(true);

        DataOutputStream wr = new DataOutputStream(con.getOutputStream());
        wr.writeBytes(requestJson.toString());
        wr.flush();
        wr.close();

        int responseCode = con.getResponseCode();
        System.out.println("🔍 Query Transaction HTTP Response Code: " + responseCode);

        BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()));
        String output;
        StringBuilder response = new StringBuilder();
        while ((output = in.readLine()) != null) {
            response.append(output);
        }
        in.close();

        System.out.println("📦 VNPay Response: " + response.toString());

        return gson.fromJson(response.toString(), JsonObject.class);
    }

    private String buildQueryDRHashData(Map<String, String> params) {
        StringBuilder hashData = new StringBuilder();
        
        // Thứ tự cố định theo VNPay spec (không sort alphabet)
        hashData.append(params.get("vnp_RequestId")).append("|");
        hashData.append(params.get("vnp_Version")).append("|");
        hashData.append(params.get("vnp_Command")).append("|");
        hashData.append(params.get("vnp_TmnCode")).append("|");
        hashData.append(params.get("vnp_TxnRef")).append("|");
        hashData.append(params.get("vnp_TransactionDate")).append("|");
        hashData.append(params.get("vnp_CreateDate")).append("|");
        hashData.append(params.get("vnp_IpAddr")).append("|");
        hashData.append(params.get("vnp_OrderInfo"));
        
        return hashData.toString();
    }
}