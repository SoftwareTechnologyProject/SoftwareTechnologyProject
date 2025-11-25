package com.bookstore.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "voucher")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Voucher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "code", nullable = false, unique = true)
    private String code;

    @NotBlank
    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false)
    private DiscountType discountType;

    @NotNull
    @Min(0)
    @Column(name = "discount_value", nullable = false)
    private Double discountValue;

    @Min(0)
    @Column(name = "min_order_value")
    private Double minOrderValue;

    @Min(0)
    @Column(name = "max_discount")
    private Double maxDiscount;

    @Min(0)
    @Column(name = "quantity")
    private Integer quantity;

    @Min(0)
    @Column(name = "used_count")
    @Builder.Default
    private Integer usedCount = 0;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private VoucherStatus status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum DiscountType {
        PERCENTAGE,
        FIXED_AMOUNT
    }

    public enum VoucherStatus {
        ACTIVE,
        INACTIVE,
        EXPIRED
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (usedCount == null) usedCount = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public boolean isValid() {
        LocalDateTime now = LocalDateTime.now();
        return status == VoucherStatus.ACTIVE
                && (startDate == null || now.isAfter(startDate))
                && (endDate == null || now.isBefore(endDate))
                && (quantity == null || usedCount < quantity);
    }

    public Integer getRemainingQuantity() {
        if (quantity == null) return null;
        return Math.max(0, quantity - usedCount);
    }
}