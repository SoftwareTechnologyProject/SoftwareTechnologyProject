package com.bookstore.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.Objects;

import java.util.Objects;

@Entity
@Table(name = "book_images")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookImages {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "book_variant_id")
    @JsonIgnore
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private BookVariants bookVariant;

    @NotBlank(message = "URL hình ảnh không được trống")
    @Column(nullable = false)
    private String imageUrl;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        BookImages that = (BookImages) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
