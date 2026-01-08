package com.bookstore.backend.service;

import com.bookstore.backend.DTO.ChangePassRequest;
import com.bookstore.backend.DTO.UserDTO;
import com.bookstore.backend.model.Account;
import com.bookstore.backend.model.Users;
import com.bookstore.backend.repository.AccountRepository;
import com.bookstore.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AccountRepository accountRepository;

    public UserService (UserRepository userRepository, PasswordEncoder passwordEncoder, AccountRepository accountRepository){
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.accountRepository = accountRepository;
    }

    public UserDTO getUser (String email) {
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return new UserDTO(
                user.getFullName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getAddress(),
                user.getDateOfBirth()
        );
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

    public void changePass (ChangePassRequest request, String email){
        Account currentAccount = accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPass(), currentAccount.getPassword())) {
            throw new IllegalStateException("Password incorrect");
        }

        if (!request.getConfirmPass().equals(request.getNewPass())) {
            throw new IllegalStateException("Password are not the same");
        }

        currentAccount.setPassword(passwordEncoder.encode(request.getNewPass()));
        accountRepository.save(currentAccount);
    }
}