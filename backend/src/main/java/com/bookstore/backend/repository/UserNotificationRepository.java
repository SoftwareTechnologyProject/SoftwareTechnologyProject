package com.bookstore.backend.repository;

import com.bookstore.backend.model.UserNotification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserNotificationRepository extends JpaRepository<UserNotification, Long> {
    Optional<UserNotification> findByUserIdAndNotificationId(Long userId, Long notificationId);
}
