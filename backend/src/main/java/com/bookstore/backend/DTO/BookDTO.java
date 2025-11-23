package com.bookstore.backend.dto;

import jakarta.validation.constraints.*;
import java.util.Set;
import java.util.List;

public class BookDTO {
    private Long id;

    @NotBlank(message = "Title không được trống")
    private String title;

    private String description;

    private Integer publisherYear;

    // Publisher info
    private Long publisherId;
    private String publisherName;

    // Authors (có thể nhiều tác giả)
    private Set<Long> authorIds;
    private Set<String> authorNames;

    // Categories (có thể nhiều thể loại)
    private Set<Long> categoryIds;
    private Set<String> categoryNames;

    // Variants (nhiều phiên bản sách với giá khác nhau)
    private List<BookVariantDTO> variants;

    // Constructors
    public BookDTO() {
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getPublisherYear() {
        return publisherYear;
    }

    public void setPublisherYear(Integer publisherYear) {
        this.publisherYear = publisherYear;
    }

    public Long getPublisherId() {
        return publisherId;
    }

    public void setPublisherId(Long publisherId) {
        this.publisherId = publisherId;
    }

    public String getPublisherName() {
        return publisherName;
    }

    public void setPublisherName(String publisherName) {
        this.publisherName = publisherName;
    }

    public Set<Long> getAuthorIds() {
        return authorIds;
    }

    public void setAuthorIds(Set<Long> authorIds) {
        this.authorIds = authorIds;
    }

    public Set<String> getAuthorNames() {
        return authorNames;
    }

    public void setAuthorNames(Set<String> authorNames) {
        this.authorNames = authorNames;
    }

    public Set<Long> getCategoryIds() {
        return categoryIds;
    }

    public void setCategoryIds(Set<Long> categoryIds) {
        this.categoryIds = categoryIds;
    }

    public Set<String> getCategoryNames() {
        return categoryNames;
    }

    public void setCategoryNames(Set<String> categoryNames) {
        this.categoryNames = categoryNames;
    }

    public List<BookVariantDTO> getVariants() {
        return variants;
    }

    public void setVariants(List<BookVariantDTO> variants) {
        this.variants = variants;
    }

    // Inner class for BookVariant
    public static class BookVariantDTO {
        private Long id;

        @NotNull(message = "Giá không được trống")
        @Min(value = 0, message = "Giá phải lớn hơn hoặc bằng 0")
        private Double price;

        @Min(value = 0, message = "Số lượng phải lớn hơn hoặc bằng 0")
        private Integer quantity;

        @Min(value = 0, message = "Số lượng đã bán phải lớn hơn hoặc bằng 0")
        private Integer sold;

        @NotNull(message = "Trạng thái không được trống")
        private String status; // "AVAILABLE" or "OUT_OF_STOCK"

        private List<String> imageUrls;

        // Constructors
        public BookVariantDTO() {
        }

        // Getters and Setters
        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
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

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public List<String> getImageUrls() {
            return imageUrls;
        }

        public void setImageUrls(List<String> imageUrls) {
            this.imageUrls = imageUrls;
        }
    }
}
