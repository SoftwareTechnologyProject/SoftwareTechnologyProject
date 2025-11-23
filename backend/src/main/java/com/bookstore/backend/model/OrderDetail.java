package com.bookstore.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "order_detail")
public class OrderDetail{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "order_id")
    private Orders orders;
    @Column(name = "quantity")
    private int quantity;
    @Column(name = "pricePurchased")
    private double pricePurchased;
    @ManyToOne
    @JoinColumn(name = "voucherCode")
    private Voucher voucher;
    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "bookVariantsId")
    private BookVariants bookVariants;

    public OrderDetail(int id, Orders orders, int quantity, double pricePurchased, Voucher voucher, BookVariants bookVariants) {
        this.id = id;
        this.orders = orders;
        this.quantity = quantity;
        this.pricePurchased = pricePurchased;
        this.voucher = voucher;
        this.bookVariants = bookVariants;
    }

    public OrderDetail() {
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public Orders getOrders() {
        return orders;
    }

    public void setOrders(Orders orders) {
        this.orders = orders;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public double getPricePurchased() {
        return pricePurchased;
    }

    public void setPricePurchased(double pricePurchased) {
        this.pricePurchased = pricePurchased;
    }

    public Voucher getVoucher() {
        return voucher;
    }

    public void setVoucher(Voucher voucher) {
        this.voucher = voucher;
    }

    public BookVariants getBookVariants() {
        return bookVariants;
    }

    public void setBookVariants(BookVariants bookVariants) {
        this.bookVariants = bookVariants;
    }

}