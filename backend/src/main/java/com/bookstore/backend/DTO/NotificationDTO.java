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
    private Long id;
    private String content;
    private LocalDateTime createAt;
    private Boolean isRead;
    private String url;

    public static NotificationDTO from(Notification notification){
        return NotificationDTO.builder().id(notification.getId()).content(notification.getContent())
                .createAt(notification.getCreateAt()).url(notification.getUrl()).isRead(false)
                .build();
    }
}