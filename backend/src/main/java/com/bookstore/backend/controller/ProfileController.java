// File: com.bookstore.backend.controller.ProfileController.java

package com.bookstore.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.CurrentSecurityContext;
import org.springframework.web.bind.annotation.GetMapping; // Cần import để xử lý lỗi tốt hơn
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.bookstore.backend.DTO.ProfileRequest;
import com.bookstore.backend.DTO.ProfileResponse;
import com.bookstore.backend.service.ProfileService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

// KHÔNG CẦN DÙNG EmailService TRỰC TIẾP NỮA, vì logic gửi mail được chuyển vào ProfileService.sendOtp()
// import com.bookstore.backend.service.EmailService; 

@RestController
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;
    // Đã loại bỏ private final EmailService emailService; vì ProfileService sẽ xử lý việc gửi email

    // Xử lý các yêu cầu đăng ký
    // Endpoint này sẽ tạo user và ngay lập tức gửi OTP xác thực.
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public ProfileResponse register(@Valid @RequestBody ProfileRequest request){
        ProfileResponse response = profileService.createProfile(request);
        
        // 🚨 THAY ĐỔI LỚN: GỌI HÀM GỬI OTP XÁC THỰC TÀI KHOẢN
        try {
            // Hàm này (trong ProfileServiceImpl) sẽ tạo OTP, lưu vào DB và gọi EmailService để gửi mail
            profileService.sendOtp(response.getEmail()); 
            
        } catch (Exception e) {
            // QUAN TRỌNG: Cần thông báo cho người dùng biết email có vấn đề (hoặc log thật chi tiết)
            // Tuy nhiên, không ném lỗi ra ngoài để user vẫn được tạo thành công
            System.err.println("LỖI GỬI EMAIL OTP cho " + response.getEmail() + ": " + e.getMessage());
            // Bạn có thể cân nhắc throw ResponseStatusException ở đây nếu việc gửi OTP là bắt buộc 
            // và không muốn người dùng tiếp tục nếu không có mail.
        }
        return response;
    }

    // Truy xuất thông tin hồ sơ của người dùng hiện đang đăng nhập
    @GetMapping("/profile")
    public ProfileResponse getProfile(@CurrentSecurityContext(expression= "authentication?.name") String email) {
        return profileService.getProfile(email);
    }
}