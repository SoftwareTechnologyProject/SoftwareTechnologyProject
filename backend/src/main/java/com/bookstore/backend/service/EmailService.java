
package com.bookstore.backend.service;

import com.bookstore.backend.DTO.OrderDetailDTO;
import com.bookstore.backend.DTO.OrdersDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import java.text.DecimalFormat;
import java.time.format.DateTimeFormatter; 

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

    public void sendVerificationEmail(String toEmail, String otp) throws MailException {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Account Verification OTP");
        message.setText("Your OTP for verifying your account is " + otp + ". Use this OTP to confirm your registration.");
        mailSender.send(message);
    }

    public void sendOrderConfirmationEmail(String toEmail, String customerName, OrdersDTO order) throws MailException {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Xác nhận đơn hàng #" + order.getId());
        
        DecimalFormat formatter = new DecimalFormat("#,###");
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        
        // Tạo danh sách chi tiết sản phẩm
        StringBuilder itemsList = new StringBuilder();
        for (OrderDetailDTO detail : order.getOrderDetails()) {
            String itemTotal = formatter.format(detail.getTotalPrice());
            itemsList.append(String.format(
                "  + %s\n" +
                "    Số lượng: %d\n" +
                "    Đơn giá: %s VNĐ\n" +
                "    Thành tiền: %s VNĐ\n\n",
                detail.getBookTitle(),
                detail.getQuantity(),
                formatter.format(detail.getPricePurchased()),
                itemTotal
            ));
        }
        
        String paymentMethodText = order.getPaymentType() != null 
            ? (order.getPaymentType().name().equals("COD") ? "Thanh toán khi nhận hàng (COD)" : "Thanh toán qua VNPay")
            : "Chưa xác định";
        
        String paymentStatusText = order.getPaymentStatus() != null
            ? (order.getPaymentStatus().name().equals("PAID") ? "Đã thanh toán" : 
               order.getPaymentStatus().name().equals("PENDING") ? "Chưa thanh toán" : "Thất bại")
            : "Chưa xác định";
            
        String orderStatusText = order.getStatus() != null
            ? getStatusText(order.getStatus().name())
            : "Chưa xác định";
        
        String emailContent = String.format(
            "Xin chào %s,\n\n" +
            "Cảm ơn bạn đã đặt hàng tại cửa hàng của chúng tôi!\n\n" +
            "═══════════════════════════════════════════════\n" +
            "THÔNG TIN ĐơN HÀNG\n" +
            "═══════════════════════════════════════════════\n\n" +
            "Mã đơn hàng: #%d\n" +
            "Ngày đặt hàng: %s\n" +
            "Trạng thái đơn hàng: %s\n" +
            "Trạng thái thanh toán: %s\n\n" +
            "─────────────────────────────────────────────\n" +
            "THÔNG TIN GIAO HÀNG\n" +
            "─────────────────────────────────────────────\n\n" +
            "Địa chỉ: %s\n" +
            "Số điện thoại: %s\n\n" +
            "─────────────────────────────────────────────\n" +
            "CHI TIẾT SẢN PHẨM\n" +
            "─────────────────────────────────────────────\n\n" +
            "%s" +
            "─────────────────────────────────────────────\n" +
            "THANH TOÁN\n" +
            "─────────────────────────────────────────────\n\n" +
            "Phương thức thanh toán: %s\n" +
            "%s" +
            "\n" +
            "TỔNG CỘNG: %s VNĐ\n\n" +
            "═══════════════════════════════════════════════\n\n" +
            "Chúng tôi sẽ xử lý đơn hàng của bạn trong thời gian sớm nhất.\n" +
            "Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi.\n\n" +
            "Trân trọng,\n" +
            "Đội ngũ hỗ trợ khách hàng",
            customerName,
            order.getId(),
            order.getOrderDate() != null ? order.getOrderDate().format(dateFormatter) : "N/A",
            orderStatusText,
            paymentStatusText,
            order.getShippingAddress() != null ? order.getShippingAddress() : "Chưa cập nhật",
            order.getPhoneNumber() != null ? order.getPhoneNumber() : "Chưa cập nhật",
            itemsList.toString(),
            paymentMethodText,
            order.getVoucherCode() != null ? "Mã giảm giá: " + order.getVoucherCode() + "\n" : "",
            formatter.format(order.getTotalAmount())
        );
        
        message.setText(emailContent);
        mailSender.send(message);
    }
    
    private String getStatusText(String status) {
        switch (status) {
            case "PENDING": return "Chờ xử lý";
            case "CONFIRMED": return "Đã xác nhận";
            case "DELIVERY": return "Đang giao hàng";
            case "RESTORE": return "Hoàn trả";
            case "COMPLETED": return "Hoàn thành";
            case "CANCELLED": return "Đã hủy";
            default: return status;
        }
    }

}