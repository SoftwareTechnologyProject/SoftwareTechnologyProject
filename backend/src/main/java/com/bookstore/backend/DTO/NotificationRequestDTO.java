package com.bookstore.backend.DTO;

import com.bookstore.backend.model.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRequestDTO {
    private String content;
    private String url;

    // BROADCAST, PERSONAL
    private NotificationType type;

    // chỉ dùng cho PERSONAL
    private Long userId;
}
