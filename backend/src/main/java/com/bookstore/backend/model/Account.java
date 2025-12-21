package com.bookstore.backend.model;

import java.sql.Timestamp;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp; // <--- ĐÃ SỬA: Thay thế java.security.Timestamp

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


import com.fasterxml.jackson.annotation.JsonBackReference; // tui test thay vong lap JSON o day
@Entity
@Table(name = "accounts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "username", nullable = false, unique = true)
    private String username;

    @NotBlank
    @Column(name = "password", nullable = false)
    private String password;

<<<<<<< HEAD
    @NotNull
    @Column(name = "status", nullable = false)
    private String status;

    @OneToOne(mappedBy = "account", fetch = FetchType.LAZY)
    @JsonBackReference
=======
    // Relationship: accounts.userid -> users.id (Account is owner)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userid", referencedColumnName = "id")
>>>>>>> 4de5fe034b9d72f272eb9ac82c883abf26e6be79
    private Users user;


    @Column(unique = true)
    private String email;
    private String verifyOtp;
    private Boolean isAccountVerified;
    private Long verifyOtpExpiredAt;
    private String resetPasswordOtp;
    private Long resetOtpExpiredAt;
    private String verificationToken;

    @CreationTimestamp
    @Column(updatable = false)
    private Timestamp createdAt;

    @UpdateTimestamp
    private Timestamp updatedAt;
}