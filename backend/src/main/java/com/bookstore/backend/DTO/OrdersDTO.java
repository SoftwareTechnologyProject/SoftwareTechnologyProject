package com.bookstore.backend.DTO;

import com.bookstore.backend.model.OrderDetails;
import com.bookstore.backend.model.Voucher;
import com.bookstore.backend.model.enums.PaymentType;
import com.bookstore.backend.model.enums.StatusOrder;

import java.util.Date;
import java.util.List;

public class OrdersDTO {
    private int id;
    private String shipping_address;
    private String phone_number;
    private StatusOrder status;
    private PaymentType paymentType;
    private Date orderDate;
    private List<OrderDetails> orderDetails;
    private Voucher voucher;

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getShipping_address() {
        return shipping_address;
    }

    public void setShipping_address(String shipping_address) {
        this.shipping_address = shipping_address;
    }

    public String getPhone_number() {
        return phone_number;
    }

    public void setPhone_number(String phone_number) {
        this.phone_number = phone_number;
    }

    public StatusOrder getStatus() {
        return status;
    }

    public void setStatus(StatusOrder status) {
        this.status = status;
    }

    public PaymentType getPaymentType() {
        return paymentType;
    }

    public void setPaymentType(PaymentType paymentType) {
        this.paymentType = paymentType;
    }

    public Date getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(Date orderDate) {
        this.orderDate = orderDate;
    }

    public List<OrderDetails> getOrderDetails() {
        return orderDetails;
    }

    public void setOrderDetails(List<OrderDetails> orderDetails) {
        this.orderDetails = orderDetails;
    }

    public Voucher getVoucher() {
        return voucher;
    }

    public void setVoucher(Voucher voucher) {
        this.voucher = voucher;
    }
}
