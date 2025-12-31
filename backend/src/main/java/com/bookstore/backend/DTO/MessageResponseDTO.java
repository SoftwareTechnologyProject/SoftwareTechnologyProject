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
    private Long conversationId; // Thêm conversationId để frontend biết message thuộc conversation nào
    private LocalDateTime createdAt;
    private String content;
    private String sender;
    private String receiver;
    private boolean isRead;
    private boolean isMine;

    public static MessageResponseDTO fromSender(Messages messages){
        return MessageResponseDTO.builder()
                .id(messages.getId())
                .conversationId(messages.getConversation().getId())
                .createdAt(messages.getCreatedAt())
                .content(messages.getContent())
                .sender(messages.getSender().getFullName())
                .receiver(messages.getReceiver().getFullName())
                .isRead(messages.getIsRead())
                .isMine(true)
                .build();
    }

    public static MessageResponseDTO fromReceiver(Messages messages){
        return MessageResponseDTO.builder()
                .id(messages.getId())
                .conversationId(messages.getConversation().getId())
                .createdAt(messages.getCreatedAt())
                .content(messages.getContent())
                .sender(messages.getSender().getFullName())
                .receiver(messages.getReceiver().getFullName())
                .isRead(messages.getIsRead())
                .isMine(false)
                .build();
    }

    public static MessageResponseDTO from(Messages message, Users currentUser) {
        boolean isMine = message.getSender().getId().equals(currentUser.getId());

        return MessageResponseDTO.builder()
                .id(message.getId())
                .conversationId(message.getConversation().getId())
                .content(message.getContent())
                .createdAt(message.getCreatedAt())
                .sender(message.getSender().getFullName())
                .receiver(message.getReceiver().getFullName())
                .isMine(isMine)
                .isRead(message.getIsRead())
                .build();
    }
}
