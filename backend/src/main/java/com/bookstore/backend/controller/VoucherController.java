package com.bookstore.backend.controller;

import com.bookstore.backend.DTO.VoucherDTO;
import com.bookstore.backend.model.Voucher;
import com.bookstore.backend.service.impl.VoucherServiceImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/vouchers")
@CrossOrigin(origins = "*")
public class VoucherController {

    @Autowired
    private VoucherServiceImpl voucherService;

    // GET /vouchers - Lấy tất cả voucher
    @GetMapping
    public ResponseEntity<List<VoucherDTO>> getAllVouchers() {
        List<Voucher> vouchers = voucherService.getAllVouchers();
        List<VoucherDTO> voucherDTOs = vouchers.stream()
                .map(voucherService::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(voucherDTOs);
    }

    // GET /vouchers/{id} - Lấy voucher theo ID
    @GetMapping("/{id}")
    public ResponseEntity<VoucherDTO> getVoucherById(@PathVariable Long id) {
        Voucher voucher = voucherService.getVoucherById(id);
        VoucherDTO voucherDTO = voucherService.convertToDTO(voucher);
        return ResponseEntity.ok(voucherDTO);
    }

    // GET /vouchers/code/{code} - Lấy voucher theo code
    @GetMapping("/code/{code}")
    public ResponseEntity<VoucherDTO> getVoucherByCode(@PathVariable String code) {
        Voucher voucher = voucherService.getVoucherByCode(code);
        VoucherDTO voucherDTO = voucherService.convertToDTO(voucher);
        return ResponseEntity.ok(voucherDTO);
    }

    // GET /vouchers/active - Lấy các voucher đang active
    @GetMapping("/active")
    public ResponseEntity<List<VoucherDTO>> getActiveVouchers() {
        List<Voucher> vouchers = voucherService.getActiveVouchers();
        List<VoucherDTO> voucherDTOs = vouchers.stream()
                .map(voucherService::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(voucherDTOs);
    }

    // GET /vouchers/search?keyword={keyword} - Tìm kiếm voucher
    @GetMapping("/search")
    public ResponseEntity<List<VoucherDTO>> searchVouchers(@RequestParam String keyword) {
        List<Voucher> vouchers = voucherService.searchVouchers(keyword);
        List<VoucherDTO> voucherDTOs = vouchers.stream()
                .map(voucherService::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(voucherDTOs);
    }

    // POST /vouchers - Tạo voucher mới
    @PostMapping
    public ResponseEntity<VoucherDTO> createVoucher(@Valid @RequestBody VoucherDTO voucherDTO) {
        Voucher voucher = voucherService.convertToEntity(voucherDTO);
        Voucher savedVoucher = voucherService.createVoucher(voucher);
        VoucherDTO savedVoucherDTO = voucherService.convertToDTO(savedVoucher);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedVoucherDTO);
    }

    // PUT /vouchers/{id} - Cập nhật voucher
    @PutMapping("/{id}")
    public ResponseEntity<VoucherDTO> updateVoucher(
            @PathVariable Long id,
            @Valid @RequestBody VoucherDTO voucherDTO) {
        Voucher voucherDetails = voucherService.convertToEntity(voucherDTO);
        Voucher updatedVoucher = voucherService.updateVoucher(id, voucherDetails);
        VoucherDTO updatedVoucherDTO = voucherService.convertToDTO(updatedVoucher);
        return ResponseEntity.ok(updatedVoucherDTO);
    }

    // DELETE /vouchers/{id} - Xóa voucher
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVoucher(@PathVariable Long id) {
        voucherService.deleteVoucher(id);
        return ResponseEntity.noContent().build();
    }

    // POST /vouchers/validate - Validate voucher code
    @PostMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateVoucher(@RequestBody Map<String, String> request) {
        String code = request.get("code");
        boolean isValid = voucherService.validateVoucher(code);
        
        Map<String, Object> response = new HashMap<>();
        response.put("code", code);
        response.put("isValid", isValid);
        
        if (isValid) {
            Voucher voucher = voucherService.getVoucherByCode(code);
            response.put("voucher", voucherService.convertToDTO(voucher));
        }
        
        return ResponseEntity.ok(response);
    }

    // POST /vouchers/apply - Apply voucher (increment used count)
    @PostMapping("/apply")
    public ResponseEntity<VoucherDTO> applyVoucher(@RequestBody Map<String, String> request) {
        String code = request.get("code");
        Voucher voucher = voucherService.applyVoucher(code);
        VoucherDTO voucherDTO = voucherService.convertToDTO(voucher);
        return ResponseEntity.ok(voucherDTO);
    }
}
