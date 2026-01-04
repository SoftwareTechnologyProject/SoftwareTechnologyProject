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

    public Map<String, Object> getRevenueCurrentYear() {
        LocalDateTime now = LocalDateTime.now();
        int currentYear = now.getYear();
        LocalDateTime startOfYear = LocalDateTime.of(currentYear, 1, 1, 0, 0, 0);
        LocalDateTime endOfYear = LocalDateTime.of(currentYear, 12, 31, 23, 59, 59);

        // Lấy tất cả orders trong năm hiện tại
        var orders = ordersRepository.findAllByOrderDateBetween(startOfYear, endOfYear);

        // Tạo map để lưu dữ liệu theo tháng (12 tháng)
        Map<Integer, MonthlyStats> monthlyStatsMap = new LinkedHashMap<>();
        
        // Khởi tạo 12 tháng với giá trị 0
        for (int i = 1; i <= 12; i++) {
            monthlyStatsMap.put(i, new MonthlyStats(0, 0.0));
        }

        // Tính toán thống kê cho từng order
        orders.forEach(order -> {
            int orderMonth = order.getOrderDate().getMonthValue();
            MonthlyStats stats = monthlyStatsMap.get(orderMonth);
            
            // Tính tổng số lượng sách và tổng tiền từ order details
            order.getOrderDetails().forEach(detail -> {
                stats.totalBooks += detail.getQuantity();
                stats.totalRevenue += detail.getQuantity() * detail.getPricePurchased();
            });
        });

        // Chuyển đổi sang format trả về
        List<String> months = new ArrayList<>();
        for (int i = 1; i <= 12; i++) {
            months.add("Tháng " + i);
        }
        
        List<Integer> booksSold = new ArrayList<>();
        List<Double> revenues = new ArrayList<>();
        for (int i = 1; i <= 12; i++) {
            MonthlyStats stats = monthlyStatsMap.get(i);
            booksSold.add(stats.totalBooks);
            revenues.add(stats.totalRevenue);
        }

        // Tính tổng
        int totalBooksSold = booksSold.stream().mapToInt(Integer::intValue).sum();
        double totalRevenue = revenues.stream().mapToDouble(Double::doubleValue).sum();

        Map<String, Object> result = new HashMap<>();
        result.put("year", currentYear);
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
