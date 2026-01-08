package com.bookstore.backend.controller;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bookstore.backend.repository.AccountRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/test")
@RequiredArgsConstructor
public class TestController {
    
    private final AccountRepository accountRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    
    @GetMapping("/check-password")
    public String checkPassword(@RequestParam String email, @RequestParam String password) {
        var account = accountRepository.findByEmail(email);
        if (account.isEmpty()) {
            return "Account not found";
        }
        
        String dbHash = account.get().getPassword();
        boolean matches = passwordEncoder.matches(password, dbHash);
        
        return String.format(
            "Email: %s%nDB Hash: %s%nInput: %s%nMatches: %s",
            email, dbHash, password, matches
        );
    }
    
    @GetMapping("/generate-hash")
    public String generateHash(@RequestParam String password) {
        return passwordEncoder.encode(password);
    }
}
