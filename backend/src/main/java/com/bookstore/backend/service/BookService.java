package com.bookstore.backend.service;

import com.bookstore.backend.DTO.BookDTO;
import com.bookstore.backend.DTO.BookDTO.BookVariantDTO;
import com.bookstore.backend.exception.ResourceNotFoundException;
import com.bookstore.backend.model.*;
import com.bookstore.backend.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class BookService {

    @Autowired
    private BookRepository bookRepository;

    // Lấy chi tiết sách theo ID
    public BookDTO getBookById(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));
        return convertToDTO(book);
    }

    // Lấy tất cả sách với pagination
    public Page<BookDTO> getAllBooks(Pageable pageable) {
        return bookRepository.findAll(pageable).map(this::convertToDTO);
    }

    // Tìm sách theo title
    public Page<BookDTO> getBooksByTitle(String keyword, Pageable pageable) {
        return bookRepository.findByTitle(keyword, pageable).map(this::convertToDTO);
    }

    // Tìm sách theo category
    public Page<BookDTO> getBooksByCategory(String categoryName, Pageable pageable) {
        return bookRepository.findByCategoriesName(categoryName, pageable).map(this::convertToDTO);
    }

    // Tìm sách theo author
    public Page<BookDTO> getBooksByAuthor(String authorName, Pageable pageable) {
        return bookRepository.findByAuthorsName(authorName, pageable).map(this::convertToDTO);
    }

    // Tìm sách theo publisher
    public Page<BookDTO> getBooksByPublisher(String publisherName, Pageable pageable) {
        return bookRepository.findByPublisherName(publisherName, pageable).map(this::convertToDTO);
    }

    // Tìm sách theo keyword
    public Page<BookDTO> getBookByKey(String keyword, Pageable pageable){
        return bookRepository.findByKey(keyword, pageable).map(this::convertToDTO);
    }

    // Tạo gợi ý
    public List<String> suggestKey(String keyword) {
        Pageable limit = PageRequest.of(0, 5);
        if (keyword == null){
            return List.of();
        }
        return bookRepository.findTop5Titles(keyword, limit);
    }

    // Tạo sách mới
    public BookDTO createBook(BookDTO dto) {
        Book book = convertToEntity(dto);
        Book saved = bookRepository.save(book);
        return convertToDTO(saved);
    }

    // Cập nhật sách
    public BookDTO updateBook(Long id, BookDTO dto) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));

        book.setTitle(dto.getTitle());
        book.setDescription(dto.getDescription());
        book.setPublisherYear(dto.getPublisherYear());

        // Map publisher
        if (dto.getPublisherId() != null) {
            Publisher publisher = new Publisher();
            publisher.setId(dto.getPublisherId());
            book.setPublisher(publisher);
        } else {
            book.setPublisher(null);
        }

        // Map authors
        if (dto.getAuthorIds() != null) {
            Set<Author> authors = dto.getAuthorIds().stream().map(aid -> {
                Author a = new Author();
                a.setId(aid);
                return a;
            }).collect(Collectors.toSet());
            book.setAuthors(authors);
        } else {
            book.setAuthors(new HashSet<>());
        }

        // Map categories
        if (dto.getCategoryIds() != null) {
            Set<Category> categories = dto.getCategoryIds().stream().map(cid -> {
                Category c = new Category();
                c.setId(cid);
                return c;
            }).collect(Collectors.toSet());
            book.setCategories(categories);
        } else {
            book.setCategories(new HashSet<>());
        }

        // Map variants
        if (dto.getVariants() != null) {
            book.getVariants().clear();
            for (BookVariantDTO vdto : dto.getVariants()) {
                BookVariants variant = new BookVariants();
                variant.setPrice(vdto.getPrice());
                variant.setQuantity(vdto.getQuantity());
                variant.setSold(vdto.getSold());
                variant.setStatus(vdto.getStatus());
                variant.setBook(book);
                // TODO: map image URLs nếu muốn
                book.getVariants().add(variant);
            }
        }

        Book updated = bookRepository.save(book);
        return convertToDTO(updated);
    }

    // Xóa sách
    public void deleteBook(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));
        bookRepository.delete(book);
    }

    // Chuyển entity -> DTO
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
            dto.setAuthorIds(book.getAuthors().stream().map(Author::getId).collect(Collectors.toSet()));
            dto.setAuthorNames(book.getAuthors().stream().map(Author::getName).collect(Collectors.toSet()));
        }

        if (book.getCategories() != null) {
            dto.setCategoryIds(book.getCategories().stream().map(Category::getId).collect(Collectors.toSet()));
            dto.setCategoryNames(book.getCategories().stream().map(Category::getName).collect(Collectors.toSet()));
        }

        if (book.getVariants() != null) {
            List<BookVariantDTO> variantDTOs = book.getVariants().stream().map(this::convertVariantToDTO).collect(Collectors.toList());
            dto.setVariants(variantDTOs);
        }

        return dto;
    }

    // Chuyển variant entity -> DTO
    private BookVariantDTO convertVariantToDTO(BookVariants variant) {
        BookVariantDTO vdto = new BookVariantDTO();
        vdto.setId(variant.getId());
        vdto.setPrice(variant.getPrice());
        vdto.setQuantity(variant.getQuantity());
        vdto.setSold(variant.getSold());
        vdto.setStatus(variant.getStatus());
        if (variant.getImages() != null) {
            vdto.setImageUrls(variant.getImages().stream().map(img -> img.getImageUrl()).collect(Collectors.toList()));
        }
        return vdto;
    }

    // Chuyển DTO -> entity
    public Book convertToEntity(BookDTO dto) {
        Book book = new Book();
        book.setTitle(dto.getTitle());
        book.setDescription(dto.getDescription());
        book.setPublisherYear(dto.getPublisherYear());

        // Map publisher
        if (dto.getPublisherId() != null) {
            Publisher publisher = new Publisher();
            publisher.setId(dto.getPublisherId());
            book.setPublisher(publisher);
        }

        // Map authors
        if (dto.getAuthorIds() != null) {
            Set<Author> authors = dto.getAuthorIds().stream().map(aid -> {
                Author a = new Author();
                a.setId(aid);
                return a;
            }).collect(Collectors.toSet());
            book.setAuthors(authors);
        }

        // Map categories
        if (dto.getCategoryIds() != null) {
            Set<Category> categories = dto.getCategoryIds().stream().map(cid -> {
                Category c = new Category();
                c.setId(cid);
                return c;
            }).collect(Collectors.toSet());
            book.setCategories(categories);
        }

        // Map variants
        if (dto.getVariants() != null) {
            for (BookVariantDTO vdto : dto.getVariants()) {
                BookVariants variant = new BookVariants();
                variant.setPrice(vdto.getPrice());
                variant.setQuantity(vdto.getQuantity());
                variant.setSold(vdto.getSold());
                variant.setStatus(vdto.getStatus());
                variant.setBook(book);
                book.getVariants().add(variant);
            }
        }

        return book;
    }
}
