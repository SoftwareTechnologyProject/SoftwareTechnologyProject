package com.bookstore.backend.service;

import com.bookstore.backend.DTO.BookDTO;
import com.bookstore.backend.DTO.BookDTO.BookVariantDTO;
import com.bookstore.backend.exception.ResourceNotFoundException;
import com.bookstore.backend.model.*;
import com.bookstore.backend.repository.BookRepository;
import com.bookstore.backend.repository.AuthorRepository;
import com.bookstore.backend.repository.CategoryRepository;
import com.bookstore.backend.repository.PublisherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class BookService {

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private AuthorRepository authorRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private PublisherRepository publisherRepository;

    // Lấy chi tiết sách theo ID
    public BookDTO getBookById(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));
        return convertToDTO(book);
    }

    // Lấy tất cả sách với phân trang
    public Page<BookDTO> getAllBooks(Pageable pageable) {
        return bookRepository.findAll(pageable).map(this::convertToDTO);
    }

    // Tìm sách theo tiêu đề
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

    // Tìm sách theo keyword (title, category, author, publisher)
    public Page<BookDTO> getBookByKey(String keyword, Pageable pageable) {
        return bookRepository.findByKey(keyword, pageable).map(this::convertToDTO);
    }

    // Gợi ý tối đa 5 tiêu đề sách theo keyword
    public List<String> suggestKey(String keyword) {
        Pageable limit = PageRequest.of(0, 5);
        if (keyword == null) {
            return List.of();
        }
        return bookRepository.findTop5Titles(keyword, limit);
    }

    // Tạo sách mới (validate publisher, author, category trước khi lưu)
    public BookDTO createBook(BookDTO dto) {
        // Kiểm tra publisher tồn tại
        if (dto.getPublisherId() != null) {
            publisherRepository.findById(dto.getPublisherId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Publisher not found with id: " + dto.getPublisherId()));
        }

        // Kiểm tra tất cả authors tồn tại
        if (dto.getAuthorIds() != null && !dto.getAuthorIds().isEmpty()) {
            for (Long authorId : dto.getAuthorIds()) {
                authorRepository.findById(authorId)
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Author not found with id: " + authorId));
            }
        }

        // Kiểm tra tất cả categories tồn tại
        if (dto.getCategoryIds() != null && !dto.getCategoryIds().isEmpty()) {
            for (Long categoryId : dto.getCategoryIds()) {
                categoryRepository.findById(categoryId)
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Category not found with id: " + categoryId));
            }
        }

        // Sau khi validate OK thì tạo book
        Book book = convertToEntity(dto);
        Book saved = bookRepository.save(book);
        return convertToDTO(saved);
    }

    // Cập nhật sách
    public BookDTO updateBook(Long id, BookDTO dto) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));

        // Cập nhật thông tin cơ bản
        book.setTitle(dto.getTitle());
        book.setDescription(dto.getDescription());
        book.setPublisherYear(dto.getPublisherYear());

        // Map publisher
        if (dto.getPublisherId() != null) {
            Publisher publisher = publisherRepository.findById(dto.getPublisherId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Publisher not found with id: " + dto.getPublisherId()));
            book.setPublisher(publisher);
        } else {
            book.setPublisher(null);
        }

        // Map authors
        if (dto.getAuthorIds() != null) {
            Set<Author> authors = new HashSet<>();
            for (Long authorId : dto.getAuthorIds()) {
                Author author = authorRepository.findById(authorId)
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Author not found with id: " + authorId));
                authors.add(author);
            }
            book.setAuthors(authors);
        } else {
            book.setAuthors(new HashSet<>());
        }

        // Map categories
        // Validate & Map categories
        if (dto.getCategoryIds() != null) {
            Set<Category> categories = new HashSet<>();
            for (Long categoryId : dto.getCategoryIds()) {
                Category category = categoryRepository.findById(categoryId)
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Category not found with id: " + categoryId));
                categories.add(category);
            }
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
                // TODO: map image URLs nếu cần
                book.getVariants().add(variant);
            }
        }

        Book updated = bookRepository.save(book);
        return convertToDTO(updated);
    }

    // Xóa sách theo ID
    public void deleteBook(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));
        bookRepository.delete(book);
    }

    // Chuyển entity -> DTO (để trả về client)
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
            List<BookVariantDTO> variantDTOs = book.getVariants().stream().map(this::convertVariantToDTO)
                    .collect(Collectors.toList());
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

    // Chuyển DTO -> entity (để lưu DB)
    public Book convertToEntity(BookDTO dto) {
        Book book = new Book();
        book.setTitle(dto.getTitle());
        book.setDescription(dto.getDescription());
        book.setPublisherYear(dto.getPublisherYear());

        // Map publisher
        if (dto.getPublisherId() != null) {
            Publisher publisher = publisherRepository.findById(dto.getPublisherId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Publisher not found with id: " + dto.getPublisherId()));
            book.setPublisher(publisher);
        }

        // Map authors
        if (dto.getAuthorIds() != null) {
            Set<Author> authors = new HashSet<>();
            for (Long authorId : dto.getAuthorIds()) {
                Author author = authorRepository.findById(authorId)
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Author not found with id: " + authorId));
                authors.add(author);
            }
            book.setAuthors(authors);
        } else {
            book.setAuthors(new HashSet<>());
        }

        // Map categories
        if (dto.getCategoryIds() != null) {
            Set<Category> categories = new HashSet<>();
            for (Long categoryId : dto.getCategoryIds()) {
                Category category = categoryRepository.findById(categoryId)
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Category not found with id: " + categoryId));
                categories.add(category);
            }
            book.setCategories(categories);
        } else {
            book.setCategories(new HashSet<>());
        }

        // Map variants (các phiên bản sách: giá, số lượng, trạng thái...)
        if (dto.getVariants() != null) {
            for (BookVariantDTO vdto : dto.getVariants()) {
                BookVariants variant = new BookVariants();
                variant.setPrice(vdto.getPrice());
                variant.setQuantity(vdto.getQuantity());
                variant.setSold(vdto.getSold());
                variant.setStatus(vdto.getStatus());
                variant.setBook(book); // gắn variant với book
                book.getVariants().add(variant);
            }
        }

        return book;
    }
}
