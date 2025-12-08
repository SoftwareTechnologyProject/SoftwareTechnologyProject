package com.bookstore.backend.service;

import com.bookstore.backend.DTO.MessageRequestDTO;
import com.bookstore.backend.DTO.MessageResponseDTO;
import com.bookstore.backend.model.Conversations;
import com.bookstore.backend.model.Messages;
import com.bookstore.backend.model.Users;
import com.bookstore.backend.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final ConversationService conversationsService;
    private final SimpMessagingTemplate simpMessagingTemplate;
    private final ConversationService conversationService;
    private final MessageService messageService;

    public void sendMessage(MessageRequestDTO messageRequestDTO){
        Users users = SecurityUtils.getCurrentUser();
        Conversations conversations = conversationsService.getConversations(users);
        Messages message = messageService.createMessage(conversations, messageRequestDTO.getContent());
        MessageResponseDTO messageResponseDTO = MessageResponseDTO.builder().id(message.getId())
                        .content(messageRequestDTO.getContent()).createdAt(LocalDateTime.now())
                        .sender(users.getFullName()).isRead(false).build();
        simpMessagingTemplate.convertAndSendToUser(users.getEmail(), "/queue/chat", messageResponseDTO);
    }
}
