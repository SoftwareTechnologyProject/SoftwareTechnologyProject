package com.bookstore.backend.service;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service bảo vệ login endpoint khỏi brute-force attack
 * Giới hạn: 5 lần thử trong 15 phút cho mỗi email
 */
@Service
public class RateLimitService {

    // Map lưu số lần thử cho mỗi email
    private final Map<String, Integer> loginAttempts = new ConcurrentHashMap<>();
    private final Map<String, Long> blockedUntil = new ConcurrentHashMap<>();
    
    private static final int MAX_ATTEMPTS = 5;
    private static final long BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 phút

    /**
     * Kiểm tra xem email này có thể thử đăng nhập không
     * @param email Email đang thử đăng nhập
     * @return true nếu còn quota, false nếu đã quá giới hạn
     */
    public boolean tryAcquire(String email) {
        // Kiểm tra xem có đang bị block không
        Long blockTime = blockedUntil.get(email);
        if (blockTime != null && System.currentTimeMillis() < blockTime) {
            return false; // Vẫn còn bị block
        }
        
        // Đã hết thời gian block → reset
        if (blockTime != null && System.currentTimeMillis() >= blockTime) {
            blockedUntil.remove(email);
            loginAttempts.remove(email);
        }
        
        // Đếm số lần thử
        int attempts = loginAttempts.getOrDefault(email, 0);
        if (attempts >= MAX_ATTEMPTS) {
            // Quá số lần cho phép → block
            blockedUntil.put(email, System.currentTimeMillis() + BLOCK_DURATION_MS);
            return false;
        }
        
        // Tăng số lần thử
        loginAttempts.put(email, attempts + 1);
        return true;
    }

    /**
     * Reset limit sau khi đăng nhập thành công
     * @param email Email đã đăng nhập thành công
     */
    public void resetLimit(String email) {
        loginAttempts.remove(email);
        blockedUntil.remove(email);
    }
}
