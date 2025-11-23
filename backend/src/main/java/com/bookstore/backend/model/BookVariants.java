package com.bookstore.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "bookvariants")
public class BookVariants {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bookid", nullable = false)
    @JsonIgnore
    private Book book;

    @NotNull(message = "Giá không được trống")
    @Min(value = 0, message = "Giá phải lớn hơn hoặc bằng 0")
    @Column(name = "price", nullable = false)
    private Double price;

    @Min(value = 0, message = "Số lượng phải lớn hơn hoặc bằng 0")
    @Column(name = "quantity")
    private Integer quantity;

    @Min(value = 0, message = "Số lượng đã bán phải lớn hơn hoặc bằng 0")
    @Column(name = "sold")
    private Integer sold;

    @Enumerated(EnumType.STRING)
    @NotNull(message = "Trạng thái không được trống")
    @Column(name = "status", nullable = false)
    private BookStatus status;

    @OneToMany(mappedBy = "bookVariant", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BookImages> images = new ArrayList<>();

    // Enum for BookStatus
    public enum BookStatus {
        AVAILABLE,
        OUT_OF_STOCK
    }

    // Constructors
    public BookVariants() {
    }

    public BookVariants(Book book, Double price, Integer quantity, Integer sold, BookStatus status) {
        this.book = book;
        this.price = price;
        this.quantity = quantity;
        this.sold = sold;
        this.status = status;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Book getBook() {
        return book;
    }

    public void setBook(Book book) {
        this.book = book;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Integer getSold() {
        return sold;
    }

    public void setSold(Integer sold) {
        this.sold = sold;
    }

    public BookStatus getStatus() {
        return status;
    }

    public void setStatus(BookStatus status) {
        this.status = status;
    }

    public List<BookImages> getImages() {
        return images;
    }

    public void setImages(List<BookImages> images) {
        this.images = images;
    }

    @Override
    public String toString() {
        return "BookVariants{" +
                "id=" + id +
                ", price=" + price +
                ", quantity=" + quantity +
                ", sold=" + sold +
                ", status=" + status +
                '}';
    }
}
