package com.bookstore.backend.service.admin;

import com.bookstore.backend.DTO.MessageRequestDTO;
import com.bookstore.backend.repository.UserRepository;
import com.bookstore.backend.service.ChatService;
import com.bookstore.backend.service.ConversationService;
import com.bookstore.backend.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminChatService {
    private final ChatService chatService;
    public void sendMessage(MessageRequestDTO messageRequestDTO, String email){
        chatService.sendMessage(messageRequestDTO, email);
    }
}
