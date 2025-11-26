package com.bookstore.backend.DTO;

//import com.bookstore.backend.model.enums.BookStatus;
import jakarta.validation.constraints.*;
import lombok.*;
import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookDTO {

    private Long id;

    @NotBlank(message = "Title không được trống")
    private String title;

    private String description;

    private Integer publisherYear;

    // Publisher info
    private Long publisherId;
    private String publisherName;

    // Authors
    private Set<Long> authorIds;
    private Set<String> authorNames;

    // Categories
    private Set<Long> categoryIds;
    private Set<String> categoryNames;

    // Variants
    private List<BookVariantDTO> variants;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BookVariantDTO {
        private Long id;

        @NotNull(message = "Giá không được trống")
        @Min(value = 0, message = "Giá phải lớn hơn hoặc bằng 0")
        private Double price;

        @Min(value = 0, message = "Số lượng phải lớn hơn hoặc bằng 0")
        private Integer quantity;

        @Min(value = 0, message = "Số lượng đã bán phải lớn hơn hoặc bằng 0")
        private Integer sold;

        @NotNull(message = "Trạng thái không được trống")
        private String status; // dùng String thay vì enum

        private List<String> imageUrls;
    }
}