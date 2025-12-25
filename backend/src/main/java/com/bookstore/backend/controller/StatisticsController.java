package com.bookstore.backend.controller;

import com.bookstore.backend.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
public class StatisticsController {

    private final StatisticsService statisticsService;

    @GetMapping("/revenue/last-6-months")
    public ResponseEntity<Map<String, Object>> getRevenueLast6Months() {
        return ResponseEntity.ok(statisticsService.getRevenueLast6Months());
    }
}
