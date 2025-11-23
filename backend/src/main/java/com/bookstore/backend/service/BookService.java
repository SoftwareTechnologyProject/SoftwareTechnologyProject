package com.bookstore.backend.service;

import com.bookstore.backend.model.Book;

import java.util.List;;

public interface BookService { // Sử dụng interface để tự động tạo querry
    List<Book> getAllBooks();

    Book getBookById(Long id);
    Book createBook(Book book);
    Book updateBook(Long id, Book bookDetails);
    void deleteBook(Long id); // không cần trả về gì cả, chỉ cần xóa nên dùng void

    List<Book> getBooksByCategory(String category);
}
