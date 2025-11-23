package com.bookstore.backend.model;

import com.bookstore.backend.model.enums.PaymentType;
import com.bookstore.backend.model.enums.StatusOrder;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "orders")
public class Orders {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "shipping_address")
    private String shipping_address;

    @Column(name = "phone_number")
    private String phone_number;

    @Enumerated(EnumType.STRING)
//    @Column(columnDefinition = "StatusOrder")
    @Column(name = "status")
    private StatusOrder status;

    @Enumerated(EnumType.STRING)
//    @Column(columnDefinition = "PaymentType")
    @Column(name = "paymentType")
    private PaymentType paymentType;

    @Column(name = "orderDate")
    private Date orderDate;
    @OneToMany(mappedBy = "orders", cascade = CascadeType.ALL)
    private List<OrderDetail> orderDetails;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "userId")
    private User users;

    @ManyToOne
    @JoinColumn(name = "voucherCode")
    private Voucher voucher;


    public Orders(int id, String shipping_address, String phone_number, StatusOrder status, PaymentType paymentType, Date orderDate, List<OrderDetail> orderDetails, User users, Voucher voucher) {
        this.id = id;
        this.shipping_address = shipping_address;
        this.phone_number = phone_number;
        this.status = status;
        this.paymentType = paymentType;
        this.orderDate = orderDate;
        this.orderDetails = orderDetails;
        this.users = users;
        this.voucher = voucher;
    }

    public Orders() {
    }

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

    public List<OrderDetail> getOrderDetails() {
        return orderDetails;
    }

    public void setOrderDetails(List<OrderDetail> orderDetails) {
        this.orderDetails = orderDetails;
    }

    public User getUser() {
        return users;
    }

    public void setUser(User users) {
        this.users = users;
    }

    public Voucher getVoucher() {
        return voucher;
    }

    public void setVoucher(Voucher voucher) {
        this.voucher = voucher;
    }

}
