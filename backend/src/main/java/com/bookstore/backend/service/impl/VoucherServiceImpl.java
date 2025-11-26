package com.bookstore.backend.service.impl;

import com.bookstore.backend.dto.VoucherDTO;
import com.bookstore.backend.exception.ResourceNotFoundException;
import com.bookstore.backend.model.Voucher;
import com.bookstore.backend.repository.VoucherRepository;
import com.bookstore.backend.service.VoucherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class VoucherServiceImpl implements VoucherService {

    @Autowired
    private VoucherRepository voucherRepository;

    @Override
    public List<Voucher> getAllVouchers() {
        return voucherRepository.findAll();
    }

    @Override
    public Voucher getVoucherById(Long id) {
        return voucherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Voucher", "id", id));
    }

    @Override
    public Voucher getVoucherByCode(String code) {
        return voucherRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Voucher", "code", code));
    }

    @Override
    public Voucher createVoucher(Voucher voucher) {
        // Validate code uniqueness
        if (voucherRepository.existsByCode(voucher.getCode())) {
            throw new IllegalArgumentException("Mã voucher '" + voucher.getCode() + "' đã tồn tại");
        }

        // Validate dates
        if (voucher.getStartDate() != null && voucher.getEndDate() != null) {
            if (voucher.getEndDate().isBefore(voucher.getStartDate())) {
                throw new IllegalArgumentException("Ngày kết thúc phải sau ngày bắt đầu");
            }
        }

        // Validate discount value
        if (voucher.getDiscountType() == Voucher.DiscountType.PERCENTAGE) {
            if (voucher.getDiscountValue() > 100) {
                throw new IllegalArgumentException("Giảm giá theo phần trăm không được vượt quá 100%");
            }
        }

        return voucherRepository.save(voucher);
    }

    @Override
    public Voucher updateVoucher(Long id, Voucher voucherDetails) {
        Voucher existingVoucher = getVoucherById(id);

        // Check if code is being changed and if new code already exists
        if (!existingVoucher.getCode().equals(voucherDetails.getCode())) {
            if (voucherRepository.existsByCode(voucherDetails.getCode())) {
                throw new IllegalArgumentException("Mã voucher '" + voucherDetails.getCode() + "' đã tồn tại");
            }
        }

        // Validate dates
        if (voucherDetails.getStartDate() != null && voucherDetails.getEndDate() != null) {
            if (voucherDetails.getEndDate().isBefore(voucherDetails.getStartDate())) {
                throw new IllegalArgumentException("Ngày kết thúc phải sau ngày bắt đầu");
            }
        }

        // Validate discount value
        if (voucherDetails.getDiscountType() == Voucher.DiscountType.PERCENTAGE) {
            if (voucherDetails.getDiscountValue() > 100) {
                throw new IllegalArgumentException("Giảm giá theo phần trăm không được vượt quá 100%");
            }
        }

        // Update fields
        existingVoucher.setCode(voucherDetails.getCode());
        existingVoucher.setName(voucherDetails.getName());
        existingVoucher.setDescription(voucherDetails.getDescription());
        existingVoucher.setDiscountType(voucherDetails.getDiscountType());
        existingVoucher.setDiscountValue(voucherDetails.getDiscountValue());
        existingVoucher.setMinOrderValue(voucherDetails.getMinOrderValue());
        existingVoucher.setMaxDiscount(voucherDetails.getMaxDiscount());
        existingVoucher.setQuantity(voucherDetails.getQuantity());
        existingVoucher.setStartDate(voucherDetails.getStartDate());
        existingVoucher.setEndDate(voucherDetails.getEndDate());
        existingVoucher.setStatus(voucherDetails.getStatus());

        return voucherRepository.save(existingVoucher);
    }

    @Override
    public void deleteVoucher(Long id) {
        Voucher voucher = getVoucherById(id);
        voucherRepository.delete(voucher);
    }

    @Override
    public List<Voucher> searchVouchers(String keyword) {
        return voucherRepository.findByCodeContainingIgnoreCaseOrNameContainingIgnoreCase(keyword, keyword);
    }

    @Override
    public List<Voucher> getActiveVouchers() {
        LocalDateTime now = LocalDateTime.now();
        return voucherRepository.findByStatusAndStartDateBeforeAndEndDateAfter(
            Voucher.VoucherStatus.ACTIVE, 
            now, 
            now
        );
    }

    @Override
    public boolean validateVoucher(String code) {
        try {
            Voucher voucher = getVoucherByCode(code);
            return voucher.isValid();
        } catch (ResourceNotFoundException e) {
            return false;
        }
    }

    @Override
    public Voucher applyVoucher(String code) {
        Voucher voucher = getVoucherByCode(code);
        
        if (!voucher.isValid()) {
            throw new IllegalArgumentException("Voucher không hợp lệ hoặc đã hết hạn");
        }

        // Increment used count
        voucher.setUsedCount(voucher.getUsedCount() + 1);
        
        // Update status if quantity is reached
        if (voucher.getQuantity() != null && voucher.getUsedCount() >= voucher.getQuantity()) {
            voucher.setStatus(Voucher.VoucherStatus.EXPIRED);
        }

        return voucherRepository.save(voucher);
    }

    // Helper methods for DTO conversion
    public VoucherDTO convertToDTO(Voucher voucher) {
        VoucherDTO dto = new VoucherDTO();
        dto.setId(voucher.getId());
        dto.setCode(voucher.getCode());
        dto.setName(voucher.getName());
        dto.setDescription(voucher.getDescription());
        dto.setDiscountType(voucher.getDiscountType().name());
        dto.setDiscountValue(voucher.getDiscountValue());
        dto.setMinOrderValue(voucher.getMinOrderValue());
        dto.setMaxDiscount(voucher.getMaxDiscount());
        dto.setQuantity(voucher.getQuantity());
        dto.setUsedCount(voucher.getUsedCount());
        dto.setRemainingQuantity(voucher.getRemainingQuantity());
        dto.setStartDate(voucher.getStartDate());
        dto.setEndDate(voucher.getEndDate());
        dto.setStatus(voucher.getStatus().name());
        dto.setCreatedAt(voucher.getCreatedAt());
        dto.setUpdatedAt(voucher.getUpdatedAt());
        dto.setIsValid(voucher.isValid());
        return dto;
    }

    public Voucher convertToEntity(VoucherDTO dto) {
        Voucher voucher = new Voucher();
        voucher.setCode(dto.getCode());
        voucher.setName(dto.getName());
        voucher.setDescription(dto.getDescription());
        voucher.setDiscountType(Voucher.DiscountType.valueOf(dto.getDiscountType()));
        voucher.setDiscountValue(dto.getDiscountValue());
        voucher.setMinOrderValue(dto.getMinOrderValue());
        voucher.setMaxDiscount(dto.getMaxDiscount());
        voucher.setQuantity(dto.getQuantity());
        voucher.setStartDate(dto.getStartDate());
        voucher.setEndDate(dto.getEndDate());
        voucher.setStatus(Voucher.VoucherStatus.valueOf(dto.getStatus()));
        return voucher;
    }
}
