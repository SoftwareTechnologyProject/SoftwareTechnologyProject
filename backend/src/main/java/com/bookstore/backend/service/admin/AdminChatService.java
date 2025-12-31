package com.bookstore.backend.service.admin;

import com.bookstore.backend.DTO.MessageRequestDTO;
import com.bookstore.backend.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminChatService {
    private final ChatService chatService;
    public void sendMessage(MessageRequestDTO messageRequestDTO, String email){
        chatService.sendMessage(messageRequestDTO, email);
    }
}
