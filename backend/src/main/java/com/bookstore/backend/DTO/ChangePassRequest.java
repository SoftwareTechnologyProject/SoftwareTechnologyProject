package com.bookstore.backend.DTO;

import lombok.Data;

@Data
public class ChangePassRequest {
    private String currentPass;
    private String newPass;
    private String confirmPass;
}
