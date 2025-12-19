package com.bookstore.backend.repository;

import com.bookstore.backend.model.Author;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AuthorRepository extends JpaRepository<Author, Long> {
    // Tìm tác giả theo tên (trả về Optional để tránh null)
    // Optional là lớp bao bọc giá trị, có thể rỗng (empty) hoặc có dữ liệu.
    // Giúp tránh lỗi NullPointerException khi không tìm thấy kết quả.
    Optional<Author> findByName(String name);

    // Kiểm tra xem tên tác giả đã tồn tại trong DB chưa
    boolean existsByName(String name);

    // Tìm tác giả theo tên, không phân biệt chữ hoa/thường
    Optional<Author> findByNameIgnoreCase(String name);
}
