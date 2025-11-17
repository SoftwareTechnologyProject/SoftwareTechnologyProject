package com.bookstore.backend.service.impl;

import com.bookstore.backend.exception.ResourceNotFoundException;
import com.bookstore.backend.model.Book;
import com.bookstore.backend.repository.BookRepository;
import com.bookstore.backend.service.BookService;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BookServiceImpl implements BookService {
    @Autowired
    private BookRepository bookRepository;

    // Trả về toàn bộ sách
    @Override
    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    // Trả về sách theo Id, lỗi thì quăng ra ResourceNotFoundException
    @Override
    public Book getBookById(Long id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book", "id", id));
    }

    @Override
    public Book createBook(Book book) {
        if (book.getTitle() == null || book.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Title không được trống");
        }

        if (book.getCurrentPrice() != null && book.getCurrentPrice() < 0) {
            throw new IllegalArgumentException("Giá tiền không được âm");
        }

        book.setCreatedAt(LocalDateTime.now());
        book.setUpdatedAt(LocalDateTime.now());

        return bookRepository.save(book);
    }

    @Override
    public Book updateBook(Long id, Book bookDetails) {
        // láy sách theo id, nếu không thì quăng ra exception
        Book existingBook = getBookById(id);

        existingBook.setTitle(bookDetails.getTitle());
        existingBook.setAuthor(bookDetails.getAuthor());
        existingBook.setCurrentPrice(bookDetails.getCurrentPrice());

        existingBook.setUpdatedAt(LocalDateTime.now());

        return bookRepository.save(existingBook);
    }

    @Override
    public void deleteBook(Long id) {
        Book book = getBookById(id);

        bookRepository.delete(book);
    }

    @Override
    public List<Book> getBooksByCategory(String category) {
        return bookRepository.findByCategory(category);
    }
}
