package com.bookstore.backend.controller;

import java.util.List;

import com.bookstore.backend.DTO.ChangePassRequest;
import com.bookstore.backend.DTO.UserDTO;
import com.bookstore.backend.model.enums.AccountStatus;
import com.bookstore.backend.model.enums.StatusOrder;
import com.bookstore.backend.repository.OrdersRepository;
import com.bookstore.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.*;

import com.bookstore.backend.model.Users;
import com.bookstore.backend.repository.UserRepository;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private UserService userService;
    @Autowired
    private OrdersRepository ordersRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Users> getAllUsers() {
        return userRepository.findAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Users createUser(@RequestBody Users user) {
        return userRepository.save(user);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal UserDetails userDetails) {

        String email = userDetails.getUsername();  // email từ JWT

        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserDTO response = new UserDTO(
                user.getFullName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getAddress(),
                user.getDateOfBirth()

        );

        return ResponseEntity.ok(response);
    }

    // Cập nhật thông tin người dùng
    @PutMapping("me/update")
    public ResponseEntity<UserDTO> updateInfo(
            @AuthenticationPrincipal UserDetails user,
            @RequestBody UserDTO userDTO
    ) {
        String email = user.getUsername();
        UserDTO newInfo = userService.updateUser(email, userDTO);
        return ResponseEntity.ok(newInfo);
    }

    // Xóa người dùng (soft delete - chỉ admin)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            // Kiểm tra user có tồn tại không
            Users user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
            
            // Không cho phép xóa ADMIN
            if ("ADMIN".equals(user.getRole().toString())) {
                return ResponseEntity.badRequest()
                        .body("Không thể xóa tài khoản Admin");
            }
            
            // Kiểm tra user có đơn hàng đang xử lý không (PENDING hoặc DELIVERY)
            long activeOrders = ordersRepository.findByUsersId(id).stream()
                    .filter(order -> order.getStatus() == StatusOrder.PENDING || 
                                   order.getStatus() == StatusOrder.DELIVERY)
                    .count();
            
            if (activeOrders > 0) {
                return ResponseEntity.badRequest()
                        .body("Không thể xóa người dùng: Có " + activeOrders + 
                              " đơn hàng đang xử lý. Vui lòng hoàn thành hoặc hủy các đơn hàng trước.");
            }
            
            // SOFT DELETE: Chuyển trạng thái thành DELETED thay vì xóa khỏi database
            if (user.getAccount() != null) {
                user.getAccount().setStatus(AccountStatus.DELETED);
                userRepository.save(user);
                return ResponseEntity.ok().body("Đã vô hiệu hóa tài khoản người dùng thành công");
            } else {
                return ResponseEntity.badRequest()
                        .body("User không có account liên kết");
            }
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi xóa người dùng: " + e.getMessage());
        }
    }
    
    // Cập nhật trạng thái tài khoản (ACTIVE/LOCKED/DELETED)
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserStatus(
            @PathVariable Long id,
            @RequestParam AccountStatus status) {
        try {
            Users user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
            
            // Không cho phép thay đổi trạng thái ADMIN
            if ("ADMIN".equals(user.getRole().toString())) {
                return ResponseEntity.badRequest()
                        .body("Không thể thay đổi trạng thái tài khoản Admin");
            }
            
            if (user.getAccount() != null) {
                user.getAccount().setStatus(status);
                userRepository.save(user);
                return ResponseEntity.ok().body("Đã cập nhật trạng thái thành " + status);
            } else {
                return ResponseEntity.badRequest()
                        .body("User không có account liên kết");
            }
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi cập nhật trạng thái: " + e.getMessage());
        }
    }

//    // Đổi Password
//    @PutMapping
    // Đổi Password
    @PatchMapping("me/update/password")
    public ResponseEntity<?> updatePass(
            @AuthenticationPrincipal UserDetails user,
            @RequestBody ChangePassRequest request) {
        String email = user.getUsername();
        userService.changePass(request, email);
        return ResponseEntity.ok().build();
    }
}