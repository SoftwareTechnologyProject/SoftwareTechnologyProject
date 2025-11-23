package com.bookstore.backend.service;

import com.bookstore.backend.dto.NotificationDTO;
import com.bookstore.backend.model.Notification;
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

    public void sendToUser(Integer userId, Notification notification){
        NotificationDTO notificationDTO = NotificationDTO.from(notification);
        messagingTemplate.convertAndSendToUser(userId.toString(), "/queue/notifications", notificationDTO);
    }
}
