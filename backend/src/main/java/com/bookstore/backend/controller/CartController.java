package com.bookstore.backend.controller;

import com.bookstore.backend.model.Cart;
import com.bookstore.backend.repository.CartRepository;
import com.bookstore.backend.DTO.AddToCartRequest;
import com.bookstore.backend.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @PostMapping("/add")
    public ResponseEntity<String> addToCart(@RequestParam Long userId,
                                            @RequestBody AddToCartRequest request) {
        cartService.addToCart(userId, request);
        return ResponseEntity.ok("Đã thêm sản phẩm vào giỏ hàng thành công!");
    }

    @PutMapping("/update/{cartItemId}")
    public ResponseEntity<String> updateQuantity(@PathVariable Long cartItemId,
                                                 @RequestParam Long userId,
                                                 @RequestParam int quantity) {
        cartService.updateItemQuantity(userId, cartItemId, quantity);
        return ResponseEntity.ok("Cập nhật số lượng thành công!");
    }

    @DeleteMapping("/remove/{cartItemId}")
    public ResponseEntity<String> removeItem(@PathVariable Long cartItemId,
                                             @RequestParam Long userId) {
        cartService.removeItem(userId, cartItemId);
        return ResponseEntity.ok("Đã xóa sản phẩm khỏi giỏ!");
    }
}