package com.bookstore.backend.controller;

import com.bookstore.backend.DTO.MessageRequestDTO;
import com.bookstore.backend.DTO.MessageResponseDTO;
import com.bookstore.backend.model.Messages;
import com.bookstore.backend.service.ChatService;
import com.bookstore.backend.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chat")
public class ChatController {
    private final MessageService messageService;
    private final ChatService chatService;
    @MessageMapping("/chat.send")
    public void sendTo(MessageRequestDTO messageRequestDTO){
        chatService.sendMessage(messageRequestDTO);
    }

    @PutMapping("/mark-read/{id}")
    public void markAsRead(@PathVariable Long id){
        messageService.markAsRead(id);
    }

    @GetMapping("/unread")
    public ResponseEntity<Integer> getUnreadNum(){
        return ResponseEntity.ok(messageService.getUnreadMessage());
    }

    //Response mẫu
//    {
//        "content": [ {...}, {...} ],
//        "pageable": { ... },
//        "totalPages": 3,
//            "totalElements": 45,
//            "number": 0,
//            "size": 20
//    }
    @GetMapping
    public ResponseEntity<Page<MessageResponseDTO>> getMessage(@RequestParam int page, @RequestParam int size){
        return ResponseEntity.ok(messageService.getCustomerMessages(page, size));
    }
}
