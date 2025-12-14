package com.bookstore.backend.DTO;

import lombok.*;
import org.springframework.data.domain.Page;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoxChatDTO {
    private Long senderId;
    private String senderName;
    private Long receiverId;
    private String receiverName;
    private String receiverEmail;
    private Page<MessageResponseDTO> boxContent;
}
