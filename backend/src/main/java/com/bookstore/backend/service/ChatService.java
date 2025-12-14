package com.bookstore.backend.service;

import com.bookstore.backend.DTO.MessageRequestDTO;
import com.bookstore.backend.DTO.MessageResponseDTO;
import com.bookstore.backend.exception.ResourceNotFoundException;
import com.bookstore.backend.model.Conversations;
import com.bookstore.backend.model.Messages;
import com.bookstore.backend.model.Users;
import com.bookstore.backend.model.enums.UserRole;
import com.bookstore.backend.repository.UserRepository;
import com.bookstore.backend.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import javax.naming.AuthenticationException;
import java.security.Principal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final ConversationService conversationsService;
    private final SimpMessagingTemplate simpMessagingTemplate;
    private final MessageService messageService;
    private final UserRepository userRepository;

    public void sendMessage(MessageRequestDTO messageRequestDTO, String emailSend){
        String receiveEmail = messageRequestDTO.getReceiveEmail();
        var users = userRepository.findByEmail(emailSend).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        var receiver = userRepository.findByEmail(receiveEmail).orElseThrow(() -> new ResourceNotFoundException("Receiver not found"));
        Conversations conversations = conversationsService.getConversation(users, receiver);

        Messages message = messageService.createMessage(conversations, messageRequestDTO.getContent(), users, receiver);

        MessageResponseDTO receiveDTO = MessageResponseDTO.fromReceiver(message);
        MessageResponseDTO senderDTO = MessageResponseDTO.fromSender(message);
        simpMessagingTemplate.convertAndSendToUser(receiveEmail, "/queue/chat", receiveDTO);
        simpMessagingTemplate.convertAndSendToUser(emailSend, "/queue/chat", senderDTO);
    }
}
