package com.bookstore.backend.repository;

import com.bookstore.backend.model.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;


public interface NotificationRepository extends JpaRepository<Notification, Long> {
    Page<Notification> findByUsers_IdOrderByCreateAtDesc(Long userId, Pageable pageable);
}
