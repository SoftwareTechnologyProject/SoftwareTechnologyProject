package com.bookstore.backend.service;

import com.bookstore.backend.repository.OrderDetailRepository;
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
    private final OrderDetailRepository orderDetailRepository;

    public Map<String, Object> getRevenueLast6Months() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime sixMonthsAgo = now.minusMonths(6).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);

        // Lấy tất cả orders trong 6 tháng gần nhất
        var orders = ordersRepository.findAllByOrderDateBetween(sixMonthsAgo, now);

        // Tạo map để lưu dữ liệu theo tháng
        Map<String, MonthlyStats> monthlyStatsMap = new LinkedHashMap<>();
        
        // Khởi tạo 6 tháng gần nhất với giá trị 0
        for (int i = 5; i >= 0; i--) {
            YearMonth yearMonth = YearMonth.now().minusMonths(i);
            String monthKey = yearMonth.format(DateTimeFormatter.ofPattern("MM/yyyy"));
            monthlyStatsMap.put(monthKey, new MonthlyStats(0, 0.0));
        }

        // Tính toán thống kê cho từng order
        orders.forEach(order -> {
            YearMonth orderMonth = YearMonth.from(order.getOrderDate());
            String monthKey = orderMonth.format(DateTimeFormatter.ofPattern("MM/yyyy"));
            
            if (monthlyStatsMap.containsKey(monthKey)) {
                MonthlyStats stats = monthlyStatsMap.get(monthKey);
                
                // Tính tổng số lượng sách và tổng tiền từ order details
                order.getOrderDetails().forEach(detail -> {
                    stats.totalBooks += detail.getQuantity();
                    stats.totalRevenue += detail.getQuantity() * detail.getPricePurchased();
                });
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
