package com.bookstore.backend.controller;

import java.util.List;

import com.bookstore.backend.DTO.UserResponseDTO;
import com.bookstore.backend.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bookstore.backend.model.Users;
import com.bookstore.backend.repository.UserRepository;
import com.bookstore.backend.service.UserService;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepo;

    public Users getMyUser() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Bạn chưa đăng nhập (401)");
        }

        Object principal = authentication.getPrincipal();

        // Trường hợp 1: Token trả về String (Lỗi bạn đang gặp) -> Tự query DB
        if (principal instanceof String) {
            String emailOrUsername = (String) principal;
            return userRepo.findByEmail(emailOrUsername)
                    // Nếu login bằng username thì thêm dòng dưới:
                    // .or(() -> userRepository.findByUsername(emailOrUsername))
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy User: " + emailOrUsername));
        }

        // Trường hợp 2: Token trả về đúng Object Users
        if (principal instanceof Users) {
            return (Users) principal;
        }

        // Trường hợp 3: Token trả về UserDetails mặc định
        if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
            String email = ((org.springframework.security.core.userdetails.UserDetails) principal).getUsername();
            return userRepo.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy User: " + email));
        }

        throw new RuntimeException("Không xác định được người dùng!");
    }

    @Autowired
    private UserRepository userRepository;
    private UserService userService;

    @GetMapping
    public List<Users> getAllUsers() {
        return userRepository.findAll();
    }

    @PostMapping
    public Users createUser(@RequestBody Users user) {
        return userRepository.save(user);
    }

    @GetMapping("/profile")
    public ResponseEntity<UserResponseDTO> getMyProfile() {
        Users currentUser = getMyUser();

        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        UserResponseDTO userDTO = new UserResponseDTO();
        userDTO.setId(currentUser.getId());
        userDTO.setFullName(currentUser.getFullName());
        userDTO.setPhoneNumber(currentUser.getPhoneNumber());
        userDTO.setAddress(currentUser.getAddress());

        return ResponseEntity.ok(userDTO);
    }
}