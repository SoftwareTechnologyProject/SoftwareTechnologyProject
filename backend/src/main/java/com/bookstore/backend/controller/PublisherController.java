package com.bookstore.backend.controller;

import com.bookstore.backend.model.Publisher;
import com.bookstore.backend.repository.PublisherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/publishers")
public class PublisherController {

    @Autowired
    private PublisherRepository publisherRepository;

    /**
     * GET /api/publishers
     * Lấy tất cả nhà xuất bản
     * → Dùng cho dropdown chọn publisher trong form thêm sách (admin)
     */
    @GetMapping
    public ResponseEntity<List<Publisher>> getAllPublishers() {
        List<Publisher> publishers = publisherRepository.findAll();
        return ResponseEntity.ok(publishers);
    }

    /**
     * GET /api/publishers/{id}
     * Lấy thông tin chi tiết publisher theo ID
     * → Dùng cho trang chi tiết publisher
     */
    @GetMapping("/{id}")
    public ResponseEntity<Publisher> getPublisherById(@PathVariable Long id) {
        return publisherRepository.findById(id)
                .map(ResponseEntity::ok)              // Nếu có thì trả về 200 + dữ liệu
                .orElse(ResponseEntity.notFound().build()); // Nếu không có thì trả về 404
    }

    /**
     * GET /api/publishers/search?keyword=oreilly
     * Tìm kiếm publisher theo keyword (partial match, không phân biệt hoa/thường)
     * → Dùng cho filter publishers hoặc autocomplete
     */
    @GetMapping("/search")
    public ResponseEntity<List<Publisher>> searchPublishers(@RequestParam String keyword) {
        List<Publisher> publishers = publisherRepository.findByNameContainingIgnoreCase(keyword);
        return ResponseEntity.ok(publishers);
    }
}
