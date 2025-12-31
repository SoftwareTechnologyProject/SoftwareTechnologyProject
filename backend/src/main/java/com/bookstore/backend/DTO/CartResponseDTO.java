package com.bookstore.backend.DTO;
import lombok.Data;
import java.util.List;

@Data
public class CartResponseDTO {
    private Long cartId;
    private List<CartItemResponseDTO> items;
    private double totalCartPrice;
}
