package com.bookstore.backend.controller;

import com.bookstore.backend.model.Author;
import com.bookstore.backend.repository.AuthorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/authors")
public class AuthorController {

    @Autowired
    private AuthorRepository authorRepository;

    /**
     * GET /api/authors
     * Lấy tất cả tác giả
     * → Dùng cho dropdown chọn tác giả trong form thêm sách (admin)
     */
    @GetMapping
    public ResponseEntity<List<Author>> getAllAuthors() {
        List<Author> authors = authorRepository.findAll();
        return ResponseEntity.ok(authors);
    }

    /**
     * GET /api/authors/{id}
     * Lấy thông tin chi tiết tác giả theo ID
     * → Dùng cho trang chi tiết tác giả
     */
    @GetMapping("/{id}")
    public ResponseEntity<Author> getAuthorById(@PathVariable Long id) {
        return authorRepository.findById(id)
                .map(ResponseEntity::ok)              // Nếu có thì trả về 200 + dữ liệu
                .orElse(ResponseEntity.notFound().build()); // Nếu không có thì trả về 404
    }

    /**
     * GET /api/authors/search?name=Robert
     * Tìm kiếm tác giả theo tên (không phân biệt hoa/thường)
     * → Dùng cho autocomplete search box
     */
    @GetMapping("/search")
    public ResponseEntity<Author> searchAuthor(@RequestParam String name) {
        return authorRepository.findByNameIgnoreCase(name)
                .map(ResponseEntity::ok)              // Nếu tìm thấy thì trả về 200 + dữ liệu
                .orElse(ResponseEntity.notFound().build()); // Nếu không tìm thấy thì trả về 404
    }
}
