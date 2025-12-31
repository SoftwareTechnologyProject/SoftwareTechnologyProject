package com.bookstore.backend.controller;

import com.bookstore.backend.DTO.BoxChatDTO;
import com.bookstore.backend.DTO.MessageRequestDTO;
import com.bookstore.backend.service.ChatService;
import com.bookstore.backend.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chat")
public class ChatController {
    private final MessageService messageService;
    private final ChatService chatService;
    @MessageMapping("/chat.send")
    public void sendTo(MessageRequestDTO messageRequestDTO, Principal principal) {
        if (principal == null) {
            return;
        }
        String email = principal.getName();

        try {
            chatService.sendMessage(messageRequestDTO, email);
        } catch (Exception e) {
            System.out.println("Error while sending message: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @PutMapping("/mark-read")
    public void markAsRead(@RequestBody List<Long> ids){
        messageService.markAsRead(ids);
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
    public ResponseEntity<BoxChatDTO> getMessage(@RequestParam(defaultValue = "0") int page,
                                                 @RequestParam(defaultValue = "50") int size){
        return ResponseEntity.ok(messageService.getBoxChat(page, size));
    }
}
