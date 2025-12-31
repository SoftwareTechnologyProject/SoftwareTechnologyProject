package com.bookstore.backend.controller;

import com.bookstore.backend.DTO.NotificationDTO;
import com.bookstore.backend.DTO.NotificationRequestDTO;
import com.bookstore.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;

    // GET /notifications - Lấy danh sách thông báo của user hiện tại
    @GetMapping()
    public Page<NotificationDTO> getNotification(@RequestParam int page, @RequestParam int size){
        return notificationService.getAllNotification(page, size);
    }

    // GET /notifications/send - Gửi notification (CHỈ ADMIN)
    @GetMapping("/send")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseBody
    public String sendBroadcast(@RequestBody NotificationRequestDTO requestDTO) {
        notificationService.sendNotification(requestDTO);
        return "Sent broadcast!";
    }

    // PUT /notifications/{id}/read - Đánh dấu đã đọc
    @PutMapping("/{notificationId}/read")
    public void markAsRead(@PathVariable Long notificationId) {
        notificationService.markPrivateAsRead(notificationId);
    }
}
