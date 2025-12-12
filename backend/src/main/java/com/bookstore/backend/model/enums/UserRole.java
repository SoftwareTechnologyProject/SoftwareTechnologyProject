package com.bookstore.backend.model.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum UserRole {
    ADMIN("ADMIN", "Administrator - Full access to system"),
    STAFF("STAFF", "Staff - Manage orders and customer support"),
    USER("USER", "Regular user - Browse and purchase books");

    private final String code;
    private final String description;

    // Kiểm tra role có quyền admin không
    public boolean isAdmin() {
        return this == ADMIN;
    }

    // Kiểm tra có quyền staff không (Admin + Staff)
    public boolean isStaff() {
        return this == ADMIN || this == STAFF;
    }

    // Convert từ String sang Enum
    public static UserRole fromString(String role) {
        if (role == null) {
            return USER; // Default
        }
        try {
            return UserRole.valueOf(role.toUpperCase());
        } catch (IllegalArgumentException e) {
            return USER; 
        }
    }
}