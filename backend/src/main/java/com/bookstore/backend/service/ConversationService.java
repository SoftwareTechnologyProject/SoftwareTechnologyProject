package com.bookstore.backend.service;

import com.bookstore.backend.DTO.MessageResponseDTO;
import com.bookstore.backend.exception.ResourceNotFoundException;
import com.bookstore.backend.model.Conversations;
import com.bookstore.backend.model.Users;
import com.bookstore.backend.repository.ConversationRepository;
import com.bookstore.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ConversationService {
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;

    public Conversations createConversation(Users users){
        Users admin = userRepository.findByEmail("admin@gmail.com").orElseThrow(() -> new ResourceNotFoundException("admin not found"));
        Conversations conversations = Conversations.builder()
                .createAt(LocalDateTime.now()).updatedAt(LocalDateTime.now())
                .admin(admin)
                .customer(users).messages(new HashSet<>()).build();

        conversationRepository.save(conversations);
        return conversations;
    }

    public Conversations getConversations(Users users){
        return conversationRepository.findByCustomer(users).orElseThrow(() -> new ResourceNotFoundException("Conversation not found!"));
    }

    public Conversations getOrCreateConversation(Users user) {
        return conversationRepository.findByCustomer(user)
                .orElseGet(() -> createConversation(user));
    }

}
