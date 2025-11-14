package com.bookstore.backend.data;

import com.bookstore.backend.model.Book;
import java.util.List;
import java.util.Arrays;

public class BookData {
    
    public static List<Book> getSampleBooks() {
        return Arrays.asList(
            new Book(1, "Đắc Nhân Tâm", "Dale Carnegie", "Nhà Xuất Bản Tổng Hợp TP.HCM", 
                     "Cuốn sách kinh điển về nghệ thuật giao tiếp và ứng xử trong cuộc sống.", 86000, 100000, 
                     "https://via.placeholder.com/300x400?text=Dac+Nhan+Tam", 4.5, "320", "9786040032736", 
                     "Kỹ năng sống", 2018, "Tiếng Việt"),
            new Book(2, "Sapiens: Lược Sử Loài Người", "Yuval Noah Harari", "Nhà Xuất Bản Thế Giới", 
                     "Một cuốn sách đầy sức hút về lịch sử tiến hóa của loài người.", 174000, 200000, 
                     "https://via.placeholder.com/300x400?text=Sapiens", 4.8, "512", "9786041103640", 
                     "Lịch sử", 2020, "Tiếng Việt"),
            new Book(3, "Nhà Giả Kim", "Paulo Coelho", "Nhà Xuất Bản Hội Nhà Văn", 
                     "Câu chuyện về hành trình tìm kiếm kho báu và ý nghĩa cuộc sống.", 79000, 95000, 
                     "https://via.placeholder.com/300x400?text=Nha+Gia+Kim", 4.6, "227", "9786041011717", 
                     "Tiểu thuyết", 2019, "Tiếng Việt"),
            new Book(4, "Tôi Thấy Hoa Vàng Trên Cỏ Xanh", "Nguyễn Nhật Ánh", "Nhà Xuất Bản Trẻ", 
                     "Tác phẩm văn học thiếu nhi nổi tiếng của Việt Nam.", 108000, 120000, 
                     "https://via.placeholder.com/300x400?text=Hoa+Vang+Co+Xanh", 4.7, "368", "9786041032453", 
                     "Văn học Việt Nam", 2017, "Tiếng Việt"),
            new Book(5, "Atomic Habits", "James Clear", "Nhà Xuất Bản Thế Giới", 
                     "Sách về cách xây dựng thói quen tích cực và loại bỏ thói quen xấu.", 189000, 220000, 
                     "https://via.placeholder.com/300x400?text=Atomic+Habits", 4.9, "320", "9786041212346", 
                     "Kỹ năng sống", 2021, "Tiếng Việt"),
            new Book(6, "Think and Grow Rich", "Napoleon Hill", "Nhà Xuất Bản Tổng Hợp TP.HCM", 
                     "13 nguyên tắc nghĩ giàu làm giàu - bí quyết thành công.", 95000, 115000, 
                     "https://via.placeholder.com/300x400?text=Think+Grow+Rich", 4.4, "384", "9786041098765", 
                     "Kinh doanh", 2019, "Tiếng Việt")
        );
    }
}