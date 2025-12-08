package com.bookstore.backend.service;

import com.bookstore.backend.DTO.MessageResponseDTO;
import com.bookstore.backend.exception.ResourceNotFoundException;
import com.bookstore.backend.model.Conversations;
import com.bookstore.backend.model.Messages;
import com.bookstore.backend.repository.MessageRepository;
import com.bookstore.backend.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {
    private final MessageRepository messageRepository;
    private final ConversationService conversationService;

    public Messages createMessage(Conversations conversations, String content){
        var user = SecurityUtils.getCurrentUser();
        Messages message = Messages.builder().conversation(conversations).sender(user)
                .createdAt(LocalDateTime.now()).content(content).isRead(false).build();

        messageRepository.save(message);
        return message;
    }

    public void markAsRead(Long id){
        Messages message = messageRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Message not found !"));
        message.setIsRead(true);
        messageRepository.save(message);
    }

    public int getUnreadMessage(){
        return messageRepository.getUnreadMessages();
    }

    public Page<MessageResponseDTO> getCustomerMessages(int page, int size){
        var user = SecurityUtils.getCurrentUser();
        if (user == null){
            return Page.empty();
        }
        Conversations conversation = conversationService.getConversations(user);
        Page<Messages> allMessages = messageRepository.findByConversationOrderByCreatedAtDesc(conversation, PageRequest.of(page, size));


        return allMessages.map(messages -> MessageResponseDTO.from(messages));
    }
}
