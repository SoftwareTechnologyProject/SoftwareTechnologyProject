package com.bookstore.backend.DTO;

import org.springframework.security.core.GrantedAuthority;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Collection;

@Getter
@AllArgsConstructor
public class AuthResponse {
    private String email;
    private String token;
    private Collection<? extends GrantedAuthority> roles;
}