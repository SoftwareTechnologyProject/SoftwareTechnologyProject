package com.bookstore.backend.DTO;

public class OrderDetailDTO {
    private long bookVariantsId;
    private int quantity;
    private double pricePurchased;

    public long getBookVariantsId() {
        return bookVariantsId;
    }

    public void setBookVariantsId(long bookVariantsId) {
        this.bookVariantsId = bookVariantsId;
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
}
