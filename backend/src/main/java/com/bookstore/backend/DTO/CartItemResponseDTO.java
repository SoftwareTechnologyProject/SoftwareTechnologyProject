package com.bookstore.backend.DTO;
import java.math.BigDecimal;
import lombok.Data;

@Data
public class CartItemResponseDTO {
    private Long id;
    private Long bookVariantId;
    private Long bookId;
    private String bookTitle;
    private String image;
    private double price;
    private int quantity;
    private double subTotal;
}
