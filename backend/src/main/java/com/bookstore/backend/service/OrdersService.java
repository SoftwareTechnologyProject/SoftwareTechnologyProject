package com.bookstore.backend.service;

import com.bookstore.backend.DTO.OrderDetailDTO;
import com.bookstore.backend.DTO.OrdersDTO;
import com.bookstore.backend.exception.ResourceNotFoundException;
import com.bookstore.backend.model.*;
import com.bookstore.backend.model.enums.PaymentType;
import com.bookstore.backend.model.enums.StatusOrder;
import com.bookstore.backend.model.enums.UserRole;
import com.bookstore.backend.repository.*;
import com.bookstore.backend.utils.SecurityUtils;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

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


    public OrdersService(OrdersRepository ordersRepository, BookVariantsRepository bookVariantsRepository, VoucherRepository voucherRepository, UserRepository userRepository, OrderDetailRepository orderDetailRepository, SecurityUtils securityUtils) {
        this.ordersRepository = ordersRepository;
        this.bookVariantsRepository = bookVariantsRepository;
        this.voucherRepository = voucherRepository;
        this.userRepository = userRepository;
        this.orderDetailRepository = orderDetailRepository;
        this.securityUtils = securityUtils;
    }

    // ------------------- CREATE ORDER -------------------
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
        order.setOrderDate(LocalDateTime.now());

        // Voucher
        if (voucherCode != null) {
            Voucher voucher = voucherRepository.findByCode(voucherCode).orElse(null);
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

        Orders savedOrder = ordersRepository.save(order);
        return mapToDTO(savedOrder);
    }


    // ------------------- GET ORDERS BY USER -------------------
    public List<OrdersDTO> getOrdersByUser() {
        var userInfo = securityUtils.getCurrentUser();
        return ordersRepository.findByUsers_Id(userInfo.getId())
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }


    // ------------------- UPDATE STATUS -------------------
    public OrdersDTO updateOrderStatus(Long orderId, StatusOrder newStatus) {
        Orders order = ordersRepository.findById(orderId).orElse(null);
        if (order == null) return null;

        StatusOrder oldStatus = order.getStatus();

        try {
            // 1. DELIVERY → trừ kho
            if (oldStatus != StatusOrder.DELIVERY && newStatus == StatusOrder.DELIVERY) {
                deductVariantStock(orderId);
            }

            // 2. DELIVERY → RESTORE → hoàn kho
            if (oldStatus == StatusOrder.DELIVERY && newStatus == StatusOrder.RESTORE) {
                restoreVariantStock(orderId);
            }

            // 3. Cập nhật trạng thái
            order.setStatus(newStatus);
            Orders updated = ordersRepository.save(order);

            return mapToDTO(updated);

        } catch (RuntimeException ex) {
            // Ném exception có HTTP 400 và thông báo rõ ràng cho frontend
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage());
        }
    }


    // ------------------- GET ORDER BY ID -------------------
    public OrdersDTO getOrderById(Long orderId) {
        var currentUser = securityUtils.getCurrentUser();
        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order không tồn tại"));
        System.out.println(currentUser.getRole());
        // Kiểm tra quyền
        if (!order.getUsers().getId().equals(currentUser.getId())
                && currentUser.getRole() != UserRole.ADMIN) {
            System.out.println("Nguyễn Hữu Tâm");
            throw new AccessDeniedException("Bạn không có quyền xem đơn hàng này");
        }
        return mapToDTO(order);
    }


    // ------------------- GET ALL ORDERS -------------------
    public List<OrdersDTO> getAllOrders() {
        return ordersRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }


    // ------------------- MAPPER: Orders -> OrdersDTO -------------------
    private OrdersDTO mapToDTO(Orders order) {
        if (order == null) return null;

        OrdersDTO dto = new OrdersDTO();

        dto.setId(order.getId());
        dto.setUserId(order.getUsers() != null ? order.getUsers().getId() : null);
        dto.setShippingAddress(order.getShippingAddress());
        dto.setPhoneNumber(order.getPhoneNumber());
        dto.setPaymentType(order.getPaymentType());
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
        return dto;
    }
    private void deductVariantStock(Long orderId) {

        List<OrderDetails> details = orderDetailRepository.findByOrders_Id(orderId);

        for (OrderDetails detail : details) {
            BookVariants variant = detail.getBookVariant();

            int qty = detail.getQuantity();

            if (variant.getQuantity() < qty) {
                throw new RuntimeException("Không đủ hàng cho biến thể: " + variant.getId());
            }

            variant.setQuantity(variant.getQuantity() - qty);

            variant.setSold(variant.getSold() + qty);

            bookVariantsRepository.save(variant);
        }
    }
    private void restoreVariantStock(Long orderId) {

        List<OrderDetails> details = orderDetailRepository.findByOrders_Id(orderId);

        for (OrderDetails detail : details) {
            BookVariants variant = detail.getBookVariant();

            int qty = detail.getQuantity();

            variant.setQuantity(variant.getQuantity() + qty);

            variant.setSold(variant.getSold() - qty);

            bookVariantsRepository.save(variant);
        }
    }


}