package com.bookstore.backend.service;

import java.util.List;
import java.util.stream.Collectors;

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

@Data
@AllArgsConstructor
@Service
public class NotificationService {
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationRepository notificationRepository;
    private final SecurityUtils securityUtils;

    public Page<NotificationDTO> getAllNotification(int page, int size){
        var user = securityUtils.getCurrentUser();
        return notificationRepository.findByUsers_IdOrderByCreateAtDesc(user.getId(), PageRequest.of(page, size))
                .map(noti -> NotificationDTO.from(noti));
    }

    public void broadcastNotification(Notification notification){
        NotificationDTO notificationDTO = NotificationDTO.from(notification);
        notificationRepository.save(notification);
        messagingTemplate.convertAndSend("/topic/notifications", notificationDTO);
    }

    public void sendToUser(Notification notification){
        NotificationDTO notificationDTO = NotificationDTO.from(notification);
        notificationRepository.save(notification);
        messagingTemplate.convertAndSendToUser(email, "/queue/notifications", notificationDTO);
    }
}
