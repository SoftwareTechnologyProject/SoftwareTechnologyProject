package com.bookstore.backend.exception;

// Tạo một cái exception tùy chỉnh để nếu không tìm thấy sách thì trả lỗi 404 chứ không phải là 500
// 500 thường là lỗi hệ thống, còn 404 là lỗi do người dùng yêu cầu tài nguyên không tồn tại
public class ResourceNotFoundException extends RuntimeException{
    public ResourceNotFoundException(String message) {
        super(message);
    }

    // Contructor với message tự động
    public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
        super(String.format("%s không tìm thấy với %s: '%s'", resourceName, fieldName, fieldValue));
    }
}
