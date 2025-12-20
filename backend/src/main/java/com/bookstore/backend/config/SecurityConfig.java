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
    // Các dependency được inject qua constructor
    private final CorsConfigurationSource corsConfigurationSource;
    private final UserDetailsService userDetailsService;
    private final JwtResquestFilter jwtResquestFilter;
    private final UserRepository userRepository;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // Cấu hình CORS
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                // Tắt CSRF vì dùng JWT
                .csrf(csrf -> csrf.disable())
                // Stateless session (không lưu session server-side)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // Phân quyền cho các endpoint
                .authorizeHttpRequests(authz -> authz
                        // Các endpoint public (không cần login)
                        .requestMatchers("/send-reset-otp", "/reset-password", "/api/auth/**").permitAll()
                        .requestMatchers("/ws/**").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/books/**").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/books/**")
                        .hasAuthority("ROLE_ADMIN")
                        .requestMatchers(org.springframework.http.HttpMethod.PUT, "/api/books/**")
                        .hasAuthority("ROLE_ADMIN")
                        .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/books/**")
                        .hasAuthority("ROLE_ADMIN")
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/authors/**").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/categories/**").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/publishers/**").permitAll()

                        .requestMatchers("/register").permitAll()
                        .requestMatchers("/api/register").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/auth/register").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/blog/**").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/blog/posts/*/comments").permitAll()
                        .requestMatchers("/blog/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/vouchers").permitAll()
                        .requestMatchers("/api/vouchers/**").hasAuthority("ROLE_ADMIN")

                        // Thêm từ stashed
                        .requestMatchers("/api/chat/**", "/api/notifications").permitAll()

                        // Các endpoint yêu cầu quyền cụ thể
                        .requestMatchers("/api/orders/**").hasAnyAuthority("ROLE_USER", "ROLE_STAFF", "ROLE_ADMIN")
                        .requestMatchers("/api/admin/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_STAFF")
                        .requestMatchers("/api/users/**").authenticated()

                        // Các request khác phải login
                        .anyRequest().authenticated())
                .addFilterBefore(jwtResquestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // Mã hóa mật khẩu bằng BCrypt
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Cấu hình AuthenticationProvider dùng UserDetailsService + PasswordEncoder
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider daoAuthenticationProvider = new DaoAuthenticationProvider();
        daoAuthenticationProvider.setUserDetailsService(userDetailsService);
        daoAuthenticationProvider.setPasswordEncoder(passwordEncoder());
        return daoAuthenticationProvider;
    }

    // AuthenticationManager để xử lý xác thực
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
