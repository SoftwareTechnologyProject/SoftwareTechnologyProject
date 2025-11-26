package com.bookstore.backend.DTO;

import lombok.Data;

@Data
public class AddToCartRequest {
    private Long bookVariantId;
    private int quantity;
}