package com.bookstore.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
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
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(authz -> authz
                    // Public endpoints
                    .requestMatchers("/send-reset-otp", "/reset-password", "/api/auth/**", "/register").permitAll()
                    .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/auth/register").permitAll() // Explicitly allow register
                    .requestMatchers("/api/books/**", "/ws/**", "/api/notifications/**").permitAll()
                    .requestMatchers(org.springframework.http.HttpMethod.GET, "/blog/**").permitAll() // Allow public GET for blog
                    .requestMatchers(org.springframework.http.HttpMethod.POST, "/blog/posts/*/comments").permitAll() // Allow public POST comments
                    .requestMatchers("/blog/**").hasAuthority("ROLE_ADMIN") // Require ROLE_ADMIN for blog management
                    .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/vouchers").permitAll() // Allow public GET vouchers list
                    .requestMatchers("/api/vouchers/**").hasAuthority("ROLE_ADMIN") // Require ROLE_ADMIN for voucher management
                    
                    .requestMatchers("/api/orders/**").hasAnyAuthority( "ROLE_USER", "ROLE_STAFF", "ROLE_ADMIN")
                    
                    .requestMatchers("/api/admin/**").hasAuthority("ROLE_ADMIN")
                    .requestMatchers("/api/users/me").authenticated() // Allow authenticated users to get their own info
                    .requestMatchers("/api/users/**").hasAuthority("ROLE_ADMIN") // Require ROLE_ADMIN for user management
                    .requestMatchers("/api/statistics/**").hasAuthority("ROLE_ADMIN") // Require ROLE_ADMIN for statistics
                    
                    .anyRequest().authenticated()
                )
                .addFilterBefore(jwtResquestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public UserDetailsService userDetailsService(){
        return email -> userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User Not found"));
    }

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