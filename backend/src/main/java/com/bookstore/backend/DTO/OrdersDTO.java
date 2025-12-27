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
    private String userFullName;
    private String shippingAddress;
    private String phoneNumber;
    private PaymentType paymentType;
    private PaymentStatus paymentStatus;
    private StatusOrder status;
    private LocalDateTime orderDate;
    private String voucherCode;
    private List<OrderDetailDTO> orderDetails;
    private BigDecimal totalAmount;


    public OrdersDTO(Long id, Long userId, String userFullName, String shippingAddress, String phoneNumber, PaymentType paymentType, PaymentStatus paymentStatus, StatusOrder status, LocalDateTime orderDate, String voucherCode, List<OrderDetailDTO> orderDetails, BigDecimal totalAmount) {
        this.id = id;
        this.userId = userId;
        this.userFullName = userFullName;
        this.shippingAddress = shippingAddress;
        this.phoneNumber = phoneNumber;
        this.paymentType = paymentType;
        this.paymentStatus = paymentStatus;
        this.status = status;
        this.orderDate = orderDate;
        this.voucherCode = voucherCode;
        this.orderDetails = orderDetails;
        this.totalAmount = totalAmount;
    }

    public OrdersDTO() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserFullName() {
        return userFullName;
    }

    public void setUserFullName(String userFullName) {
        this.userFullName = userFullName;
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

    public PaymentStatus getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(PaymentStatus paymentStatus) {
        this.paymentStatus = paymentStatus;
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

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }
}