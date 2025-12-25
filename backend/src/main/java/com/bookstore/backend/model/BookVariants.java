package com.bookstore.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "book_variants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookVariants {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "book_id")
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private Book book;

    @NotNull(message = "Giá không được trống")
    @Min(value = 0, message = "Giá phải lớn hơn hoặc bằng 0")
    @Column(nullable = false)
    private Double price;

    @Min(value = 0, message = "Số lượng phải lớn hơn hoặc bằng 0")
    @Builder.Default
    private Integer quantity = 0;

    @Min(value = 0, message = "Số lượng đã bán phải lớn hơn hoặc bằng 0")
    @Builder.Default
    private Integer sold = 0;

    @NotNull(message = "Trạng thái không được trống")
    @Column(nullable = false)
    private String status;

    private String format;
    private String size;
    private String edition;
    private Double weight;
    private String isbn;

    @OneToMany(mappedBy = "bookVariant", cascade = CascadeType.ALL, orphanRemoval = true)
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private List<BookImages> images;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        BookVariants that = (BookVariants) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
