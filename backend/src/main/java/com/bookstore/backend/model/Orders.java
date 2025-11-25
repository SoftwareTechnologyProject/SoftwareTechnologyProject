package com.bookstore.backend.model;

//import com.bookstore.backend.model.enums.StatusOrder;
//import com.bookstore.backend.model.enums.PaymentType;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Orders {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private Users user;

    @Column(nullable = false)
    private String shippingAddress;

    @Column(nullable = false)
    private String phoneNumber;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private String paymentType;

    @ManyToOne
    @JoinColumn(name = "voucher_code")
    private Voucher voucher;

    private LocalDateTime orderDate;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<OrderDetails> orderDetails;

    @PrePersist
    protected void onCreate() {
        orderDate = LocalDateTime.now();
    }
}