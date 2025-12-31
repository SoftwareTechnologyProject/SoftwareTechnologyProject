package com.bookstore.backend.service;

import com.bookstore.backend.DTO.MessageRequestDTO;
import com.bookstore.backend.DTO.MessageResponseDTO;
import com.bookstore.backend.exception.ResourceNotFoundException;
import com.bookstore.backend.model.Conversations;
import com.bookstore.backend.model.Messages;
import com.bookstore.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final ConversationService conversationsService;
    private final SimpMessagingTemplate simpMessagingTemplate;
    private final MessageService messageService;
    private final UserRepository userRepository;

    public void sendMessage(MessageRequestDTO messageRequestDTO, String emailSend){
        // Validation
        if (messageRequestDTO.getContent() == null || messageRequestDTO.getContent().trim().isEmpty()) {
            throw new IllegalArgumentException("Nội dung tin nhắn không được để trống");
        }
        
        String receiveEmail = messageRequestDTO.getReceiveEmail();
        if (receiveEmail == null || receiveEmail.trim().isEmpty()) {
            throw new IllegalArgumentException("Email người nhận không hợp lệ");
        }
        
        var users = userRepository.findByEmail(emailSend)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người gửi"));
        var receiver = userRepository.findByEmail(receiveEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người nhận: " + receiveEmail));
        
        // Không cho phép tự nhắn tin cho chính mình
        if (users.getId().equals(receiver.getId())) {
            throw new IllegalArgumentException("Không thể gửi tin nhắn cho chính mình");
        }
        
        Conversations conversations = conversationsService.getConversation(users, receiver);
        if (conversations == null) {
            throw new RuntimeException("Không thể tạo hoặc tìm thấy cuộc hội thoại");
        }

        Messages message = messageService.createMessage(conversations, messageRequestDTO.getContent().trim(), users, receiver);

        MessageResponseDTO receiveDTO = MessageResponseDTO.fromReceiver(message);
        MessageResponseDTO senderDTO = MessageResponseDTO.fromSender(message);
        
        // Gửi tin nhắn qua WebSocket
        System.out.println("📤 Sending message to: " + receiveEmail + " from: " + emailSend);
        simpMessagingTemplate.convertAndSendToUser(receiveEmail, "/queue/chat", receiveDTO);
        simpMessagingTemplate.convertAndSendToUser(emailSend, "/queue/chat", senderDTO);
        
        // Broadcast đến tất cả admin/staff khác trong 2 trường hợp:
        // 1. Khi customer gửi cho admin/staff
        // 2. Khi admin/staff reply customer (để admin/staff khác cũng thấy)
        boolean isCustomerToAdmin = "ADMIN".equals(receiver.getRole()) || "STAFF".equals(receiver.getRole());
        boolean isAdminReply = "ADMIN".equals(users.getRole()) || "STAFF".equals(users.getRole());
        
        if (isCustomerToAdmin || isAdminReply) {
            List<com.bookstore.backend.model.Users> allAdminStaff = userRepository.findAll()
                .stream()
                .filter(u -> ("ADMIN".equals(u.getRole()) || "STAFF".equals(u.getRole())) 
                            && !u.getEmail().equals(emailSend)
                            && !u.getEmail().equals(receiveEmail))
                .toList();
            
            for (var adminStaff : allAdminStaff) {
                System.out.println("📤 Broadcasting to other admin/staff: " + adminStaff.getEmail());
                // Gửi message với perspective phù hợp
                MessageResponseDTO broadcastDTO = isAdminReply ? senderDTO : receiveDTO;
                simpMessagingTemplate.convertAndSendToUser(adminStaff.getEmail(), "/queue/chat", broadcastDTO);
            }
        }
        
        System.out.println("✅ Message sent successfully");
    }
}
