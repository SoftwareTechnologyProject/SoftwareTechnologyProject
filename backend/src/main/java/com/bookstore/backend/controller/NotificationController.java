package com.bookstore.backend.controller;

import com.bookstore.backend.DTO.NotificationDTO;
import com.bookstore.backend.DTO.NotificationRequestDTO;
import com.bookstore.backend.model.Notification;
import com.bookstore.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;

    @GetMapping()
    public Page<NotificationDTO> getNotification(@RequestParam int page, @RequestParam int size){
        return notificationService.getAllNotification(page, size);
    }

    @GetMapping("/send")
    @ResponseBody
    public String sendBroadcast(@RequestBody NotificationRequestDTO requestDTO) {
        notificationService.sendNotification(requestDTO);
        return "Sent broadcast!";
    }

    // Accept POST as well for clients that don't include a body with GET requests
    @PostMapping("/send")
    @ResponseBody
    public String sendBroadcastPost(@RequestBody NotificationRequestDTO requestDTO) {
        notificationService.sendNotification(requestDTO);
        return "Sent broadcast (POST)!";
    }

    @PutMapping("/{notificationId}/read")
    public void markAsRead(@PathVariable Long notificationId) {
        notificationService.markPrivateAsRead(notificationId);
    }
}
