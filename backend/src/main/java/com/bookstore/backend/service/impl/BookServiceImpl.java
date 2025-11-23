package com.bookstore.backend.service.impl;

import com.bookstore.backend.dto.BookDTO;
import com.bookstore.backend.dto.BookDTO.BookVariantDTO;
import com.bookstore.backend.exception.ResourceNotFoundException;
import com.bookstore.backend.model.*;
import com.bookstore.backend.repository.*;
import com.bookstore.backend.service.BookService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class BookServiceImpl implements BookService {
    @Autowired
    private BookRepository bookRepository;
    
    @Autowired
    private AuthorRepository authorRepository;
    
    @Autowired
    private PublisherRepository publisherRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private BookVariantsRepository bookVariantsRepository;
    
    @Autowired
    private BookImagesRepository bookImagesRepository;

    @Override
    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

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
        return bookRepository.save(book);
    }

    @Override
    public Book updateBook(Long id, Book bookDetails) {
        Book existingBook = getBookById(id);
        existingBook.setTitle(bookDetails.getTitle());
        existingBook.setDescription(bookDetails.getDescription());
        existingBook.setPublisher(bookDetails.getPublisher());
        existingBook.setPublisherYear(bookDetails.getPublisherYear());
        
        if (bookDetails.getAuthors() != null) {
            existingBook.setAuthors(bookDetails.getAuthors());
        }
        
        if (bookDetails.getCategories() != null) {
            existingBook.setCategories(bookDetails.getCategories());
        }
        
        return bookRepository.save(existingBook);
    }

    @Override
    public void deleteBook(Long id) {
        Book book = getBookById(id);
        bookRepository.delete(book);
    }

    @Override
    public List<Book> getBooksByCategory(String category) {
        return bookRepository.findByCategoriesNameIgnoreCase(category);
    }
    
    // Helper methods để convert Entity <-> DTO
    public BookDTO convertToDTO(Book book) {
        BookDTO dto = new BookDTO();
        dto.setId(book.getId());
        dto.setTitle(book.getTitle());
        dto.setDescription(book.getDescription());
        dto.setPublisherYear(book.getPublisherYear());
        
        if (book.getPublisher() != null) {
            dto.setPublisherId(book.getPublisher().getId());
            dto.setPublisherName(book.getPublisher().getName());
        }
        
        if (book.getAuthors() != null) {
            dto.setAuthorIds(book.getAuthors().stream()
                .map(Author::getId).collect(Collectors.toSet()));
            dto.setAuthorNames(book.getAuthors().stream()
                .map(Author::getName).collect(Collectors.toSet()));
        }
        
        if (book.getCategories() != null) {
            dto.setCategoryIds(book.getCategories().stream()
                .map(Category::getId).collect(Collectors.toSet()));
            dto.setCategoryNames(book.getCategories().stream()
                .map(Category::getName).collect(Collectors.toSet()));
        }
        
        if (book.getVariants() != null) {
            dto.setVariants(book.getVariants().stream()
                .map(this::convertVariantToDTO)
                .collect(Collectors.toList()));
        }
        
        return dto;
    }
    
    private BookVariantDTO convertVariantToDTO(BookVariants variant) {
        BookVariantDTO dto = new BookVariantDTO();
        dto.setId(variant.getId());
        dto.setPrice(variant.getPrice());
        dto.setQuantity(variant.getQuantity());
        dto.setSold(variant.getSold());
        dto.setStatus(variant.getStatus().name());
        
        if (variant.getImages() != null) {
            dto.setImageUrls(variant.getImages().stream()
                .map(BookImages::getImageUrl)
                .collect(Collectors.toList()));
        }
        
        return dto;
    }
    
    public Book convertToEntity(BookDTO dto) {
        Book book = new Book();
        book.setTitle(dto.getTitle());
        book.setDescription(dto.getDescription());
        book.setPublisherYear(dto.getPublisherYear());
        
        // Handle Publisher
        if (dto.getPublisherId() != null) {
            Publisher publisher = publisherRepository.findById(dto.getPublisherId())
                .orElseThrow(() -> new ResourceNotFoundException("Publisher", "id", dto.getPublisherId()));
            book.setPublisher(publisher);
        } else if (dto.getPublisherName() != null) {
            // Tạo mới nếu chưa tồn tại
            Publisher publisher = publisherRepository.findByName(dto.getPublisherName())
                .orElseGet(() -> {
                    Publisher newPublisher = new Publisher(dto.getPublisherName());
                    return publisherRepository.save(newPublisher);
                });
            book.setPublisher(publisher);
        }
        
        // Handle Authors
        if (dto.getAuthorNames() != null && !dto.getAuthorNames().isEmpty()) {
            Set<Author> authors = dto.getAuthorNames().stream()
                .map(name -> authorRepository.findByName(name)
                    .orElseGet(() -> authorRepository.save(new Author(name))))
                .collect(Collectors.toSet());
            book.setAuthors(authors);
        }
        
        // Handle Categories
        if (dto.getCategoryNames() != null && !dto.getCategoryNames().isEmpty()) {
            Set<Category> categories = dto.getCategoryNames().stream()
                .map(name -> categoryRepository.findByName(name)
                    .orElseGet(() -> categoryRepository.save(new Category(name))))
                .collect(Collectors.toSet());
            book.setCategories(categories);
        }
        
        return book;
    }
}
