package com.bookstore.backend.service;

import com.bookstore.backend.DTO.MessageResponseDTO;
import com.bookstore.backend.exception.ResourceNotFoundException;
import com.bookstore.backend.model.Conversations;
import com.bookstore.backend.model.Users;
import com.bookstore.backend.repository.ConversationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ConversationService {
    private final ConversationRepository conversationRepository;

    public void createConversation(Users users){
        Conversations conversations = Conversations.builder()
                .createAt(LocalDateTime.now()).updatedAt(LocalDateTime.now())
                .customer(users).messages(new HashSet<>()).build();

        conversationRepository.save(conversations);
    }

    public Conversations getConversations(Users users){
        return conversationRepository.findByCustomer(users).orElseThrow(() -> new ResourceNotFoundException("User not found!"));
    }
}
