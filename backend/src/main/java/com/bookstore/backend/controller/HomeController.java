package com.bookstore.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;

@RestController
public class HomeController {

    @GetMapping("/")
    public Map<String, Object> home() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Welcome to Bookstore API");
        response.put("status", "running");
        response.put("endpoints", new String[]{
            "GET /users - Get all users",
            "POST /users - Create new user"
        });
        return response;
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "Bookstore Backend");
        return response;
    }
}