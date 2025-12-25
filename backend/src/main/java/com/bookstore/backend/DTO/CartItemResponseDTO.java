package com.bookstore.backend.DTO;
import java.math.BigDecimal;
import lombok.Data;

@Data
public class CartItemResponseDTO {
    private Long id;              // ID của dòng trong giỏ hàng (để xóa/sửa)
    private Long bookVariantId;   // ID của biến thể sách
    private Long bookId;         // ID của sách (để điều hướng về chi tiết)
    private String bookTitle;     // Tên sách (User cần cái này)
    private String image;         // Link ảnh bìa
    private double price;     // Giá 1 cuốn
    private int quantity;         // Số lượng mua
    private double subTotal;
}
