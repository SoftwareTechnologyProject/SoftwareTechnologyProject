package com.bookstore.backend.controller;

import java.util.List;

import com.bookstore.backend.DTO.ChangePassRequest;
import com.bookstore.backend.DTO.UserDTO;
import com.bookstore.backend.DTO.UserResponseDTO;
import com.bookstore.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

    @GetMapping
    public List<Users> getAllUsers() {
        return userRepository.findAll();
    }

    @PostMapping
    public Users createUser(@RequestBody Users user) {
        return userRepository.save(user);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal UserDetails userDetails) {

        String email = userDetails.getUsername();  // email từ JWT

        UserDTO response = userService.getUser(email);

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

    // Xóa người dùng (chỉ admin)
    @DeleteMapping("/{id}")
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
            
            userRepository.deleteById(id);
            return ResponseEntity.ok().body("Đã xóa người dùng thành công");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Không thể xóa người dùng: User này có dữ liệu liên quan (giỏ hàng, đơn hàng...). Vui lòng xóa dữ liệu liên quan trước.");
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