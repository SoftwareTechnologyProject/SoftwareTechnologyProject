package com.bookstore.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Size;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Entity
@Table(name = "book")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Title không được để trống")
    @Column(nullable = false)
    private String title;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "publisher_id")
    private Publisher publisher;

    @Min(value = 1000, message = "Năm xuất bản phải từ năm 1000 trở đi")
    @Max(value = 2100, message = "Năm xuất bản không được vượt quá năm 2100")
    private Integer publisherYear;

    @Size(max = 10000, message = "Mô tả không được vượt quá 10000 ký tự")
    @Column(columnDefinition = "TEXT")
    private String description;

    private LocalDateTime publishedAt;

    private LocalDateTime updatedAt;

    @Builder.Default
    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean isDeleted = false;

    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "book_author",
            joinColumns = @JoinColumn(name = "book_id"),
            inverseJoinColumns = @JoinColumn(name = "author_id")
    )
    @Builder.Default
    private Set<Author> authors = new HashSet<>();

    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "book_category",
            joinColumns = @JoinColumn(name = "book_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    @Builder.Default
    private Set<Category> categories = new HashSet<>();

    @OneToMany(mappedBy = "book", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<BookVariants> variants = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        publishedAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void addVariant(BookVariants variant) {
        variants.add(variant);
        variant.setBook(this);
    }

    public void removeVariant(BookVariants variant) {
        variants.remove(variant);
        variant.setBook(null);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Book book = (Book) o;
        return Objects.equals(id, book.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
