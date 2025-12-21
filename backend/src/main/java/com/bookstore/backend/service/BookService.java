package com.bookstore.backend.service;

import com.bookstore.backend.DTO.BookDTO;
import com.bookstore.backend.DTO.BookDTO.BookVariantDTO;
import com.bookstore.backend.exception.ResourceNotFoundException;
import com.bookstore.backend.exception.BusinessException;
import com.bookstore.backend.exception.DuplicateIsbnException;
import com.bookstore.backend.model.*;
import com.bookstore.backend.repository.BookRepository;
import com.bookstore.backend.repository.AuthorRepository;
import com.bookstore.backend.repository.CategoryRepository;
import com.bookstore.backend.repository.PublisherRepository;
import com.bookstore.backend.repository.CartItemRepository;
import com.bookstore.backend.repository.BookVariantsRepository;
import com.bookstore.backend.repository.OrderDetailRepository;
import org.springframework.beans.factory.annotation.Autowired;  
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
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

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private BookVariantsRepository bookVariantsRepository;

    @Autowired
    private OrderDetailRepository orderDetailRepository;

    @Autowired
    private S3Service s3Service;

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

        // Validate ISBN unique cho các variants
        if (dto.getVariants() != null) {
            for (BookVariantDTO variantDTO : dto.getVariants()) {
                if (variantDTO.getIsbn() != null && !variantDTO.getIsbn().isEmpty()) {
                    if (bookVariantsRepository.existsByIsbn(variantDTO.getIsbn())) {
                        throw new DuplicateIsbnException(
                                "ISBN đã tồn tại: " + variantDTO.getIsbn());
                    }
                }
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
                // Validate ISBN unique khi update (chỉ check nếu ISBN thay đổi)
                if (vdto.getIsbn() != null && !vdto.getIsbn().isEmpty()) {
                    // Nếu variant mới (id null) hoặc ISBN thay đổi
                    if (vdto.getId() == null) {
                        if (bookVariantsRepository.existsByIsbn(vdto.getIsbn())) {
                            throw new DuplicateIsbnException(
                                    "ISBN đã tồn tại: " + vdto.getIsbn());
                        }
                    } else {
                        // Check nếu ISBN thay đổi
                        BookVariants existingVariant = bookVariantsRepository.findById(vdto.getId()).orElse(null);
                        if (existingVariant == null || !vdto.getIsbn().equals(existingVariant.getIsbn())) {
                            if (bookVariantsRepository.existsByIsbn(vdto.getIsbn())) {
                                throw new DuplicateIsbnException(
                                        "ISBN đã tồn tại: " + vdto.getIsbn());
                            }
                        }
                    }
                }

                BookVariants variant = new BookVariants();
                if (vdto.getId() != null) {
                    variant.setId(vdto.getId());
                }
                variant.setPrice(vdto.getPrice());
                variant.setQuantity(vdto.getQuantity());
                variant.setSold(vdto.getSold());
                variant.setStatus(vdto.getStatus());
                variant.setIsbn(vdto.getIsbn());
                variant.setBook(book);
                // TODO: map image URLs nếu cần
                book.getVariants().add(variant);
            }
        }

        Book updated = bookRepository.save(book);
        return convertToDTO(updated);
    }

    public void deleteBook(Long id) {
        // Tìm book
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));

        // Check từng variant
        for (BookVariants variant : book.getVariants()) {
            // Check cart
            if (cartItemRepository.existsByBookVariantId(variant.getId())) {
                throw new BusinessException(
                        "Không thể xóa sách đang có trong giỏ hàng. " +
                                "Hãy chuyển sang trạng thái OUT_OF_STOCK.");
            }

            // Check orders
            if (orderDetailRepository.existsByBookVariantAndOrderNotCompleted(variant.getId())) {
                throw new BusinessException(
                        "Không thể xóa sách đang có đơn hàng chưa hoàn tất.");
            }
        }

        // Xóa (hoặc soft delete)
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
        vdto.setIsbn(variant.getIsbn());
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
                variant.setIsbn(vdto.getIsbn());
                variant.setBook(book); // gắn variant với book
                book.getVariants().add(variant);
            }
        }

        return book;
    }

    // Tìm sách theo ISBN (trả về Page<BookDTO>)
    public Page<BookDTO> getBooksByIsbn(String isbn, Pageable pageable) {
        List<Book> books = bookRepository.findByIsbn(isbn);
        List<BookDTO> bookDTOs = books.stream()
                .map(this::convertToDTO)
                .toList();
        return new PageImpl<>(bookDTOs, pageable, bookDTOs.size());
    }

    public void updateVariantStatus(Long variantId, String newStatus) {
        // Tìm variant
        BookVariants variants = bookVariantsRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Variant not found with id: " + variantId));

        // validate status
        if (!newStatus.equals("AVAILABLE") && !newStatus.equals("OUT_OF_STOCK")) {
            throw new IllegalArgumentException("Status must be AVAILABLE or OUT_OF_STOCK");
        }

        // Cập nhật
        variants.setStatus(newStatus);
        bookVariantsRepository.save(variants);
    }

    // Upload hình ảnh sách lên S3
    public String uploadBookImage(org.springframework.web.multipart.MultipartFile file) throws java.io.IOException {
        return s3Service.uploadFile(file);
    }

}
