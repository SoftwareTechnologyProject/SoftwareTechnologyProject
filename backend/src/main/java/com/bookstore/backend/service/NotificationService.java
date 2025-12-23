package com.bookstore.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import com.bookstore.backend.DTO.NotificationRequestDTO;
import com.bookstore.backend.exception.ResourceNotFoundException;
import com.bookstore.backend.model.UserNotification;
import com.bookstore.backend.model.enums.NotificationType;
import com.bookstore.backend.repository.UserNotificationRepository;
import com.bookstore.backend.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.bookstore.backend.DTO.NotificationDTO;
import com.bookstore.backend.model.Notification;
import com.bookstore.backend.model.Users;
import com.bookstore.backend.repository.NotificationRepository;
import com.bookstore.backend.utils.SecurityUtils;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.transaction.annotation.Transactional;

@AllArgsConstructor
@Service
public class NotificationService {
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationRepository notificationRepository;
    private final UserNotificationRepository userNotificationRepository;
    private final UserRepository userRepository;
    private final SecurityUtils securityUtils;

    public Page<NotificationDTO> getAllNotification(int page, int size){
        var user = securityUtils.getCurrentUser();
        return notificationRepository.findAllNotifications(user.getId(), PageRequest.of(page, size))
                .map(noti -> NotificationDTO.builder().id(noti.getId())
                        .url(noti.getUrl()).content(noti.getContent()).isRead(noti.getIsRead())
                        .createAt(noti.getCreateAt()).build()
                );
    }

    @Transactional
    public void sendNotification(NotificationRequestDTO request) {

        Notification notification = Notification.builder().content(request.getContent()).url(request.getUrl())
                .type(request.getType()).createAt(LocalDateTime.now()).build();
        notificationRepository.save(notification);

        if (request.getType() == NotificationType.BROADCAST) {
            sendBroadcast(notification);
        } else {
            sendPersonal(notification, request.getUserId());
        }
    }

    private void sendBroadcast(Notification notification) {
        messagingTemplate.convertAndSend(
                "/topic/notifications",
                NotificationDTO.from(notification)
        );
    }

    private void sendPersonal(Notification notification, Long userId) {
        Users user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        UserNotification un = UserNotification.builder().user(user).notification(notification)
                .isRead(false).build();
        userNotificationRepository.save(un);
        messagingTemplate.convertAndSendToUser(user.getEmail(), "/queue/notifications", NotificationDTO.from(notification));
    }

    @Transactional
    public void markPrivateAsRead(Long notificationId) {
        var user = securityUtils.getCurrentUser();
        UserNotification un = userNotificationRepository.findByUserIdAndNotificationId(user.getId(), notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Private notification not found for user"));
        // idempotent
        if (!un.isRead()) {
            un.setRead(true);
            userNotificationRepository.save(un);
        }
    }
}
