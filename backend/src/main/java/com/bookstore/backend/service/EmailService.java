
package com.bookstore.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor; // <<< THÊM IMPORT NÀY

@Service
@RequiredArgsConstructor
public class EmailService {
    
    private final JavaMailSender mailSender;

    @Value("${spring.mail.properties.mail.smtp.from}")
    private String fromEmail;
    
    // Áp dụng khối try-catch để NÉM LẠI lỗi MAIL THUẦN TÚY
    public void sendWelcomEmail(String toEmail, String name) throws MailException { // THÊM throws MailException
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Welcome to Our Platform");
        message.setText("Hello "+name+", \n\n Thanks for registering with us!");
        mailSender.send(message); // mailSender.send() tự ném ra MailException nếu thất bại
    }

    public void sendResetOtpEmail(String toEmail, String otp) throws MailException { // THÊM throws MailException
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Password Reset OTP");
        message.setText("Your OTP for resetting your password is "+otp+". Use this OTP to proceed with resetting your password. ");
        mailSender.send(message);
    }

    public void sendOtpEmail(String toEmail, String otp) throws MailException { // THÊM throws MailException
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Account Verifycation OTP");
        message.setText("Your OTP is"+otp+". Verify your account using this OTP.");
        mailSender.send(message);
    }

}