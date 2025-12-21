package com.bookstore.backend.DTO;

import com.bookstore.backend.model.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserDTO {
    private String fullName;
    private String email;
    private String phoneNumber;
    private String address;
    private Date dateOfBirth;
}
