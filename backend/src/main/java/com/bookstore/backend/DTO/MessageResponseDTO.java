package com.bookstore.backend.DTO;

import com.bookstore.backend.model.Messages;
import com.bookstore.backend.model.Users;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class MessageResponseDTO {
    private Long id;
    private LocalDateTime createdAt;
    private String content;
    private String sender;
    private boolean isRead;

    public static MessageResponseDTO from(Messages messages){
        return MessageResponseDTO.builder().id(messages.getId()).createdAt(messages.getCreatedAt())
                .content(messages.getContent()).sender(messages.getSender().getFullName())
                .isRead(messages.getIsRead()).build();
    }
}
