package com.bookstore.backend.service;

import com.bookstore.backend.model.Conversations;
import com.bookstore.backend.model.Users;
import com.bookstore.backend.model.enums.UserRole;
import com.bookstore.backend.repository.ConversationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashSet;

@Service
@RequiredArgsConstructor
@Slf4j
public class ConversationService {
    private final ConversationRepository conversationRepository;

    public Conversations createConversation(Users u1, Users u2) {
        log.info("📝 \nCreating new conversation between {} (role: {}) and {} (role: {})", 
            u1.getEmail(), u1.getRole(), u2.getEmail(), u2.getRole());
        
        Users admin, customer;

        // Determine who is admin/staff and who is customer
        if (u1.getRole() == UserRole.ADMIN || u1.getRole() == UserRole.STAFF) {
            admin = u1;
            customer = u2;
        } else if (u2.getRole() == UserRole.ADMIN || u2.getRole() == UserRole.STAFF) {
            admin = u2;
            customer = u1;
        } else {
            // If both are customers, default to first user as receiver
            log.warn("⚠️ Both users are customers, creating conversation anyway");
            admin = u1;
            customer = u2;
        }
        
        Conversations conversations = Conversations.builder()
                .admin(admin)
                .customer(customer)
                .createAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .messages(new HashSet<>())
                .build();
        
        Conversations saved = conversationRepository.save(conversations);
        log.info("✅ Conversation created: id={}, admin={}, customer={}", 
            saved.getId(), admin.getEmail(), customer.getEmail());
        
        return saved;
    }

    public Conversations getConversations(Users users){
        return conversationRepository.findByCustomer(users).orElse(null);
    }

    public Conversations getOrCreateConversation(Users user, Users receiver) {
        log.info("🔍 getOrCreateConversation: user={}, receiver={}", user.getEmail(), receiver.getEmail());
        
        if (user.getId().equals(receiver.getId())){
            log.warn("❌ Same user trying to create conversation with themselves");
            return null;
        }
        
        // First try to find existing conversation between these users
        var existing = conversationRepository.findBetweenUsers(user, receiver);
        if (existing.isPresent()) {
            log.info("✅ Found existing conversation: id={}", existing.get().getId());
            return existing.get();
        }
        
        log.info("➕ No existing conversation, creating new one");
        return createConversation(user, receiver);
    }

    public Conversations getConversation(Users user, Users receiver) {
        log.info("🔍 getConversation (no create): user={}, receiver={}", user.getEmail(), receiver.getEmail());
        var result = conversationRepository.findBetweenUsers(user, receiver);
        
        if (result.isEmpty()) {
            log.warn("⚠️ No conversation found between {} and {}", user.getEmail(), receiver.getEmail());
            return null;
        }
        
        log.info("✅ Found conversation: id={}", result.get().getId());
        return result.get();
    }

}
