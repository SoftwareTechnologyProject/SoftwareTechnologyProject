package com.bookstore.backend.repository;

import com.bookstore.backend.model.Conversations;
import com.bookstore.backend.model.Messages;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface MessageRepository extends JpaRepository<Messages, Long> {
    @Query("""
            SELECT COUNT(m) FROM Messages m WHERE m.isRead = false
            """)
    int getUnreadMessages();

    Page<Messages> findByConversationOrderByCreatedAtDesc(Conversations conversation, Pageable pageable);
}