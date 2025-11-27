package com.bookstore.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.util.Set;

@Entity
@Table(name = "author")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Author {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Tên tác giả không được trống")
    @Column(nullable = false)
    private String name;

    @ManyToMany(mappedBy = "authors")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<Book> books;
}