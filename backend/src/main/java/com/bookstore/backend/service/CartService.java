package com.bookstore.backend.service;

import com.bookstore.backend.DTO.CartItemsDTO;
import com.bookstore.backend.model.*;
import com.bookstore.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.HashSet;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepo;
    private final CartItemRepository cartItemRepo;
    private final BookVariantsRepository bookVariantRepo;
    private final UserRepository userRepo;

    // Get or create cart for user
    private Cart getOrCreateCart(Long userId) {
        return cartRepo.findByUserId(userId)
                .orElseGet(() -> {
                    Users user = userRepo.findById(userId)
                            .orElseThrow(() -> new RuntimeException("User không tồn tại"));
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    return cartRepo.save(newCart);
                });
    }

    // Add to cart
    @Transactional
    public void addToCart(Long userId, CartItemsDTO request) {
        Cart cart = getOrCreateCart(userId);

        if (cart.getCartItems() == null) {
            cart.setCartItems(new HashSet<>());
        }

        BookVariants variant = bookVariantRepo.findById(request.getBookVariantId())
                .orElseThrow(() -> new RuntimeException("Sách không tồn tại"));

        Optional<CartItems> existingItem = cart.getCartItems().stream()
                .filter(item -> item.getBookVariant().getId().equals(variant.getId()))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItems item = existingItem.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
            cartItemRepo.save(item);
        } else {
            CartItems newItem = new CartItems();
            newItem.setCart(cart);
            newItem.setBookVariant(variant);
            newItem.setQuantity(request.getQuantity());
            cartItemRepo.save(newItem);
        }
    }

    // Update item quantity in cart
    public void updateItemQuantity(Long userId, Long cartItemId, int newQuantity) {
        CartItems item = cartItemRepo.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không có trong giỏ"));

        // Check if the cart item belongs to the user's cart
        if (!item.getCart().getUser().getId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền sửa giỏ hàng người khác");
        }

        if (newQuantity <= 0) {
            cartItemRepo.delete(item);
            return;
        } else {
            item.setQuantity(newQuantity);
            cartItemRepo.save(item);
        }
    }

    // Remove item from cart
    public void removeItem(Long userId, Long cartItemId) {
        CartItems item = cartItemRepo.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Mục này không tồn tại"));

        if (item.getCart().getUser().getId().equals(userId)) {
            cartItemRepo.delete(item);
        }
    }
}