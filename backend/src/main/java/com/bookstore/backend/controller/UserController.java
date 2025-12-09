package com.bookstore.backend.controller;

//import com.bookstore.backend.DTO.UserDTO;
import com.bookstore.backend.repository.UserRepository;
//import com.bookstore.backend.service.UserService;
import com.bookstore.backend.model.Users;
import org.apache.catalina.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;
//    private UserService userService;

    @GetMapping
    public List<Users> getAllUsers() {
        return userRepository.findAll();
    }

    @PostMapping
    public Users createUser(@RequestBody Users user) {
        return userRepository.save(user);
    }

//    // Lấy thông tin người dùng hiện tại
//    @GetMapping("/me")
//    public Users getInfoUser(@AuthenticationPrincipal Users user) {
//        return user;
//    }
//
//    // Cập nhật thông tin người dùng
//    @PutMapping("/me")
//    public ResponseEntity<UserDTO> updateInfo(
//            @AuthenticationPrincipal Users user,
//            @RequestBody UserDTO userDTO
//    ) {
//        UserDTO newInfo = userService.updateUser(user.getId(), userDTO);
//        return ResponseEntity.ok(newInfo);
//    }

//    // Đổi Password
//    @PutMapping
}