package com.bookstore.backend.DTO;

import com.bookstore.backend.model.enums.StatusOrder;

public class UpdateOrderStatusDTO {
    private StatusOrder status;

    public StatusOrder getStatus() {
        return status;
    }

    public void setStatus(StatusOrder status) {
        this.status = status;
    }
}
