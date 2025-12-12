package com.bookstore.backend.repository;

import com.bookstore.backend.model.Conversations;
import com.bookstore.backend.model.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversations, Long> {
    Optional<Conversations> findByCustomer(Users customer);
}
