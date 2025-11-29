package com.bookstore.backend.repository;

import com.bookstore.backend.model.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Long> {
    
    // Tìm voucher theo code
    Optional<Voucher> findByCode(String code);
    
    // Kiểm tra code đã tồn tại chưa
    boolean existsByCode(String code);
    
    // Tìm voucher theo status
    List<Voucher> findByStatus(Voucher.VoucherStatus status);
    
    // Tìm voucher đang active
    List<Voucher> findByStatusAndStartDateBeforeAndEndDateAfter(
        Voucher.VoucherStatus status, 
        LocalDateTime startDate, 
        LocalDateTime endDate
    );
    
    // Tìm voucher theo tên (tìm kiếm)
    List<Voucher> findByNameContainingIgnoreCase(String name);
    
    // Tìm voucher theo code hoặc name
    List<Voucher> findByCodeContainingIgnoreCaseOrNameContainingIgnoreCase(String code, String name);
}
