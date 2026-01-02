package com.bookstore.backend.service;

import com.bookstore.backend.DTO.MessageRequestDTO;
import com.bookstore.backend.DTO.MessageResponseDTO;
import com.bookstore.backend.exception.ResourceNotFoundException;
import com.bookstore.backend.model.Conversations;
import com.bookstore.backend.model.Messages;
import com.bookstore.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {
    private final ConversationService conversationsService;
    private final SimpMessagingTemplate simpMessagingTemplate;
    private final MessageService messageService;
    private final UserRepository userRepository;

    public void sendMessage(MessageRequestDTO messageRequestDTO, String emailSend){
        log.info("📨 sendMessage called: from={}, to={}", emailSend, messageRequestDTO.getReceiveEmail());
        
        // Validation
        if (messageRequestDTO.getContent() == null || messageRequestDTO.getContent().trim().isEmpty()) {
            log.warn("❌ Empty message content from {}", emailSend);
            throw new IllegalArgumentException("Nội dung tin nhắn không được để trống");
        }
        
        String receiveEmail = messageRequestDTO.getReceiveEmail();
        if (receiveEmail == null || receiveEmail.trim().isEmpty()) {
            log.warn("❌ Invalid receiver email from {}", emailSend);
            throw new IllegalArgumentException("Email người nhận không hợp lệ");
        }
        
        var users = userRepository.findByEmail(emailSend)
                .orElseThrow(() -> {
                    log.error("❌ Sender not found: {}", emailSend);
                    return new ResourceNotFoundException("Không tìm thấy người gửi");
                });
        var receiver = userRepository.findByEmail(receiveEmail)
                .orElseThrow(() -> {
                    log.error("❌ Receiver not found: {}", receiveEmail);
                    return new ResourceNotFoundException("Không tìm thấy người nhận: " + receiveEmail);
                });
        
        log.info("👤 Sender: {} (role: {}), Receiver: {} (role: {})", 
            users.getEmail(), users.getRole(), receiver.getEmail(), receiver.getRole());
        
        // Không cho phép tự nhắn tin cho chính mình
        if (users.getId().equals(receiver.getId())) {
            log.warn("❌ User trying to send message to themselves: {}", emailSend);
            throw new IllegalArgumentException("Không thể gửi tin nhắn cho chính mình");
        }
        
        // FIX: Use getOrCreateConversation instead of getConversation
        // This allows new customers to start conversations automatically
        Conversations conversations = conversationsService.getOrCreateConversation(users, receiver);
        if (conversations == null) {
            log.error("❌ Failed to create/get conversation between {} and {}", emailSend, receiveEmail);
            throw new RuntimeException("Không thể tạo hoặc tìm thấy cuộc hội thoại");
        }
        
        log.info("💬 Conversation found/created: id={}", conversations.getId());

        Messages message = messageService.createMessage(conversations, messageRequestDTO.getContent().trim(), users, receiver);
        log.info("✅ Message created: id={}", message.getId());

        MessageResponseDTO receiveDTO = MessageResponseDTO.fromReceiver(message);
        MessageResponseDTO senderDTO = MessageResponseDTO.fromSender(message);
        
        // Gửi tin nhắn qua WebSocket
        log.info("📤 Sending message to: {} from: {}", receiveEmail, emailSend);
        simpMessagingTemplate.convertAndSendToUser(receiveEmail, "/queue/chat", receiveDTO);
        simpMessagingTemplate.convertAndSendToUser(emailSend, "/queue/chat", senderDTO);
        
        // Broadcast đến tất cả admin/staff khác trong 2 trường hợp:
        // 1. Khi customer gửi cho admin/staff
        // 2. Khi admin/staff reply customer (để admin/staff khác cũng thấy)
        boolean isCustomerToAdmin = "ADMIN".equals(receiver.getRole().toString()) || "STAFF".equals(receiver.getRole().toString());
        boolean isAdminReply = "ADMIN".equals(users.getRole().toString()) || "STAFF".equals(users.getRole().toString());
        
        log.info("📢 Broadcast check: isCustomerToAdmin={}, isAdminReply={}", isCustomerToAdmin, isAdminReply);
        
        if (isCustomerToAdmin || isAdminReply) {
            List<com.bookstore.backend.model.Users> allAdminStaff = userRepository.findAll()
                .stream()
                .filter(u -> ("ADMIN".equals(u.getRole().toString()) || "STAFF".equals(u.getRole().toString())) 
                            && !u.getEmail().equals(emailSend)
                            && !u.getEmail().equals(receiveEmail))
                .toList();
            
            log.info("📢 Broadcasting to {} other admin/staff members", allAdminStaff.size());
            
            for (var adminStaff : allAdminStaff) {
                log.debug("📤 Broadcasting to: {}", adminStaff.getEmail());
                // FIX: Luôn gửi receiveDTO (mine=false) cho admin/staff khác
                // Vì họ không phải người gửi tin nhắn, họ chỉ "xem" cuộc hội thoại
                simpMessagingTemplate.convertAndSendToUser(adminStaff.getEmail(), "/queue/chat", receiveDTO);
            }
        }
        
        log.info("✅ Message sent successfully: conversationId={}, messageId={}", conversations.getId(), message.getId());
    }
}
