package com.bookstore.backend.service.impl;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import com.bookstore.backend.repository.AccountRepository;
import com.bookstore.backend.service.EmailService;
import com.bookstore.backend.service.ProfileService;

import lombok.RequiredArgsConstructor;
import com.bookstore.backend.DTO.ProfileRequest;
import com.bookstore.backend.DTO.ProfileResponse;
import com.bookstore.backend.model.Account;
import com.bookstore.backend.model.Users;
import java.util.concurrent.ThreadLocalRandom;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {

    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    // ✅ 1. Tạo Account mới kèm Users liên kết
    @Override
    public ProfileResponse createProfile(ProfileRequest request) {
        if (accountRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }

        // Tạo user entity liên kết
        Users user = Users.builder()
                .fullName(request.getName())
                .email(request.getEmail())
                .role("USER")
                .build();

        // Tạo account entity
        Account account = Account.builder()
                .email(request.getEmail())
                .username(request.getName())
                .password(passwordEncoder.encode(request.getPassword()))
                .status("ACTIVE")
                .isAccountVerified(false)
                .verifyOtp(null)
                .verifyOtpExpiredAt(0L)
                .resetPasswordOtp(null)
                .resetOtpExpiredAt(0L)
                .user(user) // 🔥 Quan hệ thật
                .build();
        accountRepository.save(account); 

        return convertToProfileResponse(account);
    }

    // ✅ 2. Chuyển Account → DTO
    private ProfileResponse convertToProfileResponse(Account account) {
        return ProfileResponse.builder()
                .name(account.getUsername())
                .email(account.getEmail())
                .userId(account.getUser() != null ? account.getUser().getId().toString() : null)
                .isAccountVerified(account.getIsAccountVerified())
                .build();
    }

    // ✅ 3. Lấy profile
    @Override
    public ProfileResponse getProfile(String email) {
        Account existingUser = accountRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found " + email));
        return convertToProfileResponse(existingUser);
    }

    // ✅ 4. Gửi OTP reset password
    @Override
    public void sendResetOtp(String email) {
        Account existingEntity = accountRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        String otp = String.valueOf(ThreadLocalRandom.current().nextInt(100000, 1000000));
        long expiryTime = System.currentTimeMillis() + (15 * 60 * 1000);

        existingEntity.setResetPasswordOtp(otp);
        existingEntity.setResetOtpExpiredAt(expiryTime);
        accountRepository.save(existingEntity);

        try {
            emailService.sendResetOtpEmail(existingEntity.getEmail(), otp);
        } catch (Exception ex) {
            throw new RuntimeException("Unable to send email");
        }
    }

    // ✅ 5. Đặt lại mật khẩu
    @Override
    public void resetPassword(String email, String otp, String newPassword) {
        Account existingUser = accountRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        if (existingUser.getResetPasswordOtp() == null || !existingUser.getResetPasswordOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }

        if (existingUser.getResetOtpExpiredAt() < System.currentTimeMillis()) {
            throw new RuntimeException("OTP Expired");
        }

        existingUser.setPassword(passwordEncoder.encode(newPassword));
        existingUser.setResetPasswordOtp(null);
        existingUser.setResetOtpExpiredAt(0L);

        accountRepository.save(existingUser);
    }

    // ✅ 6. Gửi OTP xác minh tài khoản
    @Override
    public void sendOtp(String email) {
        Account existingUser = accountRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        if (Boolean.TRUE.equals(existingUser.getIsAccountVerified())) {
            return;
        }

        String otp = String.valueOf(ThreadLocalRandom.current().nextInt(100000, 1000000));
        long expiryTime = System.currentTimeMillis() + (24 * 60 * 60 * 1000);

        existingUser.setVerifyOtp(otp);
        existingUser.setVerifyOtpExpiredAt(expiryTime);

        accountRepository.save(existingUser);
        try {
            emailService.sendOtpEmail(existingUser.getEmail(), otp);
        } catch (Exception e) {
            throw new RuntimeException("Unable to send email");
        }
    }

    // ✅ 7. Xác minh OTP
    @Override
    public void verifyOtp(String email, String otp) {
        Account existingUser = accountRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        if (existingUser.getVerifyOtp() == null || !existingUser.getVerifyOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }

        if (existingUser.getVerifyOtpExpiredAt() < System.currentTimeMillis()) {
            throw new RuntimeException("OTP Expired");
        }

        existingUser.setIsAccountVerified(true);
        existingUser.setVerifyOtp(null);
        existingUser.setVerifyOtpExpiredAt(0L);

        accountRepository.save(existingUser);
    }

    // ✅ 8. Lấy ID user đăng nhập (qua account)
    @Override
    public String getLoggedInUserId(String email) {
        Account existingUser = accountRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
        return existingUser.getUser() != null ? existingUser.getUser().getId().toString() : null;
    }
}
