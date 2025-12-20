package com.bookstore.backend.service;

import java.util.Collections;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.bookstore.backend.model.Account;
import com.bookstore.backend.model.Users;
import com.bookstore.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AppUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
    Users user = userRepository.findByEmailWithAccount(email)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

    Account account = user.getAccount();
    if (account == null) {
        throw new UsernameNotFoundException("Account not found for user: " + email);
    }

    boolean enabled = account.getIsAccountVerified() != null && account.getIsAccountVerified();

    return org.springframework.security.core.userdetails.User.builder()
            .username(user.getEmail())
            .password(account.getPassword())
            .authorities(
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
            )
            .accountExpired(false)
            .accountLocked(false)
            .credentialsExpired(false)
            .disabled(!enabled)
            .build();
}
}