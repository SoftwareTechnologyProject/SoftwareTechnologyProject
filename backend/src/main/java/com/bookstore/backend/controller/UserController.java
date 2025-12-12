package com.bookstore.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bookstore.backend.model.Users;
import com.bookstore.backend.repository.UserRepository;

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