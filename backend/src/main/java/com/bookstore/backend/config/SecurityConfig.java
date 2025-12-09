

package com.bookstore.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfigurationSource;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
@EnableWebSecurity
public class SecurityConfig {
    private final CorsConfigurationSource corsConfigurationSource;
    private final UserDetailsService appUserDetailsService;
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(authz -> authz
                    // CẬP NHẬT: Thêm đường dẫn /api/auth/** vào permitAll()
                    .requestMatchers("/register", "/login", "/send-reset-otp", "/reset-password", "/api/auth/**").permitAll() 
                    .requestMatchers("/profile", "/is-authenticated", "/send-otp", "/verify-otp").authenticated()
                    .requestMatchers("/api/books/**", "/api/products/**").permitAll()
                    .requestMatchers("/api/orders/my-orders").hasAnyRole("USER", "STAFF", "ADMIN")
                    .requestMatchers("/api/orders/**").hasAnyRole("STAFF", "ADMIN")
                    .requestMatchers("/api/vouchers/my-vouchers").hasAnyRole("USER", "STAFF", "ADMIN")
                    .requestMatchers("/api/vouchers/**").hasAnyRole("STAFF", "ADMIN")
                    .requestMatchers("/api/admin/**").hasRole("ADMIN")
                    .requestMatchers("/api/users/**").hasRole("ADMIN")
                    .requestMatchers("/api/reports/**").hasAnyRole("STAFF", "ADMIN")
                    .anyRequest().authenticated()
                );

        return http.build();
    }

    // Mã hóa mật khẩu
    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager() {
        DaoAuthenticationProvider authenticationProvider = new DaoAuthenticationProvider();
        authenticationProvider.setUserDetailsService(appUserDetailsService);
        authenticationProvider.setPasswordEncoder(passwordEncoder());
        return new ProviderManager(authenticationProvider);
    }
}