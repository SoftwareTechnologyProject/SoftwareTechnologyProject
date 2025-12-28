package com.bookstore.backend.DTO;
import lombok.Data;

import java.util.List;

@Data
public class OrderCreationRequestDTO {
    private CustomerInfoDTO customerInfo;
    private AddressDTO deliveryAddress;
    private String paymentMethod;
    private String couponCode;
    private List<OrderItemDTO> items;
    private Double totalAmount;
    private Double shippingFee;
    private String note;

    @Data
    public static class CustomerInfoDTO {
        private String fullName;
        private String phoneNumber;
    }

    @Data
    public static class AddressDTO {
        private String province;
        private String district;
        private String ward;
        private String details;
        private String fullAddress;
    }

    @Data
    public static class OrderItemDTO {
        private Long bookId;
        private String bookTitle;
        private Double pricePurchased; // Giữ lại cho backward compatibility
        private Integer quantity;
        private Double subTotal;
        private String imageUrl;
    }
}
