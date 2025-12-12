package com.bookstore.backend.service;

import java.util.Set;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.bookstore.backend.model.enums.Permission;
import com.bookstore.backend.model.enums.UserRole;

@Service
public class AuthorizationService {

    public String getCurrentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return null;
        }
        return auth.getName();
    }

    public UserRole getCurrentUserRole() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return UserRole.USER;
        }
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(role -> role.startsWith("ROLE_"))
                .map(role -> role.replace("ROLE_", ""))
                .map(UserRole::fromString)
                .findFirst()
                .orElse(UserRole.USER);
    }

    public boolean hasRole(UserRole role) {
        return getCurrentUserRole() == role;
    }

    public boolean isAdmin() {
        return getCurrentUserRole().isAdmin();
    }

    public boolean isStaff() {
        return getCurrentUserRole().isStaff();
    }

    public boolean hasPermission(Permission permission) {
        UserRole role = getCurrentUserRole();
        Set<Permission> permissions = Permission.getPermissionsByRole(role);
        return permissions.contains(permission);
    }

    public boolean hasAnyPermission(Permission... permissions) {
        for (Permission permission : permissions) {
            if (hasPermission(permission)) {
                return true;
            }
        }
        return false;
    }

    public boolean hasAllPermissions(Permission... permissions) {
        for (Permission permission : permissions) {
            if (!hasPermission(permission)) {
                return false;
            }
        }
        return true;
    }

    public boolean canAccessUserResource(String targetEmail) {
        String currentEmail = getCurrentUserEmail();
        if (isStaff()) {
            return true;
        }
        return currentEmail != null && currentEmail.equals(targetEmail);
    }

    public boolean canManageOrder(Long orderId, String orderOwnerEmail) {
        if (isStaff()) {
            return true;
        }
        String currentEmail = getCurrentUserEmail();
        return currentEmail != null && currentEmail.equals(orderOwnerEmail);
    }
}