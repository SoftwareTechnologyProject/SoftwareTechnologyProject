package com.bookstore.backend.controller;

import com.bookstore.backend.dto.BookDTO;
import com.bookstore.backend.model.Book;
import com.bookstore.backend.service.impl.BookServiceImpl;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/books")
public class BookController {
    @Autowired
    private BookServiceImpl bookService;

    // endpoint 1: GET /books -> lấy tất cả sách (trả về DTO)
    @GetMapping
    public ResponseEntity<List<BookDTO>> getAllBooks() {
        List<Book> books = bookService.getAllBooks();
        List<BookDTO> bookDTOs = books.stream()
                .map(bookService::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(bookDTOs);
    }

    // endpoint 2: GET /books/{id} -> lấy sách theo id (trả về DTO)
    @GetMapping("/{id}")
    public ResponseEntity<BookDTO> getBookById(@PathVariable Long id) {
        Book book = bookService.getBookById(id);
        BookDTO bookDTO = bookService.convertToDTO(book);
        return ResponseEntity.ok(bookDTO);
    }

    // endpoint 3: POST /books -> tạo sách mới (nhận DTO)
    @PostMapping
    public ResponseEntity<BookDTO> createBook(@Valid @RequestBody BookDTO bookDTO) {
        Book book = bookService.convertToEntity(bookDTO);
        Book savedBook = bookService.createBook(book);
        BookDTO savedBookDTO = bookService.convertToDTO(savedBook);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedBookDTO);
    }

    // endpoint 4: PUT /books/{id} -> cập nhật sách (nhận DTO)
    @PutMapping("/{id}")
    public ResponseEntity<BookDTO> updateBook(
            @PathVariable Long id,
            @Valid @RequestBody BookDTO bookDTO) {
        Book bookDetails = bookService.convertToEntity(bookDTO);
        Book updatedBook = bookService.updateBook(id, bookDetails);
        BookDTO updatedBookDTO = bookService.convertToDTO(updatedBook);
        return ResponseEntity.ok(updatedBookDTO);
    }

    // endpoint 5: DELETE /books/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        bookService.deleteBook(id);
        return ResponseEntity.noContent().build();
    }

    // endpoint 6: GET /books/category/{categoryName} -> lấy sách theo category
    @GetMapping("/category/{categoryName}")
    public ResponseEntity<List<BookDTO>> getBooksByCategory(@PathVariable String categoryName) {
        List<Book> books = bookService.getBooksByCategory(categoryName);
        List<BookDTO> bookDTOs = books.stream()
                .map(bookService::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(bookDTOs);
    }
}
