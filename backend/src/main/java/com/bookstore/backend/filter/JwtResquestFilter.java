package com.bookstore.backend.filter;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.bookstore.backend.service.AppUserDetailsService;
import com.bookstore.backend.utils.JwtUtils;

import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtResquestFilter extends OncePerRequestFilter {

    private final AppUserDetailsService appUserDetailsService;
    private final JwtUtils jwtUtils;

    // Danh sách các đường dẫn public (không cần JWT)
    private static final List<String> PUBLIC_URLS = List.of(
            "/login", 
    "/register", 
    "/send-reset-otp", 
    "/reset-password", 
    "/logout",
    "/api/auth/**"
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getServletPath();

        // Bỏ qua các URL public
        if (PUBLIC_URLS.contains(path)) {
            filterChain.doFilter(request, response);
            return;
        }

        String jwt = null;
        String email = null;

        // 1️⃣ Lấy JWT từ header Authorization
        final String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7);
        }

        // 2️⃣ Nếu không có header, kiểm tra cookie
        if (jwt == null) {
            Cookie[] cookies = request.getCookies();
            if (cookies != null) {
                for (Cookie cookie : cookies) {
                    if ("jwt".equals(cookie.getName())) {
                        jwt = cookie.getValue();
                        break;
                    }
                }
            }
        }

        // 3️⃣ Validate JWT và set SecurityContext
        if (jwt != null) {
            try {
                email = jwtUtils.extractEmail(jwt);

                if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UserDetails userDetails = appUserDetailsService.loadUserByUsername(email);
                    if (jwtUtils.validateToken(jwt, userDetails)) {
                        UsernamePasswordAuthenticationToken authToken =
                                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                    }
                }
            } catch (ExpiredJwtException e) {
                // Nếu request tới public URL → bỏ qua, không ném lỗi
                if (!PUBLIC_URLS.contains(path)) {
                    throw e; // request private → ném lỗi JWT expired
                }
                // request public → token expired → chỉ bỏ qua
            } catch (Exception e) {
                // Các lỗi khác (token invalid, signature, ...) → bỏ qua hoặc log
                System.err.println("JWT processing error: " + e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }
}
