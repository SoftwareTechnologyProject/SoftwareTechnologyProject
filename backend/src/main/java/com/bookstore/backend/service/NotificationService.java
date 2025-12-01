package com.bookstore.backend.service;

import com.bookstore.backend.DTO.NotificationDTO;
import com.bookstore.backend.model.Notification;
import com.bookstore.backend.model.Users;
import com.bookstore.backend.repository.NotificationRepository;
import com.bookstore.backend.utils.SecurityUtils;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collector;
import java.util.stream.Collectors;

@Data
@AllArgsConstructor
@Service
public class NotificationService {
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationRepository notificationRepository;

    public List<NotificationDTO> getAllNotification(int page, int size){
        var user = SecurityUtils.getCurrentUser();
        if (user == null){
            return List.of();
        }
        List<Notification> result = notificationRepository.findByUsers_IdOrderByCreateAtDesc(user.getId(), PageRequest.of(page, size)).getContent();
        return result.stream()
                .map(noti -> NotificationDTO.from(noti))
                .collect(Collectors.toList());
    }

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
