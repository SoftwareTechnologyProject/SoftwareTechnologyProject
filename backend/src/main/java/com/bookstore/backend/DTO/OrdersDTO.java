package com.bookstore.backend.DTO;

import com.bookstore.backend.model.OrderDetails;
import com.bookstore.backend.model.Voucher;
import com.bookstore.backend.model.enums.PaymentStatus;
import com.bookstore.backend.model.enums.PaymentType;
import com.bookstore.backend.model.enums.StatusOrder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Data
public class OrdersDTO {
    private Long id;
    private Long userId;
    private String shippingAddress;
    private String phoneNumber;
    private PaymentType paymentType;
    private PaymentStatus paymentStatus;
    private StatusOrder status;
    private LocalDateTime orderDate;
    private String voucherCode;
    private List<OrderDetailDTO> orderDetails;
    private BigDecimal totalAmount;

    public OrdersDTO(long id, Long userId, String shippingAddress, String phoneNumber, PaymentType paymentType, StatusOrder status, LocalDateTime orderDate, String voucherCode, List<OrderDetailDTO> orderDetails) {
        this.id = id;
        this.userId = userId;
        this.shippingAddress = shippingAddress;
        this.phoneNumber = phoneNumber;
        this.paymentType = paymentType;
        this.status = status;
        this.orderDate = orderDate;
        this.voucherCode = voucherCode;
        this.orderDetails = orderDetails;
    }

    public OrdersDTO() {
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public PaymentType getPaymentType() {
        return paymentType;
    }

    public void setPaymentType(PaymentType paymentType) {
        this.paymentType = paymentType;
    }

    public StatusOrder getStatus() {
        return status;
    }

    public void setStatus(StatusOrder status) {
        this.status = status;
    }

    public LocalDateTime getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(LocalDateTime orderDate) {
        this.orderDate = orderDate;
    }

    public String getVoucherCode() {
        return voucherCode;
    }

    public void setVoucherCode(String voucherCode) {
        this.voucherCode = voucherCode;
    }

    public List<OrderDetailDTO> getOrderDetails() {
        return orderDetails;
    }

    public void setOrderDetails(List<OrderDetailDTO> orderDetails) {
        this.orderDetails = orderDetails;
    }
}
