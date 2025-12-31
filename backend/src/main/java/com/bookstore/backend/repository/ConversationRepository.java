package com.bookstore.backend.repository;

import com.bookstore.backend.model.Conversations;
import com.bookstore.backend.model.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversations, Long> {
    Optional<Conversations> findByCustomer(Users customer);

    @Query("""
        SELECT c FROM Conversations c
        WHERE (c.customer = :u1 AND c.admin = :u2)
           OR (c.customer = :u2 AND c.admin = :u1)
        """)
    Optional<Conversations> findBetweenUsers(Users u1, Users u2);

    List<Conversations> findByAdmin(Users admin);
    
    @Query("""
        SELECT c FROM Conversations c
        WHERE c.admin.role IN ('ADMIN', 'STAFF')
        ORDER BY c.updatedAt DESC
        """)
    List<Conversations> findAllAdminConversations();
}
