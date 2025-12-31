package com.bookstore.backend.controller;

import com.bookstore.backend.DTO.CartItemsDTO;
import com.bookstore.backend.DTO.CartResponseDTO;
import com.bookstore.backend.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class CartController {

    private final CartService cartService;

    @PostMapping("/add")
    public ResponseEntity<String> addToCart(@RequestBody CartItemsDTO request) {
        cartService.addToCart(request);
        return ResponseEntity.ok("Đã thêm sản phẩm vào giỏ hàng thành công!");
    }

    @PutMapping("/update/{cartItemId}")
    public ResponseEntity<String> updateQuantity(@PathVariable Long cartItemId,
                                                 @RequestParam int quantity) {
        cartService.updateItemQuantity(cartItemId, quantity);
        return ResponseEntity.ok("Cập nhật số lượng thành công!");
    }

    @DeleteMapping("/remove/{cartItemId}")
    public ResponseEntity<String> removeItem(@PathVariable Long cartItemId) {
        cartService.removeItem(cartItemId);
        return ResponseEntity.ok("Đã xóa sản phẩm khỏi giỏ!");
    }

    @GetMapping("")
    public ResponseEntity<CartResponseDTO> getCart() {
        CartResponseDTO cartDTO = cartService.getMyCart();
        return ResponseEntity.ok(cartDTO);
    }
}