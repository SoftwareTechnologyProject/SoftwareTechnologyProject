package com.bookstore.backend.service.impl;

import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.bookstore.backend.DTO.ProfileRequest;
import com.bookstore.backend.DTO.ProfileResponse;
import com.bookstore.backend.model.Account;
import com.bookstore.backend.model.Users;
import com.bookstore.backend.model.enums.UserRole;
import com.bookstore.backend.repository.UserRepository;
import com.bookstore.backend.service.EmailService;
import com.bookstore.backend.service.ProfileService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {

    // KHAI BÁO LOGGER
    private static final Logger logger = LoggerFactory.getLogger(ProfileServiceImpl.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Override
    public ProfileResponse createProfile(ProfileRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }
        
        // 1. Tạo Account:
        Account account = Account.builder()
                // Dùng getFullName() làm username (theo yêu cầu của bạn)
                .username(request.getFullName()) 
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .isAccountVerified(false)
                .verifyOtp(null)
                .verifyOtpExpiredAt(0L)
                .resetPasswordOtp(null)
                .resetOtpExpiredAt(0L)
                .build();

        // 2. Tạo Users: Bổ sung các trường chi tiết
        Users user = Users.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .role(UserRole.USER)
                // ÁNH XẠ CÁC TRƯỜNG KHÁC:
                .phoneNumber(request.getPhoneNumber()) 
                .address(request.getAddress())
                .dateOfBirth(request.getDateOfBirth()) 
                // ------------------------------------
                .account(account)
                .build();

        account.setUser(user);
        userRepository.save(user);

        return convertToProfileResponse(user);
    }

    private ProfileResponse convertToProfileResponse(Users user) {
        return ProfileResponse.builder()
                .userId(user.getId().toString())
                .name(user.getFullName())
                .email(user.getEmail())
                .isAccountVerified(user.getAccount() != null 
                    ? user.getAccount().getIsAccountVerified() 
                    : false)
                .build();
    }

    @Override
    public ProfileResponse getProfile(String email) {
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
        return convertToProfileResponse(user);
    }

    @Override
    public void sendResetOtp(String email) {
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        Account account = user.getAccount();
        if (account == null) {
            throw new RuntimeException("Account not found for user");
        }

        String otp = String.valueOf(ThreadLocalRandom.current().nextInt(100000, 1000000));
        long expiryTime = System.currentTimeMillis() + (15 * 60 * 1000);

        account.setResetPasswordOtp(otp);
        account.setResetOtpExpiredAt(expiryTime);
        userRepository.save(user);

        try {
            emailService.sendResetOtpEmail(email, otp);
        } catch (Exception ex) {
            // SỬA ĐỔI: LOG LỖI CHI TIẾT
            logger.error("LỖI GỬI EMAIL RESET OTP cho {}: {}", email, ex.getMessage(), ex);
            throw new RuntimeException("Unable to send email. Check application logs for SMTP error details.");
        }
    }

    @Override
    public void resetPassword(String email, String otp, String newPassword) {
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        Account account = user.getAccount();
        if (account == null) {
            throw new RuntimeException("Account not found for user");
        }

        if (account.getResetPasswordOtp() == null || !account.getResetPasswordOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }

        if (account.getResetOtpExpiredAt() < System.currentTimeMillis()) {
            throw new RuntimeException("OTP Expired");
        }

        account.setPassword(passwordEncoder.encode(newPassword));
        account.setResetPasswordOtp(null);
        account.setResetOtpExpiredAt(0L);

        userRepository.save(user);
    }

    @Override
    public void sendOtp(String email) {
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        Account account = user.getAccount();
        if (account == null) {
            throw new RuntimeException("Account not found for user");
        }

        if (Boolean.TRUE.equals(account.getIsAccountVerified())) {
            return;
        }

        String otp = String.valueOf(ThreadLocalRandom.current().nextInt(100000, 1000000));
        long expiryTime = System.currentTimeMillis() + (24 * 60 * 60 * 1000);

        account.setVerifyOtp(otp);
        account.setVerifyOtpExpiredAt(expiryTime);

        userRepository.save(user);
        
        try {
            emailService.sendOtpEmail(email, otp);
        } catch (Exception e) {
            // SỬA ĐỔI: LOG LỖI CHI TIẾT
            logger.error("LỖI GỬI EMAIL XÁC THỰC OTP cho {}: {}", email, e.getMessage(), e);
            throw new RuntimeException("Unable to send email. Check application logs for SMTP error details.");
        }
    }

    @Override
    public void sendVerificationEmail(String email) {
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        Account account = user.getAccount();
        if (account == null) {
            throw new RuntimeException("Account not found for user");
        }

        if (Boolean.TRUE.equals(account.getIsAccountVerified())) {
            return;
        }

        String otp = String.valueOf(ThreadLocalRandom.current().nextInt(100000, 1000000));
        long expiryTime = System.currentTimeMillis() + (15 * 60 * 1000); // 15 minutes

        account.setVerifyOtp(otp);
        account.setVerifyOtpExpiredAt(expiryTime);
        userRepository.save(user);

        try {
            emailService.sendVerificationEmail(email, otp);
        } catch (Exception e) {
            logger.error("LỖI GỬI EMAIL XÁC THỰC cho {}: {}", email, e.getMessage(), e);
            throw new RuntimeException("Unable to send email. Check application logs for SMTP error details.");
        }
    }

    @Override
    public void verifyOtp(String email, String otp) {
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        Account account = user.getAccount();
        if (account == null) {
            throw new RuntimeException("Account not found for user");
        }

        if (account.getVerifyOtp() == null || !account.getVerifyOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }

        if (account.getVerifyOtpExpiredAt() < System.currentTimeMillis()) {
            throw new RuntimeException("OTP Expired");
        }

        account.setIsAccountVerified(true);
        account.setVerifyOtp(null);
        account.setVerifyOtpExpiredAt(0L);

        userRepository.save(user);
    }

    @Override
    public String getLoggedInUserId(String email) {
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
        return user.getId().toString();
    }
}