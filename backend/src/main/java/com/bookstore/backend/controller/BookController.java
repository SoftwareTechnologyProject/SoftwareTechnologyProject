package com.bookstore.backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.bookstore.backend.DTO.BookDTO;
import com.bookstore.backend.service.BookService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/books")
public class BookController {

    @Autowired
    private BookService bookService;

    // GET /books -> lấy tất cả sách, hỗ trợ pagination và sort
    @GetMapping
    public ResponseEntity<List<BookDTO>> getAllBooks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        Page<BookDTO> bookPage = bookService.getAllBooks(pageable);
        return ResponseEntity.ok(bookPage.getContent());
    }

    // GET /books/{id} -> lấy sách theo ID
    @GetMapping("/{id}")
    public ResponseEntity<BookDTO> getBookById(@PathVariable Long id) {
        BookDTO bookDTO = bookService.getBookById(id);
        return ResponseEntity.ok(bookDTO);
    }

    // POST /books -> tạo sách mới
    @PostMapping
    public ResponseEntity<BookDTO> createBook(@Valid @RequestBody BookDTO bookDTO) {
        BookDTO saved = bookService.createBook(bookDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // PUT /books/{id} -> cập nhật sách theo ID
    @PutMapping("/{id}")
    public ResponseEntity<BookDTO> updateBook(
            @PathVariable Long id,
            @Valid @RequestBody BookDTO bookDTO) {
        BookDTO updated = bookService.updateBook(id, bookDTO);
        return ResponseEntity.ok(updated);
    }

    // DELETE /books/{id} -> xóa sách theo ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        bookService.deleteBook(id);
        return ResponseEntity.noContent().build();
    }

    // GET /books/search -> tìm kiếm sách theo title, isbn, category, author hoặc
    // publisher (có phân trang)
    @GetMapping("/search")
    public ResponseEntity<List<BookDTO>> searchBooks(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String isbn,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String author,
            @RequestParam(required = false) String publisher,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<BookDTO> bookPage;

        if (title != null) {
            bookPage = bookService.getBooksByTitle(title, pageable);
        } else if (isbn != null) {
            bookPage = bookService.getBooksByIsbn(isbn, pageable);
        } else if (category != null) {
            bookPage = bookService.getBooksByCategory(category, pageable);
        } else if (author != null) {
            bookPage = bookService.getBooksByAuthor(author, pageable);
        } else if (publisher != null) {
            bookPage = bookService.getBooksByPublisher(publisher, pageable);
        } else {
            bookPage = bookService.getAllBooks(pageable);
        }

        return ResponseEntity.ok(bookPage.getContent());
    }

    // GET /books/searchKey -> tìm kiếm sách theo keyword tổng hợp (title, category,
    // author, publisher)
    @GetMapping("/searchKey")
    public ResponseEntity<Page<BookDTO>> searchBooks(
            @RequestParam(required = false) String keyWord,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<BookDTO> bookPage;

        if (keyWord != null) {
            bookPage = bookService.getBookByKey(keyWord, pageable);
        } else {
            bookPage = bookService.getAllBooks(pageable);
        }

        return ResponseEntity.ok(bookPage);
    }

    // GET /books/suggest -> gợi ý tối đa 5 tiêu đề sách theo keyword (autocomplete)
    @GetMapping("/suggest")
    public List<String> suggest(@RequestParam String keyword) {
        return bookService.suggestKey(keyword);
    }

    // PATCH /books/variants/{variantId}/status -> cập nhật trạng thái (status) của một phiên bản sách (variant)
    @PatchMapping("/variants/{variantId}/status")
    public ResponseEntity<Void> updateVariantStatus(
            @PathVariable Long variantId,
            @RequestParam String status) {
        bookService.updateVariantStatus(variantId, status);
        return ResponseEntity.ok().build();
    }

    // POST /books/upload-image -> Upload hình ảnh sách lên S3 với validation
    @PostMapping("/upload-image")
    public ResponseEntity<Map<String, String>> uploadBookImage(@RequestParam("file") MultipartFile file) {
        try {
            // Validate file không null và không rỗng
            if (file == null || file.isEmpty()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "File không được để trống");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            // Validate content type (chỉ cho phép image)
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "File phải là hình ảnh (jpeg, png, webp)");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            // Validate file size (max 5MB)
            long maxSize = 5 * 1024 * 1024; // 5MB
            if (file.getSize() > maxSize) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Kích thước file vượt quá 5MB");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            // Upload to S3
            String imageUrl = bookService.uploadBookImage(file);
            Map<String, String> response = new HashMap<>();
            response.put("url", imageUrl);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Không thể tải hình ảnh lên. Vui lòng thử lại sau.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}