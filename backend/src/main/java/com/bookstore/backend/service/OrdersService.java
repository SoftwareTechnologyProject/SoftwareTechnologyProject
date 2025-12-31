package com.bookstore.backend.service;

import com.bookstore.backend.DTO.OrderDetailDTO;
import com.bookstore.backend.DTO.OrdersDTO;
import com.bookstore.backend.exception.ResourceNotFoundException;
import com.bookstore.backend.model.*;
import com.bookstore.backend.model.enums.PaymentType;
import com.bookstore.backend.model.enums.StatusOrder;
import com.bookstore.backend.model.enums.PaymentStatus;
import com.bookstore.backend.model.enums.UserRole;
import com.bookstore.backend.repository.*;
import com.bookstore.backend.utils.SecurityUtils;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class OrdersService {
    private final OrdersRepository ordersRepository;
    private final BookVariantsRepository bookVariantsRepository;
    private final VoucherRepository voucherRepository;
    private final UserRepository userRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final SecurityUtils securityUtils;
    private final CartService cartService;

    public OrdersService(OrdersRepository ordersRepository, BookVariantsRepository bookVariantsRepository, VoucherRepository voucherRepository, UserRepository userRepository, OrderDetailRepository orderDetailRepository, SecurityUtils securityUtils, CartService cartService) {
        this.ordersRepository = ordersRepository;
        this.bookVariantsRepository = bookVariantsRepository;
        this.voucherRepository = voucherRepository;
        this.userRepository = userRepository;
        this.orderDetailRepository = orderDetailRepository;
        this.securityUtils = securityUtils;
        this.cartService = cartService;
    }

    // ------------------- CREATE ORDER -------------------
    @Transactional
    public OrdersDTO createOrder(List<OrderDetailDTO> details, String voucherCode,
                                 PaymentType paymentType, String shippingAddress, String phoneNumber) {
        var userInfo = securityUtils.getCurrentUser();
        Orders order = new Orders();

        // Lấy User từ repository
        Users user = userRepository.findById(userInfo.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        order.setUsers(user);

        order.setShippingAddress(shippingAddress);
        order.setPhoneNumber(phoneNumber);
        order.setPaymentType(paymentType);
        order.setStatus(StatusOrder.PENDING);
        order.setPaymentStatus(PaymentStatus.PENDING);
        order.setOrderDate(LocalDateTime.now());

        // Voucher
        Voucher voucher = null;
        if (voucherCode != null) {
            voucher = voucherRepository.findByCode(voucherCode).orElse(null);
            order.setVoucher(voucher);
        }

        // Mapping OrderDetails
        Set<OrderDetails> orderDetails = details.stream().map(d -> {
            OrderDetails od = new OrderDetails();
            od.setOrders(order);
            od.setBookVariant(bookVariantsRepository.findById(d.getBookVariantId()).orElse(null));
            od.setQuantity(d.getQuantity());
            od.setPricePurchased(d.getPricePurchased());
            return od;
        }).collect(Collectors.toSet());

        order.setOrderDetails(orderDetails);
        // ===== TOTAL AMOUNT (SAU GIẢM GIÁ) =====
        BigDecimal totalAmount = calculateTotalAmount(orderDetails, voucher);
        order.setTotalAmount(totalAmount);

        Orders savedOrder = ordersRepository.save(order);

        List<Long> purchasedVariantIds = details.stream()
                .map(OrderDetailDTO::getBookVariantId)
                .collect(Collectors.toList());

        cartService.removePurchasedItems(purchasedVariantIds);

        return mapToDTO(savedOrder);
    }


    // ------------------- GET ORDERS BY USER -------------------
    public List<OrdersDTO> getOrdersByUser() {
        var userInfo = securityUtils.getCurrentUser();
        return ordersRepository.findByUsersId(userInfo.getId())
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }


    // ------------------- UPDATE STATUS -------------------
    public OrdersDTO updateOrderStatus(Long orderId, StatusOrder newStatus) {
        Orders order = ordersRepository.findById(orderId).orElse(null);
        if (order == null) return null;

        StatusOrder oldStatus = order.getStatus();

        // Validate status transitions
        validateStatusTransition(oldStatus, newStatus);

        try {
            // 1. PENDING/any → DELIVERY: Trừ kho
            if (oldStatus != StatusOrder.DELIVERY && newStatus == StatusOrder.DELIVERY) {
                deductVariantStock(orderId);
            }

            // 2. DELIVERY → CANCELLED: Hoàn kho (khách hủy đơn đang giao)
            if (oldStatus == StatusOrder.DELIVERY && newStatus == StatusOrder.CANCELLED) {
                restoreVariantStock(orderId);
            }

            // 3. DELIVERY → RESTORE: Hoàn kho (trả hàng)
            if (oldStatus == StatusOrder.DELIVERY && newStatus == StatusOrder.RESTORE) {
                restoreVariantStock(orderId);
            }

            // 4. Cập nhật trạng thái
            order.setStatus(newStatus);
            Orders updated = ordersRepository.save(order);

            return mapToDTO(updated);

        } catch (RuntimeException ex) {
            // Ném exception có HTTP 400 và thông báo rõ ràng cho frontend
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage());
        }
    }

    // Validate status transition logic
    private void validateStatusTransition(StatusOrder oldStatus, StatusOrder newStatus) {
        // Không được chuyển từ SUCCESS/CANCELLED sang trạng thái khác (trừ RESTORE)
        if (oldStatus == StatusOrder.SUCCESS && newStatus != StatusOrder.RESTORE) {
            throw new IllegalStateException("Không thể thay đổi đơn hàng đã hoàn thành");
        }
        
        if (oldStatus == StatusOrder.CANCELLED) {
            throw new IllegalStateException("Không thể thay đổi đơn hàng đã hủy");
        }

        // PENDING chỉ có thể chuyển sang DELIVERY hoặc CANCELLED
        if (oldStatus == StatusOrder.PENDING && 
            newStatus != StatusOrder.DELIVERY && 
            newStatus != StatusOrder.CANCELLED) {
            throw new IllegalStateException("Đơn chờ xử lý chỉ có thể Tiếp nhận hoặc Hủy");
        }

        // DELIVERY chỉ có thể chuyển sang SUCCESS, CANCELLED, hoặc RESTORE
        if (oldStatus == StatusOrder.DELIVERY && 
            newStatus != StatusOrder.SUCCESS && 
            newStatus != StatusOrder.CANCELLED && 
            newStatus != StatusOrder.RESTORE) {
            throw new IllegalStateException("Đơn đang giao chỉ có thể Hoàn thành, Hủy hoặc Trả hàng");
        }
    }


    // ------------------- GET ORDER BY ID -------------------
    public OrdersDTO getOrderById(Long orderId) {
        var currentUser = securityUtils.getCurrentUser();
        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order không tồn tại"));

        // Nếu có currentUser, kiểm tra quyền
        if (currentUser != null) {
            System.out.println(currentUser.getRole());
            // Kiểm tra quyền
            if (!order.getUsers().getId().equals(currentUser.getId())
                    && currentUser.getRole() != UserRole.ADMIN) {
                System.out.println("Nguyễn Hữu Tâm");
                throw new AccessDeniedException("Bạn không có quyền xem đơn hàng này");
            }
        }
        // Nếu currentUser = null (payment result callback), cho phép xem order
        return mapToDTO(order);
    }


    // ------------------- GET ALL ORDERS -------------------
    public List<OrdersDTO> getAllOrders() {
        return ordersRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }


    // ------------------- CALCULATE ORDER TOTAL AMOUNT -------------------
    public java.math.BigDecimal calculateOrderTotalAmount(Long orderId) {
        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        // Tính tổng tiền từ order details
        java.math.BigDecimal totalAmount = order.getOrderDetails().stream()
                .map(detail -> java.math.BigDecimal.valueOf(detail.getPricePurchased())
                        .multiply(java.math.BigDecimal.valueOf(detail.getQuantity())))
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

        // Áp dụng giảm giá từ voucher nếu có
        if (order.getVoucher() != null) {
            Voucher voucher = order.getVoucher();
            if (voucher.isValid()) {
                // Xử lý theo loại giảm giá
                if (voucher.getDiscountType() == Voucher.DiscountType.PERCENTAGE) {
                    // Giảm theo phần trăm
                    java.math.BigDecimal discount = totalAmount
                            .multiply(java.math.BigDecimal.valueOf(voucher.getDiscountValue()))
                            .divide(java.math.BigDecimal.valueOf(100));

                    // Áp dụng giới hạn giảm giá tối đa nếu có
                    if (voucher.getMaxDiscount() != null) {
                        java.math.BigDecimal maxDiscount = java.math.BigDecimal.valueOf(voucher.getMaxDiscount());
                        discount = discount.min(maxDiscount);
                    }
                    totalAmount = totalAmount.subtract(discount);
                } else {
                    // Giảm số tiền cố định
                    java.math.BigDecimal discount = java.math.BigDecimal.valueOf(voucher.getDiscountValue());
                    totalAmount = totalAmount.subtract(discount);
                }
            }
        }

        return totalAmount;
    }


    // ------------------- UPDATE PAYMENT STATUS -------------------
    public void updatePaymentStatus(Long orderId, PaymentStatus paymentStatus, PaymentType paymentType) {
        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        order.setPaymentStatus(paymentStatus);
        if (paymentType != null) {
            order.setPaymentType(paymentType);
        }

        ordersRepository.save(order);
    }


    // ------------------- GET ORDER BY ID (Long version) -------------------
    public Orders getOrderEntityById(Long orderId) {
        return ordersRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
    }


    // ------------------- MAPPER: Orders -> OrdersDTO -------------------
    private OrdersDTO mapToDTO(Orders order) {
        if (order == null) return null;

        OrdersDTO dto = new OrdersDTO();

        dto.setId(order.getId());
        dto.setUserId(order.getUsers() != null ? order.getUsers().getId() : null);
        dto.setUserFullName(order.getUsers().getFullName());
        dto.setShippingAddress(order.getShippingAddress());
        dto.setPhoneNumber(order.getPhoneNumber());
        dto.setPaymentType(order.getPaymentType());
        dto.setPaymentStatus(order.getPaymentStatus());
        dto.setStatus(order.getStatus());
        dto.setOrderDate(order.getOrderDate());

        if (order.getVoucher() != null) {
            dto.setVoucherCode(order.getVoucher().getCode());
        }

        // Mapping order details
        dto.setOrderDetails(
                order.getOrderDetails()
                        .stream()
                        .map(od -> new OrderDetailDTO(
                                od.getId(),
                                od.getBookVariant().getId(),
                                od.getBookVariant().getBook().getTitle(),
                                od.getQuantity(),
                                od.getPricePurchased(),

                                // total price
                                od.getQuantity() * od.getPricePurchased(),

                                // imageUrl (ảnh đầu tiên)
                                (od.getBookVariant().getImages() != null
                                        && !od.getBookVariant().getImages().isEmpty())
                                        ? od.getBookVariant().getImages().iterator().next().getImageUrl()
                                        : null
                        ))
                        .collect(Collectors.toList())
        );

        // Tính totalAmount trực tiếp từ order object thay vì gọi calculateOrderTotalAmount
        java.math.BigDecimal totalAmount = order.getOrderDetails().stream()
                .map(detail -> java.math.BigDecimal.valueOf(detail.getPricePurchased())
                        .multiply(java.math.BigDecimal.valueOf(detail.getQuantity())))
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

        // Áp dụng voucher discount nếu có
        if (order.getVoucher() != null) {
            Voucher voucher = order.getVoucher();
            if (voucher.isValid()) {
                if (voucher.getDiscountType() == Voucher.DiscountType.PERCENTAGE) {
                    java.math.BigDecimal discount = totalAmount
                            .multiply(java.math.BigDecimal.valueOf(voucher.getDiscountValue()))
                            .divide(java.math.BigDecimal.valueOf(100));

                    if (voucher.getMaxDiscount() != null) {
                        java.math.BigDecimal maxDiscount = java.math.BigDecimal.valueOf(voucher.getMaxDiscount());
                        discount = discount.min(maxDiscount);
                    }
                    totalAmount = totalAmount.subtract(discount);
                } else {
                    java.math.BigDecimal discount = java.math.BigDecimal.valueOf(voucher.getDiscountValue());
                    totalAmount = totalAmount.subtract(discount);
                }
            }
        }

        dto.setTotalAmount(totalAmount);

        return dto;
    }
    private void deductVariantStock(Long orderId) {

        List<OrderDetails> details = orderDetailRepository.findByOrdersId(orderId);

        for (OrderDetails detail : details) {
            BookVariants variant = detail.getBookVariant();

            int qty = detail.getQuantity();

            if (variant.getQuantity() < qty) {
                throw new RuntimeException("Không đủ hàng cho biến thể: " + variant.getId());
            }

            variant.setQuantity(variant.getQuantity() - qty);

            variant.setSold(variant.getSold() + qty);

            // Tự động chuyển status sang OUT_OF_STOCK khi quantity = 0
            if (variant.getQuantity() == 0) {
                variant.setStatus("OUT_OF_STOCK");
            }

            bookVariantsRepository.save(variant);
        }
    }
    private void restoreVariantStock(Long orderId) {

        List<OrderDetails> details = orderDetailRepository.findByOrdersId(orderId);

        for (OrderDetails detail : details) {
            BookVariants variant = detail.getBookVariant();

            int qty = detail.getQuantity();

            variant.setQuantity(variant.getQuantity() + qty);

            variant.setSold(variant.getSold() - qty);

            // Tự động chuyển status về AVAILABLE khi có hàng trở lại
            if (variant.getQuantity() > 0 && "OUT_OF_STOCK".equals(variant.getStatus())) {
                variant.setStatus("AVAILABLE");
            }

            bookVariantsRepository.save(variant);
        }
    }
    // ================= HELPER: TOTAL AMOUNT =================
    private BigDecimal calculateTotalAmount(Set<OrderDetails> details, Voucher voucher) {

        // 1. Tính tổng từ Double → BigDecimal
        BigDecimal total = details.stream()
                .map(d -> BigDecimal.valueOf(
                        d.getPricePurchased() * d.getQuantity()
                ))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 2. Áp dụng voucher
        if (voucher != null && voucher.isValid()) {

            if (voucher.getDiscountType() == Voucher.DiscountType.PERCENTAGE) {

                BigDecimal discount = total
                        .multiply(BigDecimal.valueOf(voucher.getDiscountValue()))
                        .divide(BigDecimal.valueOf(100));

                if (voucher.getMaxDiscount() != null) {
                    discount = discount.min(
                            BigDecimal.valueOf(voucher.getMaxDiscount())
                    );
                }

                total = total.subtract(discount);

            } else {
                total = total.subtract(
                        BigDecimal.valueOf(voucher.getDiscountValue())
                );
            }
        }

        return total.max(BigDecimal.ZERO);
    }
}