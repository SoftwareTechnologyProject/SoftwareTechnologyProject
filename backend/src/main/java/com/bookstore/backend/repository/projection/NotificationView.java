package com.bookstore.backend.repository.projection;

import java.time.LocalDateTime;

public interface NotificationView {

    Long getId();
    String getContent();
    String getUrl();
    LocalDateTime getCreateAt();
    Boolean getIsRead();
}
