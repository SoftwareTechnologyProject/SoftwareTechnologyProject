package com.bookstore.backend.repository;

import com.bookstore.backend.model.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
    Optional<Account> findByEmail(String email);
    Boolean existsByEmail(String email);

    @Query("SELECT a FROM Users u JOIN u.account a WHERE u.id = :userId ")
    Optional<Account> findAccountByUserId(@Param("userId") Long userId);
}

//Đã sửa