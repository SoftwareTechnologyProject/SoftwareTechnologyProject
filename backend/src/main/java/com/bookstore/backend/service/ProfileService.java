package com.bookstore.backend.service;

import com.bookstore.backend.DTO.ProfileRequest;
import com.bookstore.backend.DTO.ProfileResponse;

public interface  ProfileService {
    ProfileResponse createProfile(ProfileRequest request);
    ProfileResponse getProfile(String email);
    void sendResetOtp(String email);
    void resetPassword(String email, String otp, String newPassword);

    void sendOtp(String email);
    void sendVerificationEmail(String email);

    void verifyOtp(String email, String otp);
    String getLoggedInUserId(String Email);
}
