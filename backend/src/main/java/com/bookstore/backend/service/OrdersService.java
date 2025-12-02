package com.bookstore.backend.service;

import com.bookstore.backend.DTO.OrderDetailDTO;
import com.bookstore.backend.DTO.OrdersDTO;
import com.bookstore.backend.model.OrderDetails;
import com.bookstore.backend.model.Orders;
import com.bookstore.backend.model.Users;
import com.bookstore.backend.model.Voucher;
import com.bookstore.backend.model.enums.PaymentType;
import com.bookstore.backend.model.enums.StatusOrder;
import com.bookstore.backend.repository.BookVariantsRepository;
import com.bookstore.backend.repository.OrdersRepository;
import com.bookstore.backend.repository.UserRepository;
import com.bookstore.backend.repository.VoucherRepository;
import org.springframework.stereotype.Service;

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

    public OrdersService(OrdersRepository ordersRepository,
                         BookVariantsRepository bookVariantsRepository,
                         VoucherRepository voucherRepository,
                         UserRepository userRepository) {
        this.ordersRepository = ordersRepository;
        this.bookVariantsRepository = bookVariantsRepository;
        this.voucherRepository = voucherRepository;
        this.userRepository = userRepository;
    }

    // ------------------- CREATE ORDER -------------------
    public OrdersDTO createOrder(Long userId, List<OrderDetailDTO> details, String voucherCode,
                                 PaymentType paymentType, String shippingAddress, String phoneNumber) {

        Orders order = new Orders();

        // Lấy User từ repository
        Users user = userRepository.findById(userId)
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
    public List<OrdersDTO> getOrdersByUser(int userId) {
        return ordersRepository.findByUsers_Id(userId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }


    // ------------------- UPDATE STATUS -------------------
    public OrdersDTO updateOrderStatus(int orderId, StatusOrder status) {
        Orders order = ordersRepository.findById(orderId).orElse(null);
        if (order == null) return null;

        order.setStatus(status);
        Orders updated = ordersRepository.save(order);

        return mapToDTO(updated);
    }


    // ------------------- GET ORDER BY ID -------------------
    public OrdersDTO getOrderById(int orderId) {
        return ordersRepository.findById(orderId)
                .map(this::mapToDTO)
                .orElse(null);
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
                                od.getPricePurchased()
                        ))
                        .collect(Collectors.toList())
        );

        return dto;
    }
}
