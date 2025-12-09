package com.bookstore.backend.model.enums;

import java.util.EnumSet;
import java.util.Set;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum Permission {
    USER_READ("user:read", "View user information"),
    USER_CREATE("user:create", "Create new user"),
    USER_UPDATE("user:update", "Update user information"),
    USER_DELETE("user:delete", "Delete user"),
    
    PRODUCT_READ("product:read", "View products"),
    PRODUCT_CREATE("product:create", "Create new product"),
    PRODUCT_UPDATE("product:update", "Update product"),
    PRODUCT_DELETE("product:delete", "Delete product"),
    
    ORDER_READ("order:read", "View orders"),
    ORDER_CREATE("order:create", "Create order"),
    ORDER_UPDATE("order:update", "Update order status"),
    ORDER_DELETE("order:delete", "Delete order"),
    ORDER_MANAGE_ALL("order:manage_all", "Manage all orders in system"),
    
    VOUCHER_READ("voucher:read", "View vouchers"),
    VOUCHER_CREATE("voucher:create", "Create voucher"),
    VOUCHER_UPDATE("voucher:update", "Update voucher"),
    VOUCHER_DELETE("voucher:delete", "Delete voucher"),
    
    REPORT_VIEW("report:view", "View reports and analytics"),
    REPORT_EXPORT("report:export", "Export reports");

    private final String permission;
    private final String description;

    public static Set<Permission> getPermissionsByRole(UserRole role) {
        switch (role) {
            case ADMIN:
                return EnumSet.allOf(Permission.class);
            case STAFF:
                return EnumSet.of(
                    USER_READ,
                    PRODUCT_READ,
                    ORDER_READ, ORDER_UPDATE, ORDER_MANAGE_ALL,
                    VOUCHER_READ, VOUCHER_CREATE,
                    REPORT_VIEW
                );
            case USER:
            default:
                return EnumSet.of(
                    PRODUCT_READ,
                    ORDER_READ, ORDER_CREATE,
                    VOUCHER_READ
                );
        }
    }
}