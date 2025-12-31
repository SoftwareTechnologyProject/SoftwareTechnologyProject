package com.bookstore.backend.service.admin;

import com.bookstore.backend.model.Conversations;
import com.bookstore.backend.model.Users;
import com.bookstore.backend.repository.ConversationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminConversationService {
    private final ConversationRepository conversationRepository;

    public List<Conversations> getConversations(Users users){
        // Return all conversations for any admin/staff (team inbox)
        return conversationRepository.findAllAdminConversations();
    }
}
