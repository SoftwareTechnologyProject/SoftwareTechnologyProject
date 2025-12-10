package com.bookstore.backend.service;

import com.bookstore.backend.DTO.MessageRequestDTO;
import com.bookstore.backend.DTO.MessageResponseDTO;
import com.bookstore.backend.model.Conversations;
import com.bookstore.backend.model.Messages;
import com.bookstore.backend.model.Users;
import com.bookstore.backend.model.enums.UserRole;
import com.bookstore.backend.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import javax.naming.AuthenticationException;
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
        String adminEmail = "admin@gmail.com";
        String senderEmail = users.getEmail();
        String receiverEmail;
        if (senderEmail.equals(adminEmail)) {
            receiverEmail = conversations.getCustomer().getEmail();
        } else {
            receiverEmail = adminEmail;
        }
        MessageResponseDTO messageResponseDTO = MessageResponseDTO.builder().id(message.getId())
                        .content(messageRequestDTO.getContent()).createdAt(LocalDateTime.now())
                        .sender(users.getFullName()).isRead(false).build();
        simpMessagingTemplate.convertAndSendToUser(receiverEmail, "/queue/chat", messageResponseDTO);
    }
}
