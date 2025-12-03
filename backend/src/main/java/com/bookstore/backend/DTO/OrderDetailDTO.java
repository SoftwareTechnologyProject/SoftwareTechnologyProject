package com.bookstore.backend.DTO;

public class OrderDetailDTO {

    private Long id;                // id của order_detail
    private Long bookVariantId;     // id biến thể sách
    private String bookTitle;       // tên sách (từ bookVariant.book.title)
    private Integer quantity;
    private Double pricePurchased;
    private Double totalPrice;      // quantity * pricePurchased

    public OrderDetailDTO() {}

    public OrderDetailDTO(Long id, Long bookVariantId, String bookTitle,
                                  Integer quantity, Double pricePurchased) {
        this.id = id;
        this.bookVariantId = bookVariantId;
        this.bookTitle = bookTitle;
        this.quantity = quantity;
        this.pricePurchased = pricePurchased;
        this.totalPrice = quantity * pricePurchased;
    }

    // ------------ GETTER - SETTER ---------------
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getBookVariantId() { return bookVariantId; }
    public void setBookVariantId(Long bookVariantId) { this.bookVariantId = bookVariantId; }

    public String getBookTitle() { return bookTitle; }
    public void setBookTitle(String bookTitle) { this.bookTitle = bookTitle; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public Double getPricePurchased() { return pricePurchased; }
    public void setPricePurchased(Double pricePurchased) { this.pricePurchased = pricePurchased; }

    public Double getTotalPrice() { return totalPrice; }
    public void setTotalPrice(Double totalPrice) { this.totalPrice = totalPrice; }
}
