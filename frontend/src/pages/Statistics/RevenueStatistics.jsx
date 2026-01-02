import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient'; // Đảm bảo đường dẫn đúng
import toast, { Toaster } from 'react-hot-toast';

// Import Icons hiện đại (Elite Theme)
import { 
    IoStatsChart, IoWallet, IoBook, IoCalendarOutline, 
    IoTrendingUp, IoRefresh, IoCart, IoAlertCircleOutline,
    IoAnalytics
} from "react-icons/io5";

import './RevenueStatistics.css';

// Component Skeleton Loading cho Table
const TableSkeleton = () => (
    [...Array(5)].map((_, i) => (
        <tr key={i} className="animate-pulse">
            <td><div style={{height:'20px', width:'80px', background:'#f1f5f9', borderRadius:'4px'}}></div></td>
            <td align="center"><div style={{height:'20px', width:'40px', background:'#f1f5f9', borderRadius:'4px', margin:'0 auto'}}></div></td>
            <td align="right"><div style={{height:'20px', width:'100px', background:'#f1f5f9', borderRadius:'4px', marginLeft:'auto'}}></div></td>
            <td><div style={{height:'8px', width:'100%', background:'#f1f5f9', borderRadius:'4px'}}></div></td>
        </tr>
    ))
);

const RevenueStatistics = () => {
    const navigate = useNavigate();
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Kiểm tra đăng nhập
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            toast.error('Vui lòng đăng nhập để truy cập trang này');
            navigate('/login');
            return;
        }
    }, [navigate]);

    // Gọi API
    useEffect(() => {
        fetchStatistics();
    }, []);

    const fetchStatistics = async () => {
        try {
            setLoading(true);
            const response = await axiosClient.get('/statistics/revenue/last-6-months');
            
            // Log để kiểm tra dữ liệu nếu cần
            // console.log('Statistics data:', response.data);
            
            setStatistics(response.data);
            setError(null);
            
            if (!response.data.hasData) {
                toast('Chưa có dữ liệu đơn hàng thành công trong 6 tháng qua');
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Không thể tải dữ liệu thống kê';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // Helper: Định dạng tiền tệ VND
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    // Helper: Định dạng số
    const formatNumber = (num) => {
        return new Intl.NumberFormat('vi-VN').format(num);
    };

    // Helper: Lấy ngày hiện tại hiển thị Header
    const getCurrentDate = () => {
        const date = new Date();
        const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
        return `${days[date.getDay()]}, ${date.getDate()} tháng ${date.getMonth() + 1}, ${date.getFullYear()}`;
    };

    // Helper: Tính % cho thanh Progress Bar
    const calculatePercentage = (currentAmount, totalAmount) => {
        if (!totalAmount || totalAmount === 0) return 0;
        return ((currentAmount / totalAmount) * 100).toFixed(1);
    };

    // Màn hình lỗi
    if (error) {
        return (
            <div className="stats-container">
                <div className="error-message">
                    <IoAlertCircleOutline size={50} color="#ef4444" style={{marginBottom:'1rem'}}/>
                    <h3 style={{margin:'0 0 10px 0', color:'#1e293b'}}>Đã xảy ra lỗi</h3>
                    <p style={{color:'#64748b', marginBottom:'1.5rem'}}>{error}</p>
                    <button onClick={fetchStatistics} className="btn-refresh-icon" style={{width:'auto', padding:'8px 20px', borderRadius:'8px', margin:'0 auto', gap:'8px'}}>
                        <IoRefresh /> Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="stats-container">
            <Toaster position="top-right" />
            
            {/* --- 1. HEADER --- */}
            <div className="admin-header-card">
                <div className="header-content">
                    <h1 className="header-title">
                        <IoStatsChart style={{ color: 'var(--primary, #3b82f6)' }} /> Thống Kê Doanh Thu
                    </h1>
                    <div className="header-subtitle">
                        <IoCalendarOutline /> {getCurrentDate()}
                    </div>
                </div>
                
                <button 
                    className="btn-refresh-icon" 
                    onClick={() => {
                        fetchStatistics();
                        toast.success('Đã cập nhật dữ liệu');
                    }} 
                    title="Làm mới dữ liệu"
                >
                    <IoRefresh size={20} />
                </button>
            </div>

            {/* Chỉ render nội dung khi có object statistics */}
            {statistics && (
                <>
                    {/* --- 2. SUMMARY CARDS --- */}
                    <div className="stats-grid">
                        {/* Card 1: Doanh thu */}
                        <div className="stat-card revenue">
                            <div className="stat-icon-box"><IoWallet /></div>
                            <div className="stat-content">
                                <div className="stat-label">Tổng Doanh Thu</div>
                                <div className="stat-value">{formatCurrency(statistics.totalRevenue || 0)}</div>
                                <div className="stat-hint"><IoTrendingUp /> 6 tháng gần nhất</div>
                            </div>
                        </div>

                        {/* Card 2: Đơn hàng */}
                        <div className="stat-card orders">
                            <div className="stat-icon-box"><IoCart /></div>
                            <div className="stat-content">
                                <div className="stat-label">Đơn Hàng Thành Công</div>
                                <div className="stat-value">{formatNumber(statistics.totalOrders || 0)}</div>
                                <div className="stat-hint">Đã thanh toán</div>
                            </div>
                        </div>

                        {/* Card 3: Sách bán ra */}
                        <div className="stat-card books">
                            <div className="stat-icon-box"><IoBook /></div>
                            <div className="stat-content">
                                <div className="stat-label">Sách Đã Bán</div>
                                <div className="stat-value">
                                    {formatNumber(statistics.totalBooksSold || 0)} 
                                    <span style={{fontSize:'1rem', color:'#94a3b8', fontWeight:400, marginLeft:'4px'}}>cuốn</span>
                                </div>
                                <div className="stat-hint">Toàn hệ thống</div>
                            </div>
                        </div>
                    </div>

                    {/* --- 3. DETAILED TABLE --- */}
                    <div className="table-card">
                        <div className="table-header">
                            <div className="table-title">
                                <IoAnalytics style={{color:'#64748b'}}/> Chi Tiết Theo Tháng
                            </div>
                        </div>

                        <div style={{overflowX: 'auto'}}>
                            <table className="stats-table">
                                <thead>
                                    <tr>
                                        <th style={{width: '20%'}}>Tháng</th>
                                        <th style={{width: '20%'}} className="col-center">Sách bán ra</th>
                                        <th style={{width: '25%'}} className="col-right">Doanh thu</th>
                                        <th style={{width: '35%'}}>Tỷ trọng đóng góp</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <TableSkeleton />
                                    ) : (!statistics.hasData) ? (
                                        <tr>
                                            <td colSpan="4">
                                                <div className="empty-state">
                                                    <IoStatsChart size={48} style={{opacity:0.2, marginBottom:'1rem'}} />
                                                    <p>Chưa có dữ liệu đơn hàng thành công trong 6 tháng qua.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        <>
                                            {/* Mapping dữ liệu từ 3 mảng song song: months, booksSold, revenues */}
                                            {statistics.months.map((month, index) => {
                                                const booksSold = statistics.booksSold[index];
                                                const revenue = statistics.revenues[index];
                                                const percentage = calculatePercentage(revenue, statistics.totalRevenue);

                                                return (
                                                    <tr key={index}>
                                                        <td className="col-month">
                                                            Tháng {month}
                                                        </td>
                                                        <td className="col-center">
                                                            <span style={{fontWeight:'bold', color:'#3b82f6'}}>
                                                                {formatNumber(booksSold)}
                                                            </span>
                                                        </td>
                                                        <td className="col-right">
                                                            <span style={{fontWeight:'bold', color:'#10b981'}}>
                                                                {formatCurrency(revenue)}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div className="progress-wrapper">
                                                                <div className="progress-track">
                                                                    <div 
                                                                        className="progress-fill" 
                                                                        style={{width: `${percentage}%`}}
                                                                    ></div>
                                                                </div>
                                                                <span className="progress-text">{percentage}%</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            
                                            {/* Footer Total Row */}
                                            <tr className="total-row">
                                                <td>Tổng cộng</td>
                                                <td className="col-center">{formatNumber(statistics.totalBooksSold)}</td>
                                                <td className="col-right" style={{color:'#16a34a'}}>{formatCurrency(statistics.totalRevenue)}</td>
                                                <td></td>
                                            </tr>
                                        </>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default RevenueStatistics;