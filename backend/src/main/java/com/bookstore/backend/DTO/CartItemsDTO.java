package com.bookstore.backend.DTO;

import lombok.Data;

@Data
public class CartItemsDTO {
    private Long bookVariantId;
    private int quantity;
}