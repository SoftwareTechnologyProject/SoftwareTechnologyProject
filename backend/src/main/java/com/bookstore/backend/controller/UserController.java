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
import org.springframework.web.bind.annotation.*;

import com.bookstore.backend.model.Users;
import com.bookstore.backend.repository.UserRepository;

@RestController
@RequestMapping("/users")
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
    @PutMapping("me/update")
    public ResponseEntity<UserDTO> updateInfo(
            @AuthenticationPrincipal UserDetails user,
            @RequestBody UserDTO userDTO
    ) {
        String email = user.getUsername();
        UserDTO newInfo = userService.updateUser(email, userDTO);
        return ResponseEntity.ok(newInfo);
    }

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