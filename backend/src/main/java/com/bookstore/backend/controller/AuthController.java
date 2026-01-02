package com.bookstore.backend.controller;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.annotation.CurrentSecurityContext;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.bookstore.backend.DTO.AuthRequest;
import com.bookstore.backend.DTO.AuthResponse;
import com.bookstore.backend.DTO.ResetPasswordRequest;
import com.bookstore.backend.model.Account;
import com.bookstore.backend.model.Users;
import com.bookstore.backend.repository.UserRepository;
import com.bookstore.backend.service.AppUserDetailsService;
import com.bookstore.backend.service.ProfileService;
import com.bookstore.backend.service.RateLimitService;
import com.bookstore.backend.utils.JwtUtils;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final AppUserDetailsService appUserDetailsService;
    private final JwtUtils jwtUtil;
    private final ProfileService profileService;
    private final UserRepository userRepository;
    private final RateLimitService rateLimitService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        System.out.println("Login attempt - Email: " + request.getEmail());
        
        // Kiểm tra giới hạn số lần đăng nhập
        if (!rateLimitService.tryAcquire(request.getEmail())) {
            System.out.println("Rate limit exceeded for: " + request.getEmail());
            Map<String, Object> error = new HashMap<>();
            error.put("error", true);
            error.put("message", "Too many login attempts. Please try again after 15 minutes.");
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(error);
        }
        
        try {
            authenticate(request.getEmail(), request.getPassword());

            final UserDetails userDetails = appUserDetailsService.loadUserByUsername(request.getEmail());
            System.out.println("UserDetails loaded: " + userDetails.getUsername());
            final String jwtToken = jwtUtil.generateToken(userDetails);

            // Reset giới hạn sau khi đăng nhập thành công
            rateLimitService.resetLimit(request.getEmail());

            // Tạo cookie JWT
            ResponseCookie cookie = ResponseCookie.from("jwt", jwtToken)
                    .httpOnly(true)
                    .secure(true)
                    .path("/")
                    .maxAge(Duration.ofDays(3))
                    .sameSite("None")
                    .build();

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, cookie.toString())
                    .body(new AuthResponse(request.getEmail(), jwtToken, userDetails.getAuthorities()));

        } catch (BadCredentialsException ex) {
            System.out.println("BadCredentialsException: " + ex.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("error", true);
            error.put("message", "Email or Password is incorrect");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);

        } catch (DisabledException ex) {
            System.out.println("DisabledException: " + ex.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("error", true);
            error.put("message", "Account is disabled");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);

        } catch (Exception ex) {
            System.out.println("Exception: " + ex.getClass().getName() + " - " + ex.getMessage());
            ex.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("error", true);
            error.put("message", "Authentication failed");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    private void authenticate(String email, String password) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, password));
    }

    // Kiểm tra trạng thái đăng nhập
    @GetMapping("/is-authenticated")
    public ResponseEntity<Boolean> isAuthenticated(@CurrentSecurityContext(expression = "authentication?.name") String email) {
        return ResponseEntity.ok(email != null);
    }

    // Gửi OTP đặt lại mật khẩu
    @PostMapping("/send-reset-otp")
    public void sendResetOtp(@RequestParam String email) {
        try{
            profileService.sendResetOtp(email);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    // Đặt lại mật khẩu bằng OTP
    @PostMapping("/reset-password")
    public void resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            profileService.resetPassword(request.getEmail(), request.getOtp(), request.getNewPassword());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    // Gửi OTP xác thực email
    @PostMapping("/send-otp") 
    public void sendVerifyOtp(@CurrentSecurityContext(expression= "authentication?.name") String email) {
        try{
            profileService.sendOtp(email);
        } catch (Exception e){
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }
    
    // Xác thực email bằng OTP
    @PostMapping("/verify-otp")
    public void verifyEmail(@RequestBody Map<String, Object> request, @CurrentSecurityContext(expression = "authentication?.name") String email) {
        if(request.get("otp").toString() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing details");
        }        
        try{
            profileService.verifyOtp(email, request.get("otp").toString());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    // Xác thực email bằng token
    @GetMapping("/verify-email")
    public ResponseEntity<String> verifyEmailByToken(@RequestParam String token) {
        try {
            Users user = userRepository.findByVerificationToken(token)
                    .orElseThrow(() -> new RuntimeException("Invalid token"));
            Account account = user.getAccount();
            if (account != null) {
                account.setIsAccountVerified(true);
                account.setVerificationToken(null);
                userRepository.save(user);
            }
            return ResponseEntity.ok("Email verified successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Verification failed: " + e.getMessage());
        }
    }

    // Gửi lại OTP đăng ký (không tạo user mới)
    @PostMapping("/resend-registration-otp")
    public ResponseEntity<String> resendRegistrationOtp(@RequestBody Map<String, Object> request) {
        String email = (String) request.get("email");
        if (email == null) {
            return ResponseEntity.badRequest().body("Email is required");
        }
        try {
            profileService.sendVerificationEmail(email);
            return ResponseEntity.ok("OTP has been resent to your email");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to send OTP: " + e.getMessage());
        }
    }

    // Xác thực tài khoản bằng OTP khi đăng ký
    @PostMapping("/verify-registration-otp")
    public ResponseEntity<String> verifyRegistrationOtp(@RequestBody Map<String, Object> request) {
        String email = (String) request.get("email");
        String otp = (String) request.get("otp");
        if (email == null || otp == null) {
            return ResponseEntity.badRequest().body("Email and OTP are required");
        }
        try {
            Users user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Account account = user.getAccount();
            if (account == null) {
                return ResponseEntity.badRequest().body("Account not found");
            }
            if (Boolean.TRUE.equals(account.getIsAccountVerified())) {
                return ResponseEntity.ok("Account already verified");
            }
            if (account.getVerifyOtp() == null || !account.getVerifyOtp().equals(otp)) {
                return ResponseEntity.badRequest().body("Invalid OTP");
            }
            if (account.getVerifyOtpExpiredAt() < System.currentTimeMillis()) {
                return ResponseEntity.badRequest().body("OTP expired");
            }
            account.setIsAccountVerified(true);
            account.setVerifyOtp(null);
            account.setVerifyOtpExpiredAt(0L);
            userRepository.save(user);
            return ResponseEntity.ok("Account verified successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Verification failed: " + e.getMessage());
        }
    }
}
