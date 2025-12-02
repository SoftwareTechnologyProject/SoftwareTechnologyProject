package com.bookstore.backend.service;

import com.bookstore.backend.DTO.OrderDetailDTO;
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
                         VoucherRepository voucherRepository,UserRepository userRepository) {
        this.ordersRepository = ordersRepository;
        this.bookVariantsRepository = bookVariantsRepository;
        this.voucherRepository = voucherRepository;
        this.userRepository = userRepository;
    }

    // Customer: tạo đơn hàng với nhiều orderDetail
    public Orders createOrder(int userId, List<OrderDetailDTO> details, String voucherCode,
                              PaymentType paymentType, String shippingAddress, String phoneNumber) {

        Orders order = new Orders();

        // Lấy User từ repository
        Users user = userRepository.findById((long) userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        order.setUsers(user); // set user vào order

        order.setShippingAddress(shippingAddress);
        order.setPhoneNumber(phoneNumber);
        order.setPaymentType(paymentType);
        order.setStatus(StatusOrder.PENDING);
        order.setOrderDate(LocalDateTime.now());

        if (voucherCode != null) {
            Voucher voucher = voucherRepository.findByCode(voucherCode).orElse(null);
            order.setVoucher(voucher);
        }

        Set<OrderDetails> orderDetails = details.stream().map(d -> {
            OrderDetails od = new OrderDetails();
            od.setOrders(order);
            od.setBookVariant(bookVariantsRepository.findById(d.getBookVariantsId()).orElse(null));
            od.setQuantity(d.getQuantity());
            od.setPricePurchased(d.getPricePurchased());
            return od;
        }).collect(Collectors.toSet());

        order.setOrderDetails(orderDetails);

        return ordersRepository.save(order);
    }


    public List<Orders> getOrdersByUser(int userId) {
        return ordersRepository.findByUsers_Id(userId);
    }

    public Orders updateOrderStatus(int orderId, StatusOrder status) {
        Orders order = ordersRepository.findById(orderId).orElse(null);
        if(order != null) {
            order.setStatus(status);
            ordersRepository.save(order);
        }
        return order;
    }

    public Orders getOrderById(int orderId) {
        return ordersRepository.findById(orderId).orElse(null);
    }

    public List<Orders> getAllOrders() {
        return ordersRepository.findAll();
    }
}
