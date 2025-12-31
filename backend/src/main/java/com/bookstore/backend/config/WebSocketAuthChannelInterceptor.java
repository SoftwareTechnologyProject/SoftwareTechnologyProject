package com.bookstore.backend.config;

import com.bookstore.backend.utils.JwtUtils;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class WebSocketAuthChannelInterceptor implements ChannelInterceptor {

    private final JwtUtils jwtUtils;

    public WebSocketAuthChannelInterceptor(JwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {

        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor == null) return message;

        // ONLY CHECK FOR CONNECT
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {

            String authHeader = accessor.getFirstNativeHeader("Authorization");

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                System.out.println("❌ No JWT provided in WebSocket CONNECT");
                return message;
            }

            String token = authHeader.substring(7);
            System.out.println("🔍 Extracted WS JWT for user authentication");

            try {
                // Extract email/username
                String email = jwtUtils.extractEmail(token);
                System.out.println("✅ WebSocket authenticated for: " + email);

                // Create Authentication object WITHOUT loading authorities
                Authentication authentication =
                        new UsernamePasswordAuthenticationToken(email, null, List.of());

                // Attach principal to WebSocket session
                accessor.setUser(authentication);


                System.out.println("✅ WebSocket authenticated user: " + accessor.getUser().getName());

            } catch (Exception e) {
                System.out.println("❌ Invalid JWT in WebSocket CONNECT: " + e.getMessage());
            }
        }

        return message;
    }
}
