package com.bookstore.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "bookimages")
public class BookImages {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bookvariantsid", nullable = false)
    @JsonIgnore
    private BookVariants bookVariant;

    @NotBlank(message = "URL hình ảnh không được trống")
    @Column(name = "image_url", nullable = false)
    private String imageUrl;

    // Constructors
    public BookImages() {
    }

    public BookImages(BookVariants bookVariant, String imageUrl) {
        this.bookVariant = bookVariant;
        this.imageUrl = imageUrl;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public BookVariants getBookVariant() {
        return bookVariant;
    }

    public void setBookVariant(BookVariants bookVariant) {
        this.bookVariant = bookVariant;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    @Override
    public String toString() {
        return "BookImages{" +
                "id=" + id +
                ", imageUrl='" + imageUrl + '\'' +
                '}';
    }
}
