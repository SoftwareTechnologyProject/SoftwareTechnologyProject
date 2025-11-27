package com.bookstore.backend.service;

import com.bookstore.backend.model.Voucher;
import java.util.List;

public interface VoucherService {
    List<Voucher> getAllVouchers();
    Voucher getVoucherById(Long id);
    Voucher getVoucherByCode(String code);
    Voucher createVoucher(Voucher voucher);
    Voucher updateVoucher(Long id, Voucher voucherDetails);
    void deleteVoucher(Long id);
    List<Voucher> searchVouchers(String keyword);
    List<Voucher> getActiveVouchers();
    boolean validateVoucher(String code);
    Voucher applyVoucher(String code);
}
