package com.bookstore.backend.controller;

import com.bookstore.backend.DTO.NotificationDTO;
import com.bookstore.backend.model.Notification;
import com.bookstore.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;

    @GetMapping()
    public List<NotificationDTO> getNotification(int page, int size){
        return notificationService.getAllNotification(page, size);
    }

    @GetMapping("/send/broadcast")
    @ResponseBody
    public String sendBroadcast() {

        Notification notification = new Notification();
        notification.setContent("🔔 Test broadcast notification");
        notification.setRead(false);
        notification.setCreateAt(LocalDateTime.now());
        notification.setUrl("/test");

        notificationService.broadcastNotification(notification);

        return "Sent!";
    }
}
