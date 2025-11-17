package com.bookstore.backend.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "books")
public class Book {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    private String author;
    
    private String publisher;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "current_price")
    private Integer currentPrice;
    
    @Column(name = "original_price")
    private Integer originalPrice;
    
    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;
    
    @Column(precision = 3, scale = 1)
    private BigDecimal rating;
    
    private String pages;
    
    private String isbn;
    
    private String category;
    
    @Column(name = "publication_year")
    private Integer publicationYear;
    
    private String language;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Constructors
    public Book() {}
    
    public Book(String title, String author, String publisher, String description, 
                Integer currentPrice, Integer originalPrice, String imageUrl, 
                BigDecimal rating, String pages, String isbn, String category, 
                Integer publicationYear, String language) {
        this.title = title;
        this.author = author;
        this.publisher = publisher;
        this.description = description;
        this.currentPrice = currentPrice;
        this.originalPrice = originalPrice;
        this.imageUrl = imageUrl;
        this.rating = rating;
        this.pages = pages;
        this.isbn = isbn;
        this.category = category;
        this.publicationYear = publicationYear;
        this.language = language;
    }
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }
    
    public String getPublisher() { return publisher; }
    public void setPublisher(String publisher) { this.publisher = publisher; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public Integer getCurrentPrice() { return currentPrice; }
    public void setCurrentPrice(Integer currentPrice) { this.currentPrice = currentPrice; }
    
    public Integer getOriginalPrice() { return originalPrice; }
    public void setOriginalPrice(Integer originalPrice) { this.originalPrice = originalPrice; }
    
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    
    public BigDecimal getRating() { return rating; }
    public void setRating(BigDecimal rating) { this.rating = rating; }
    
    public String getPages() { return pages; }
    public void setPages(String pages) { this.pages = pages; }
    
    public String getIsbn() { return isbn; }
    public void setIsbn(String isbn) { this.isbn = isbn; }
    
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    
    public Integer getPublicationYear() { return publicationYear; }
    public void setPublicationYear(Integer publicationYear) { this.publicationYear = publicationYear; }
    
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    @Override
    public String toString() {
        return "Book{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", author='" + author + '\'' +
                ", currentPrice=" + currentPrice +
                ", rating=" + rating +
                '}';
    }
}