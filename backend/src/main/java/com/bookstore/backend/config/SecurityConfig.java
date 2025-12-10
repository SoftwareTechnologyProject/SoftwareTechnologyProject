

package com.bookstore.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

import com.bookstore.backend.exception.ResourceNotFoundException;
import com.bookstore.backend.filter.JwtResquestFilter;
import com.bookstore.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
@EnableWebSecurity
public class SecurityConfig {
    private final CorsConfigurationSource corsConfigurationSource;
    private final UserDetailsService userDetailsService;
    private final JwtResquestFilter jwtResquestFilter;
    private final UserRepository userRepository;
    
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
                
                )
                .addFilterBefore(jwtResquestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public UserDetailsService userDetailsService(){
        return email -> userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User Not found"));
    }

    // Mã hóa mật khẩu
    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }
    

    @Bean
    public AuthenticationProvider authenticationProvider(){
        DaoAuthenticationProvider daoAuthenticationProvider = new DaoAuthenticationProvider();
        daoAuthenticationProvider.setUserDetailsService(userDetailsService());
        daoAuthenticationProvider.setPasswordEncoder(passwordEncoder());
        return daoAuthenticationProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}