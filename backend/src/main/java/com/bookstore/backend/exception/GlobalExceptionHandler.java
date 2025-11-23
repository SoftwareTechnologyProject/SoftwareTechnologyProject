package com.bookstore.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice // apply cho tất cả các controller, để cá controller không cần phải viết try-catch
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class) // nếu trong quá trình chạy mà controller/service có ném ra ResourceNotFoundException thì sẽ gọi phương thức này để xử lý
    public ResponseEntity<Map<String, Object>> handleResourceNotFoundException(
            ResourceNotFoundException ex,
            WebRequest request) {

        Map<String, Object> errorDetails = new HashMap<>();
        errorDetails.put("timestamp", LocalDateTime.now());
        errorDetails.put("status", 404);
        errorDetails.put("erorr", "Not found");
        errorDetails.put("message", ex.getMessage());

        return new ResponseEntity<>(errorDetails, HttpStatus.NOT_FOUND);

        // Bạn có thể thêm handler cho IllegalArgumentException (400 Bad Request)
    }
}
