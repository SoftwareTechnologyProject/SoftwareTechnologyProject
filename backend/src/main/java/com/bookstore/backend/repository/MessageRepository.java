package com.bookstore.backend.repository;

import com.bookstore.backend.model.Conversations;
import com.bookstore.backend.model.Messages;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

// import java.util.List;

public interface MessageRepository extends JpaRepository<Messages, Long> {
    @Query("""
    SELECT COUNT(m)
    FROM Messages m
    WHERE m.conversation.id = :conversationId AND  m.receiver.id = :userId AND m.isRead = false
    """)
    int countUnreadMessages(Long userId, Long conversationId);

    @Query("""
    SELECT m.conversation.id, COUNT(m)
    FROM Messages m
    WHERE m.receiver.id = :adminId
      AND m.isRead = false
    GROUP BY m.conversation.id
    """)
    List<Object[]> countUnreadGroupByConversation(Long adminId);

    Page<Messages> findByConversationOrderByCreatedAtDesc(Conversations conversation, Pageable pageable);
    Page<Messages> findByConversationOrderByCreatedAtAsc(Conversations conversation, Pageable pageable);
}