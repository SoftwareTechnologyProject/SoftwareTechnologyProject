package com.bookstore.backend.repository;

import java.util.Optional;

import com.bookstore.backend.model.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.bookstore.backend.model.Users;

@Repository
public interface UserRepository extends JpaRepository<Users, Long> {
    
    Optional<Users> findByEmail(String email);

    @Query("SELECT u FROM Users u JOIN FETCH u.account WHERE u.email = :email")
    Optional<Users> findByEmailWithAccount(@Param("email") String email);

    @Query("SELECT u FROM Users u JOIN FETCH u.account WHERE u.account.verificationToken = :token")
    Optional<Users> findByVerificationToken(@Param("token") String token);
    
    Boolean existsByEmail(String email);
}