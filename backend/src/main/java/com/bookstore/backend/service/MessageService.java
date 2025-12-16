package com.bookstore.backend.service;

import com.bookstore.backend.DTO.BoxChatDTO;
import com.bookstore.backend.DTO.MessageResponseDTO;
import com.bookstore.backend.model.Conversations;
import com.bookstore.backend.model.Messages;
import com.bookstore.backend.model.Users;
import com.bookstore.backend.repository.MessageRepository;
import com.bookstore.backend.repository.UserRepository;
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
    private final UserRepository userRepository;
    private final ConversationService conversationService;
    private final SecurityUtils securityUtils;

    public Messages createMessage(Conversations conversations, String content, Users sender, Users receiver){
        Messages message = Messages.builder().conversation(conversations).sender(sender).receiver(receiver)
                .createdAt(LocalDateTime.now()).content(content).build();

        messageRepository.save(message);
        return message;
    }

    @Transactional
    public void markAsRead(List<Long> ids) {
        var user = securityUtils.getCurrentUser();
        List<Messages> msgs = messageRepository.findAllById(ids);
        msgs.forEach(m ->{
            if (user.getId().equals(m.getReceiver().getId())) {
                m.setIsRead(true);
            }
        });
        messageRepository.saveAll(msgs);
    }

    public int getUnreadMessage(){
        var user = securityUtils.getCurrentUser();
        Conversations conversations = conversationService.getConversations(user);
        return messageRepository.countUnreadMessages(user.getId(), conversations.getId());
    }

    public Page<MessageResponseDTO> getMessages(Conversations conversation, Users currentUser,
            int page, int size) {
        return messageRepository.findByConversationOrderByCreatedAtAsc(conversation, PageRequest.of(page, size))
                .map(m -> MessageResponseDTO.from(m, currentUser));
    }

    public BoxChatDTO getBoxChat(int page, int size){
        Users user = securityUtils.getCurrentUser();

        Users admin = userRepository.findByEmail("admin@gmail.com").orElseThrow(() -> new RuntimeException("No admin available"));

        Conversations conversation = conversationService.getOrCreateConversation(user, admin);
        Page<MessageResponseDTO> chatContents = Page.empty();
        if (conversation != null) {
            chatContents = getMessages(conversation, user, page, size);
            admin = conversation.getAdmin();
        }
        return BoxChatDTO.builder()
                .senderId(user.getId())
                .senderName(user.getFullName())
                .receiverId(admin.getId())
                .receiverName(admin.getFullName())
                .receiverEmail(admin.getEmail())
                .boxContent(chatContents)
                .build();
    }
}
