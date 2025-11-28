package com.bookstore.backend.service;

import com.bookstore.backend.DTO.NotificationDTO;
import com.bookstore.backend.model.Notification;
import com.bookstore.backend.model.Users;
import com.bookstore.backend.utils.SecurityUtils;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Data
@AllArgsConstructor
@Service
public class NotificationService {
    private final SimpMessagingTemplate messagingTemplate;

    public void broadcastNotification(Notification notification){
        NotificationDTO notificationDTO = NotificationDTO.from(notification);
        messagingTemplate.convertAndSend("/topic/notifications", notificationDTO);
    }

    public void sendToUser(Notification notification){
        Users user = SecurityUtils.getCurrentUser();
        String email = user.getEmail();
        NotificationDTO notificationDTO = NotificationDTO.from(notification);
        messagingTemplate.convertAndSendToUser(email, "/queue/notifications", notificationDTO);
    }
}
