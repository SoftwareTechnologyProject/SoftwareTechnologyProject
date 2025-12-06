package com.bookstore.backend.controller;

import org.springframework.web.bind.annotation.RequestBody;
// import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.CurrentSecurityContext;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.ResponseStatus;

import com.bookstore.backend.DTO.ProfileRequest;
import com.bookstore.backend.DTO.ProfileResponse;
import com.bookstore.backend.service.ProfileService;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.GetMapping;

import com.bookstore.backend.service.EmailService;

@RestController
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;
    private final EmailService emailService;

    //Xử lý các yêu cầu đăng ký
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public ProfileResponse register(@Valid @RequestBody ProfileRequest request){
        ProfileResponse response = profileService.createProfile(request);
        try {
            emailService.sendWelcomEmail(response.getEmail(), response.getName());
        } catch (Exception e) {
            System.err.println("LỖI GỬI EMAIL cho " + response.getEmail() + ": " + e.getMessage());
        }
        return response;
    }

    //Truy xuất thông tin hồ sơ của người dùng hiện đang đăng nhập
    @GetMapping("/profile")
    public ProfileResponse getProfile(@CurrentSecurityContext(expression= "authentication?.name") String email) {
        return profileService.getProfile(email);
    }
}
