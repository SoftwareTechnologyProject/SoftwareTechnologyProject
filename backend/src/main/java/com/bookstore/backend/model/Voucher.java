package com.bookstore.backend.model;

import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "voucher")
public class Voucher {
    @Id
    private String code;
    @Column(name = "name")
    private String name;
    @OneToMany(mappedBy = "voucher")
    List<Orders> ordersList;

    public Voucher(String code, String name, List<Orders> ordersList) {
        this.code = code;
        this.name = name;
        this.ordersList = ordersList;
    }

    public Voucher() {
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<Orders> getOrdersList() {
        return ordersList;
    }

    public void setOrdersList(List<Orders> ordersList) {
        this.ordersList = ordersList;
    }
}
