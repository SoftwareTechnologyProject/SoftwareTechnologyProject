package com.bookstore.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String content;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Users customer;

    private LocalDateTime createAt;

    @Builder.Default
    private Boolean isRead = false;

    private String url;

    @PrePersist
    protected void onCreate() {
        if (createAt == null) createAt = LocalDateTime.now();
        if (isRead == null) isRead = false;
    }
}