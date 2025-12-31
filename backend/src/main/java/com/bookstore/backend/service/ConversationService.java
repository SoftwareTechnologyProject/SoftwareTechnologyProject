package com.bookstore.backend.service;

import com.bookstore.backend.model.Conversations;
import com.bookstore.backend.model.Users;
import com.bookstore.backend.model.enums.UserRole;
import com.bookstore.backend.repository.ConversationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashSet;

@Service
@RequiredArgsConstructor
public class ConversationService {
    private final ConversationRepository conversationRepository;

    public Conversations createConversation(Users u1, Users u2) {
        Users admin, customer;

        if (u1.getRole() == UserRole.ADMIN || u1.getRole() == UserRole.STAFF) {
            admin = u1;
            customer = u2;
        } else {
            admin = u2;
            customer = u1;
        }
        Conversations conversations = Conversations.builder()
                .admin(admin)
                .customer(customer)
                .createAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .messages(new HashSet<>())
                .build();
        return conversationRepository.save(conversations);
    }

    public Conversations getConversations(Users users){
        return conversationRepository.findByCustomer(users).orElse(null);
    }

    public Conversations getOrCreateConversation(Users user, Users receiver) {
        if (user.getId().equals(receiver.getId())){
            return null;
        }
        return conversationRepository.findByCustomer(user)
                .orElseGet(() -> createConversation(user, receiver));
    }

    public Conversations getConversation(Users user, Users receiver) {
        return conversationRepository.findBetweenUsers(user, receiver).orElseThrow(null);
    }

}
