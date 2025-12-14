package com.bookstore.backend.service.admin;

import com.bookstore.backend.exception.ResourceNotFoundException;
import com.bookstore.backend.model.Conversations;
import com.bookstore.backend.model.Users;
import com.bookstore.backend.repository.ConversationRepository;
import com.bookstore.backend.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminConversationService {
    private final ConversationRepository conversationRepository;

    public List<Conversations> getConversations(Users users){
        return conversationRepository.findByAdmin(users);
    }
}
