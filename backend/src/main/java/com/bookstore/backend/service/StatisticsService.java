package com.bookstore.backend.service;

import com.bookstore.backend.model.enums.StatusOrder;
import com.bookstore.backend.repository.OrdersRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatisticsService {

    private final OrdersRepository ordersRepository;

    public Map<String, Object> getRevenueLast6Months() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime sixMonthsAgo = now.minusMonths(6).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);

        // Lấy tất cả orders trong 6 tháng gần nhất VÀ CHỈ TÍNH ĐƠN SUCCESS
        var orders = ordersRepository.findAllByOrderDateBetween(sixMonthsAgo, now)
                .stream()
                .filter(order -> order.getStatus() == StatusOrder.SUCCESS)
                .collect(Collectors.toList());

        // Tạo map để lưu dữ liệu theo tháng
        Map<String, MonthlyStats> monthlyStatsMap = new LinkedHashMap<>();
        
        // Khởi tạo 6 tháng gần nhất với giá trị 0
        for (int i = 5; i >= 0; i--) {
            YearMonth yearMonth = YearMonth.now().minusMonths(i);
            String monthKey = yearMonth.format(DateTimeFormatter.ofPattern("MM/yyyy"));
            monthlyStatsMap.put(monthKey, new MonthlyStats(0, 0.0));
        }

        // Tính toán thống kê cho từng order SUCCESS
        orders.forEach(order -> {
            YearMonth orderMonth = YearMonth.from(order.getOrderDate());
            String monthKey = orderMonth.format(DateTimeFormatter.ofPattern("MM/yyyy"));
            
            if (monthlyStatsMap.containsKey(monthKey)) {
                MonthlyStats stats = monthlyStatsMap.get(monthKey);
                
                // Tính tổng số lượng sách
                order.getOrderDetails().forEach(detail -> {
                    stats.totalBooks += detail.getQuantity();
                });
                
                // Doanh thu = totalAmount (đã trừ voucher discount)
                // Nếu totalAmount = null, tính từ orderDetails (legacy data)
                if (order.getTotalAmount() != null) {
                    stats.totalRevenue += order.getTotalAmount().doubleValue();
                } else {
                    // Fallback: tính từ pricePurchased (không có voucher discount)
                    order.getOrderDetails().forEach(detail -> {
                        stats.totalRevenue += detail.getQuantity() * detail.getPricePurchased();
                    });
                }
            }
        });

        // Chuyển đổi sang format trả về
        List<String> months = new ArrayList<>(monthlyStatsMap.keySet());
        List<Integer> booksSold = monthlyStatsMap.values().stream()
                .map(s -> s.totalBooks)
                .collect(Collectors.toList());
        List<Double> revenues = monthlyStatsMap.values().stream()
                .map(s -> s.totalRevenue)
                .collect(Collectors.toList());

        // Tính tổng
        int totalBooksSold = booksSold.stream().mapToInt(Integer::intValue).sum();
        double totalRevenue = revenues.stream().mapToDouble(Double::doubleValue).sum();

        Map<String, Object> result = new HashMap<>();
        result.put("months", months);
        result.put("booksSold", booksSold);
        result.put("revenues", revenues);
        result.put("totalBooksSold", totalBooksSold);
        result.put("totalRevenue", totalRevenue);
        result.put("totalOrders", orders.size());
        result.put("hasData", totalRevenue > 0); // Để frontend biết có dữ liệu hay không

        return result;
    }

    // Inner class để lưu thống kê theo tháng
    private static class MonthlyStats {
        int totalBooks;
        double totalRevenue;

        MonthlyStats(int totalBooks, double totalRevenue) {
            this.totalBooks = totalBooks;
            this.totalRevenue = totalRevenue;
        }
    }
}
