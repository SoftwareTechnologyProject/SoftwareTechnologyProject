package com.bookstore.backend.controller.admin;

import com.bookstore.backend.DTO.BoxChatDTO;
import com.bookstore.backend.DTO.MessageRequestDTO;
import com.bookstore.backend.DTO.MessageResponseDTO;
import com.bookstore.backend.service.admin.AdminChatService;
import com.bookstore.backend.service.admin.AdminMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/chat")
public class AdminChatController {
    private final AdminMessageService adminMessageService;

    @PutMapping("/mark-read")
    public void markAsRead(@RequestBody List<Long> ids){
        adminMessageService.markAsRead(ids);
    }

    @GetMapping("/unread")
    public ResponseEntity<Map<Long, Integer>> getUnreadByConversation() {
        return ResponseEntity.ok(adminMessageService.getUnreadPerConversationForAdmin());
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
    public ResponseEntity<List<BoxChatDTO>> getAllBoxChats(@RequestParam(defaultValue = "0") int page,
                                                           @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(adminMessageService.getAdminBoxChats(page, size));
    }
}
