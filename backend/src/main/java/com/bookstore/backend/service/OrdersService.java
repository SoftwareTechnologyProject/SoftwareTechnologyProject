package com.bookstore.backend.service;

import com.bookstore.backend.DTO.OrderDetailDTO;
import com.bookstore.backend.model.OrderDetail;
import com.bookstore.backend.model.Orders;
import com.bookstore.backend.model.Voucher;
import com.bookstore.backend.model.enums.PaymentType;
import com.bookstore.backend.model.enums.StatusOrder;
import com.bookstore.backend.repository.BookVariantsRepository;
import com.bookstore.backend.repository.OrdersRepository;
import com.bookstore.backend.repository.UserRepository;
import com.bookstore.backend.repository.VoucherRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

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
        User user = userRepository.findById((long) userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        order.setUser(user); // set user vào order

        order.setShipping_address(shippingAddress);
        order.setPhone_number(phoneNumber);
        order.setPaymentType(paymentType);
        order.setStatus(StatusOrder.PENDING);
        order.setOrderDate(java.sql.Date.valueOf(LocalDate.now())); // chuyển LocalDate → Date

        if (voucherCode != null) {
            Voucher voucher = voucherRepository.findById(voucherCode).orElse(null);
            order.setVoucher(voucher);
        }

        List<OrderDetail> orderDetails = details.stream().map(d -> {
            OrderDetail od = new OrderDetail();
            od.setOrders(order);
            od.setBookVariants(bookVariantsRepository.findById(d.getBookVariantsId()).orElse(null));
            od.setQuantity(d.getQuantity());
            od.setPricePurchased(d.getPricePurchased());
            return od;
        }).toList();

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
