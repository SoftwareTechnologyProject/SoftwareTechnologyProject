package com.bookstore.backend.DTO;

import com.bookstore.backend.model.Notification;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class NotificationDTO {
    private String content;
    private LocalDateTime createAt;
    private boolean isRead;
    private String url;

    public static NotificationDTO from(Notification notification){
        return NotificationDTO.builder().content(notification.getContent())
                .createAt(notification.getCreateAt()).isRead(notification.isRead()).url(notification.getUrl())
                .build();
    }
}