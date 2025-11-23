package com.bookstore.backend.model;

import com.bookstore.backend.model.enums.BookStatus;
import jakarta.persistence.*;

import java.util.List;


@Entity
@Table(name = "book_variants")
public class BookVariants {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    @Column(name = "price")
    private double price;
    @Column(name = "sold")
    private int sold;
    @Enumerated(EnumType.STRING)
//    @Column(columnDefinition = "status")
    @Column(name = "status")
    private BookStatus status;
    @ManyToOne
    @JoinColumn(name = "bookId")
    private Book book;
    @OneToMany(mappedBy = "bookVariants")
    List<OrderDetail> orderDetailList;

    public BookVariants(int id, double price, int sold, BookStatus status, Book book, List<OrderDetail> orderDetailList) {
        this.id = id;
        this.price = price;
        this.sold = sold;
        this.status = status;
        this.book = book;
        this.orderDetailList = orderDetailList;
    }

    public BookVariants() {
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public int getSold() {
        return sold;
    }

    public void setSold(int sold) {
        this.sold = sold;
    }

    public BookStatus getStatus() {
        return status;
    }

    public void setStatus(BookStatus status) {
        this.status = status;
    }

    public Book getBook() {
        return book;
    }

    public void setBook(Book book) {
        this.book = book;
    }

    public List<OrderDetail> getOrderDetailList() {
        return orderDetailList;
    }

    public void setOrderDetailList(List<OrderDetail> orderDetailList) {
        this.orderDetailList = orderDetailList;
    }
}
