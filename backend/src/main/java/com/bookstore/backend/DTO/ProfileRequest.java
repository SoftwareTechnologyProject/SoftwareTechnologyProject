package com.bookstore.backend.DTO;

import java.util.Date;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProfileRequest {

    // Đổi tên 'name' thành 'fullName' để nhất quán với Entity Users và logic Backend
    @NotBlank(message = "Full Name should be not empty")
    private String fullName; // TRƯỜNG ĐÃ CẬP NHẬT TÊN

    @Email(message = "Enter valid email address")
    @NotNull(message = "Email should be not empty")
    private String email;

    @Size(min = 6, message = "Password must be atleast 6 characters")
    private String password;
    
    // START: CÁC TRƯỜNG MỚI ĐƯỢC THÊM VÀO
    
    // Trường cho số điện thoại
    @NotBlank(message = "Phone number should be not empty")
    private String phoneNumber; 
    
    // Trường cho địa chỉ
    @NotBlank(message = "Address should be not empty")
    private String address;
    
    // Trường cho ngày sinh (Giả định là String để đơn giản hóa việc gửi từ Frontend)
    // Bạn có thể dùng @NotNull nếu bắt buộc
    private Date dateOfBirth; 
    
    // END: CÁC TRƯỜNG MỚI ĐƯỢC THÊM VÀO
}