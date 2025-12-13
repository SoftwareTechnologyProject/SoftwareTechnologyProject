package com.bookstore.backend.service;

import com.bookstore.backend.DTO.UserDTO;
import com.bookstore.backend.model.Users;
import com.bookstore.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService (UserRepository userRepository){
        this.userRepository = userRepository;
    }

    public UserDTO updateUser(String email, UserDTO dto) {

        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setFullName(dto.getFullName());

        user.setPhoneNumber(dto.getPhoneNumber());

        user.setAddress(dto.getAddress());

        user.setDateOfBirth(dto.getDateOfBirth());

        Users update = userRepository.save(user);

        return convertToDTO(update);
    }

    private UserDTO convertToDTO(Users user) {
        UserDTO dto = new UserDTO();
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setAddress(user.getAddress());
        dto.setDateOfBirth(user.getDateOfBirth());
        return dto;
    }
}