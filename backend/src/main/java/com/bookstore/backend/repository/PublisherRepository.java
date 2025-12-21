package com.bookstore.backend.repository;

import com.bookstore.backend.model.Publisher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PublisherRepository extends JpaRepository<Publisher, Long> {
    // Tìm nhà xuất bản theo tên
    // Trả về Optional để tránh null (Optional có thể rỗng hoặc chứa dữ liệu)
    Optional<Publisher> findByName(String name);

    // Tìm theo tên (không phân biệt chữ hoa/thường)
    Optional<Publisher> findByNameIgnoreCase(String name);

    // Tìm tất cả publisher có tên chứa keyword (dùng cho chức năng search)
    List<Publisher> findByNameContainingIgnoreCase(String keyword);

    // Kiểm tra publisher có tồn tại trong DB hay không
    boolean existsByName(String name);
}
