package com.bookstore.backend.service;

import com.bookstore.backend.DTO.CartItemsDTO;
import com.bookstore.backend.model.*;
import com.bookstore.backend.repository.*;
import com.bookstore.backend.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import com.bookstore.backend.DTO.CartResponseDTO;
import com.bookstore.backend.DTO.CartItemResponseDTO;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepo;
    private final CartItemRepository cartItemRepo;
    private final BookVariantsRepository bookVariantRepo;
    private final UserRepository userRepo;

    private Users getCurrentUser() {
        Users user = SecurityUtils.getCurrentUser();
        if (user == null) {
            throw new RuntimeException("Bạn chưa đăng nhập hoặc phiên đăng nhập hết hạn (401)");
        }
        return user;
    }

    // Get or create cart for user
    public Cart getOrCreateCart(Users user) {
        return cartRepo.findByUserId(user.getId())
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    return cartRepo.save(newCart);
                });
    }

    // Add to cart
    @Transactional
    public void addToCart(CartItemsDTO request) {
        Users currentUser = getCurrentUser();
        Cart cart = getOrCreateCart(currentUser);

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
    @Transactional
    public void updateItemQuantity(Long cartItemId, int newQuantity) {
        Users currentUser = getCurrentUser();
        CartItems item = cartItemRepo.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không có trong giỏ"));

        // Check if the cart item belongs to the user's cart
        if (!item.getCart().getUser().getId().equals(currentUser.getId())) {
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
    @Transactional
    public void removeItem(Long cartItemId) {
        Users currentUser = getCurrentUser();
        CartItems item = cartItemRepo.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Mục này không tồn tại"));

        if (item.getCart().getUser().getId().equals(currentUser.getId())) {
            cartItemRepo.delete(item);
        }
    }

    @Transactional(readOnly = true)
    public CartResponseDTO getMyCart() {
        Users currentUser = getCurrentUser();
        Long userId = currentUser.getId();

        Cart cart = cartRepo.findByUserId(userId).orElse(null);

        if (cart == null) {
            return new CartResponseDTO();
        }

        CartResponseDTO response = new CartResponseDTO();
        response.setCartId(cart.getId());

        // Convert List<CartItems> (Entity) sang List<CartItemResponseDTO> (DTO)
        List<CartItemResponseDTO> itemDTOs = cart.getCartItems().stream().map(item -> {
            CartItemResponseDTO dto = new CartItemResponseDTO();

            dto.setId(item.getId());
            dto.setQuantity(item.getQuantity());

            var variant = item.getBookVariant();
            if (variant != null) {
                dto.setBookVariantId(variant.getId());
                dto.setPrice(variant.getPrice());

                List<BookImages> images = variant.getImages();

                if (images != null && !images.isEmpty()) {
                    dto.setImage(images.get(0).getImageUrl());
                } else {
                    dto.setImage("https://via.placeholder.com/150");
                }

                if (variant.getPrice() != null) {
                    double price = variant.getPrice();
                    int qty = item.getQuantity();
                    dto.setSubTotal(price * qty);
                }

                var book = variant.getBook();
                if (book != null) {
                    dto.setBookTitle(book.getTitle());
                }
            }

            return dto;
        }).collect(Collectors.toList());

        response.setItems(itemDTOs);

        double total = 0.0;

        for (CartItemResponseDTO dto : itemDTOs) {
            total += dto.getSubTotal();
        }
        response.setTotalCartPrice(total);

        return response;
    }
}