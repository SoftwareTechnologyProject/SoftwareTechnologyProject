package com.bookstore.backend.DTO;
import lombok.Data;

@Data
public class UserResponseDTO {
    private Long id;
    private String fullName;
    private String phoneNumber;
    private String address;
}
