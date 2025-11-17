package com.bookstore.backend.controller;

import com.bookstore.backend.model.Book;
import com.bookstore.backend.service.BookService;

import org.springframework.beans.factory.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController // = @Controller + @ResponseBody, tự động convert sang JSON, không cần thêm
                // ResponseBody mỗi method
@RequestMapping("/books")
public class BookController {
    @Autowired
    private BookService bookService;

    // endpint 1: GET /books -> lấy tất cả sách
    @GetMapping
    public ResponseEntity<List<Book>> getAllBooks() {
        List<Book> books = bookService.getAllBooks();
        return ResponseEntity.ok(books); // trả về HTTP 200 cùng với list
    }

    // endpoint 2: GET /books/{id} -> lấy sách theo id
    @GetMapping("/{id}")
    public ResponseEntity<Book> getBookById(@PathVariable Long id) {
        Book books = bookService.getBookById(id);
        return ResponseEntity.ok(books);
    }

    // endpoint 3: POST /books
    @PostMapping
    public ResponseEntity<Book> createBook(@RequestBody Book book) { // @RequestBody nhận JSON từ body và chuyển thành Book
        Book savedBook = bookService.createBook(book);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedBook); // HTTP 201 created
    }

    // endpoint 4: PUT /books/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Book> updateBook(
            @PathVariable Long id, // lấy id từ URL
            @RequestBody Book book) { // lấy dữ liệu mới từ client
        Book updatedBook = bookService.updateBook(id, book);
        return ResponseEntity.ok(updatedBook);
    }

    // endpoint 5: DELETE /books/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        bookService.deleteBook(id);
        return ResponseEntity.noContent().build();
    }

}
