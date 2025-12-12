package com.bookstore.backend.service;

import com.bookstore.backend.DTO.MessageResponseDTO;
import com.bookstore.backend.exception.ResourceNotFoundException;
import com.bookstore.backend.model.Conversations;
import com.bookstore.backend.model.Messages;
import com.bookstore.backend.model.Users;
import com.bookstore.backend.repository.MessageRepository;
import com.bookstore.backend.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {
    private final MessageRepository messageRepository;
    private final ConversationService conversationService;
    private final SecurityUtils securityUtils;

    public Messages createMessage(Conversations conversations, String content, Users sender){
        Messages message = Messages.builder().conversation(conversations).sender(sender)
                .createdAt(LocalDateTime.now()).content(content).isRead(false).build();

        messageRepository.save(message);
        return message;
    }

    @Transactional
    public void markAsRead(List<Long> ids) {
        List<Messages> msgs = messageRepository.findAllById(ids);
        msgs.forEach(m -> m.setIsRead(true));
        messageRepository.saveAll(msgs);
    }

    public int getUnreadMessage(){
        return messageRepository.getUnreadMessages();
    }

    public Page<MessageResponseDTO> getCustomerMessages(int page, int size){
        var user = securityUtils.getCurrentUser();
        if (user == null){
            return Page.empty();
        }
        Conversations conversation = conversationService.getConversations(user);
        Page<Messages> allMessages = messageRepository.findByConversationOrderByCreatedAtAsc(conversation, PageRequest.of(page, size));


        return allMessages.map(messages -> MessageResponseDTO.from(messages));
    }
}
