package com.bookstore.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Messages {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "conversation_id")
    private Conversations conversation;

    @ManyToOne
    @JoinColumn(name = "sender_id")
    private Users sender;

    @Column(columnDefinition = "TEXT")
    private String content;

    private LocalDateTime createdAt;

    @Builder.Default
    private Boolean isRead = false;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (isRead == null) isRead = false;
    }
}