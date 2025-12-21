package com.bookstore.backend.repository;

import com.bookstore.backend.model.Category;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    // Tìm category theo tên (trả về Optional để tránh null)
    // Optional là lớp bao bọc giá trị, có thể rỗng hoặc có dữ liệu.
    // Giúp tránh lỗi NullPointerException khi không tìm thấy kết quả.
    Optional<Category> findByName(String name);

    // Tìm category theo tên (không phân biệt chữ hoa/thường)
    Optional<Category> findByNameIgnoreCase(String name);

    // Tìm tất cả category có tên chứa keyword (dùng cho chức năng search)
    List<Category> findByNameContainingIgnoreCase(String keyword);

    // Kiểm tra category có tồn tại trong DB hay không
    boolean existsByName(String name);
}
