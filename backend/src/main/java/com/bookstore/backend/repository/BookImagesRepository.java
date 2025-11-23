package com.bookstore.backend.repository;

import com.bookstore.backend.model.BookImages;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookImagesRepository extends JpaRepository<BookImages, Long> {
    List<BookImages> findByBookVariantId(Long bookVariantId);
}
