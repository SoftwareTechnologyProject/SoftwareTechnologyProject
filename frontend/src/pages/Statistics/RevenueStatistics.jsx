import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axiosClient';
import { FaBook, FaMoneyBillWave, FaChartLine, FaSync } from 'react-icons/fa';
import './RevenueStatistics.css';

const RevenueStatistics = () => {
    const navigate = useNavigate();
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check authentication
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert('Vui lòng đăng nhập để truy cập trang này');
            navigate('/login');
            return;
        }
    }, [navigate]);

    // Lấy dữ liệu thống kê
    useEffect(() => {
        fetchStatistics();
    }, []);

    const fetchStatistics = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/statistics/revenue/last-6-months');
            console.log('Statistics data:', response.data);
            setStatistics(response.data);
            setError(null);
        } catch (err) {
            setError('Không thể tải dữ liệu thống kê. Vui lòng thử lại.');
            console.error('Error fetching statistics:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatNumber = (num) => {
        return new Intl.NumberFormat('vi-VN').format(num);
    };

    if (loading) {
        return (
            <div className="statistics-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="statistics-container">
                <div className="error-message">
                    <p>{error}</p>
                    <button onClick={fetchStatistics} className="retry-btn">Thử lại</button>
                </div>
            </div>
        );
    }

    if (!statistics) {
        return null;
    }

    return (
        <div className="statistics-container">
            <div className="page-header">
                <h1>Thống Kê Doanh Thu</h1>
                <p>Dữ liệu 6 tháng gần nhất</p>
            </div>

            {/* Summary Cards */}
            <div className="summary-cards">
                <div className="summary-card total-books">
                    <div className="card-icon"><FaBook /></div>
                    <div className="card-content">
                        <h3>Tổng Sách Đã Bán</h3>
                        <p className="card-value">{formatNumber(statistics.totalBooksSold)}</p>
                        <span className="card-label">cuốn</span>
                    </div>
                </div>

                <div className="summary-card total-revenue">
                    <div className="card-icon"><FaMoneyBillWave /></div>
                    <div className="card-content">
                        <h3>Tổng Doanh Thu</h3>
                        <p className="card-value">{formatCurrency(statistics.totalRevenue)}</p>
                        <span className="card-label">6 tháng qua</span>
                    </div>
                </div>

                <div className="summary-card average">
                    <div className="card-icon"><FaChartLine /></div>
                    <div className="card-content">
                        <h3>Trung Bình/Tháng</h3>
                        <p className="card-value">{formatCurrency(statistics.totalRevenue / 6)}</p>
                        <span className="card-label">doanh thu</span>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="statistics-table-container">
                <h2>Chi Tiết Theo Tháng</h2>
                <button onClick={fetchStatistics} className="refresh-btn">
                    <FaSync /> Làm mới
                </button>
                
                <table className="statistics-table">
                    <thead>
                        <tr>
                            <th>Tháng</th>
                            <th>Số Lượng Sách Đã Bán</th>
                            <th>Doanh Thu</th>
                        </tr>
                    </thead>
                    <tbody>
                        {statistics.months.map((month, index) => {
                            const booksSold = statistics.booksSold[index];
                            const revenue = statistics.revenues[index];
                            
                            return (
                                <tr key={index}>
                                    <td className="month-cell">
                                        <span className="month-badge">{month}</span>
                                    </td>
                                    <td className="books-cell">
                                        <span className="books-value">{formatNumber(booksSold)}</span>
                                        <span className="unit"> cuốn</span>
                                    </td>
                                    <td className="revenue-cell">
                                        <span className="revenue-value">{formatCurrency(revenue)}</span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot>
                        <tr className="total-row">
                            <td><strong>Tổng Cộng</strong></td>
                            <td>
                                <strong>{formatNumber(statistics.totalBooksSold)}</strong>
                                <span className="unit"> cuốn</span>
                            </td>
                            <td>
                                <strong>{formatCurrency(statistics.totalRevenue)}</strong>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default RevenueStatistics;
