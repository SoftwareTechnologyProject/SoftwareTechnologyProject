package com.bookstore.backend.utils;

import com.bookstore.backend.model.Users;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtils {
    public static Users getCurrentUser(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            System.out.println("Cannot load this user: User unauthorized 400");
            return null;
        }

        return (Users) authentication.getPrincipal();
    }
}
