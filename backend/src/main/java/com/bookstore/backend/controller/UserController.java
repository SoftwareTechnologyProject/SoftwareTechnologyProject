package com.bookstore.backend.controller;

import java.util.List;

import com.bookstore.backend.DTO.UserDTO;
import com.bookstore.backend.service.UserService;
import lombok.RequiredArgsConstructor;
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
    @PutMapping("/update")
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
            
            // Không cho phép xóa OWNER
            if ("OWNER".equals(user.getRole().toString())) {
                return ResponseEntity.badRequest()
                        .body("Không thể xóa tài khoản chủ sở hữu");
            }
            
            userRepository.deleteById(id);
            return ResponseEntity.ok().body("Đã xóa người dùng thành công");
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body("Không thể xóa người dùng: " + e.getMessage());
        }
    }

//    // Đổi Password
//    @PutMapping
}