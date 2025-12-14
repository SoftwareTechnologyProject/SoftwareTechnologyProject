package com.bookstore.backend.service.admin;

import com.bookstore.backend.DTO.BoxChatDTO;
import com.bookstore.backend.DTO.MessageResponseDTO;
import com.bookstore.backend.model.Conversations;
import com.bookstore.backend.model.Users;
import com.bookstore.backend.repository.MessageRepository;
import com.bookstore.backend.service.MessageService;
import com.bookstore.backend.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminMessageService {
    private final MessageRepository messageRepository;
    private final MessageService messageService;
    private final SecurityUtils securityUtils;
    private final AdminConversationService adminConversationService;

    //dùng chung được
    @Transactional
    public void markAsRead(List<Long> ids) {
        messageService.markAsRead(ids);
    }

    public Map<Long, Integer> getUnreadPerConversationForAdmin() {
        Users admin = securityUtils.getCurrentUser();

        Map<Long, Integer> result = new HashMap<>();
        for (Object[] row : messageRepository.countUnreadGroupByConversation(admin.getId())) {
            Long conversationId = (Long) row[0];
            Long count = (Long) row[1];
            result.put(conversationId, count.intValue());
        }
        return result;
    }

    public List<BoxChatDTO> getAdminBoxChats(int page, int size) {
        Users admin = securityUtils.getCurrentUser();

        List<Conversations> conversations = adminConversationService.getConversations(admin);

        return conversations.stream().map(conversation -> {
            Users customer = conversation.getCustomer();
            Page<MessageResponseDTO> messages = messageService.getMessages(conversation, admin, page, size);

            return BoxChatDTO.builder()
                    .conversationId(conversation.getId())
                    .senderId(admin.getId())
                    .senderName(admin.getFullName())
                    .receiverId(customer.getId())
                    .receiverName(customer.getFullName())
                    .receiverEmail(customer.getEmail())
                    .boxContent(messages)
                    .build();

        }).toList();
    }
}
