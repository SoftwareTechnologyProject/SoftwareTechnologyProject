package com.bookstore.backend.service;

import java.util.Collections;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.bookstore.backend.model.Account;
import com.bookstore.backend.model.Users;
import com.bookstore.backend.model.enums.AccountStatus;
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

    // Kiểm tra trạng thái tài khoản
    AccountStatus status = account.getStatus();
    if (status == AccountStatus.DELETED) {
        throw new UsernameNotFoundException("Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.");
    }
    
    boolean enabled = account.getIsAccountVerified() != null && account.getIsAccountVerified();
    boolean locked = (status == AccountStatus.LOCKED);

    return org.springframework.security.core.userdetails.User.builder()
            .username(user.getEmail())
            .password(account.getPassword())
            .authorities(
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
            )
            .accountExpired(false)
            .accountLocked(locked) // Khóa nếu status = LOCKED
            .credentialsExpired(false)
            .disabled(!enabled) // Vô hiệu hóa nếu chưa verify
            .build();
}
}