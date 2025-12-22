package com.bookstore.backend.controller;

import com.bookstore.backend.model.Category;
import com.bookstore.backend.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    /**
     * GET /api/categories
     * Lấy tất cả category
     * → Dùng cho checkbox list trong form thêm sách (admin)
     */
    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        return ResponseEntity.ok(categories);
    }

    /**
     * GET /api/categories/{id}
     * Lấy thông tin chi tiết category theo ID
     * → Dùng cho trang chi tiết category
     */
    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(@PathVariable Long id) {
        return categoryRepository.findById(id)
                .map(ResponseEntity::ok)              // Nếu có thì trả về 200 + dữ liệu
                .orElse(ResponseEntity.notFound().build()); // Nếu không có thì trả về 404
    }

    /**
     * GET /api/categories/search?keyword=programming
     * Tìm kiếm category theo keyword (partial match, không phân biệt hoa/thường)
     * → Dùng cho filter categories hoặc autocomplete
     */
    @GetMapping("/search")
    public ResponseEntity<List<Category>> searchCategories(@RequestParam String keyword) {
        List<Category> categories = categoryRepository.findByNameContainingIgnoreCase(keyword);
        return ResponseEntity.ok(categories);
    }
}
