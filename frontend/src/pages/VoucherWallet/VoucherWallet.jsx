import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { IoTicketSharp, IoCopyOutline } from "react-icons/io5";
import { FiCheck } from "react-icons/fi";
import { BiSolidDiscount } from "react-icons/bi";
import { Link } from 'react-router-dom';
import './VoucherWallet.css';

const API_URL = 'http://localhost:8080/vouchers';
// const API_URL = 'http://localhost:8081/vouchers';

const VoucherWallet = () => {
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copiedCode, setCopiedCode] = useState(null);
    const [filter, setFilter] = useState('all'); // all, active, expired

    useEffect(() => {
        fetchVouchers();
    }, []);

    const fetchVouchers = async () => {
        try {
            setLoading(true);
            // Fetch all vouchers instead of only active ones
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error('Không thể tải danh sách voucher');
            }
            const data = await response.json();
            setVouchers(data);
            setError(null);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching vouchers:', err);
        } finally {
            setLoading(false);
        }
    };

    const copyVoucherCode = (code) => {
        navigator.clipboard.writeText(code).then(() => {
            setCopiedCode(code);
            setTimeout(() => setCopiedCode(null), 2000);
        });
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const isVoucherExpired = (endDate) => {
        return new Date(endDate) < new Date();
    };

    const isVoucherAvailable = (voucher) => {
        return voucher.quantity > voucher.usedCount && !isVoucherExpired(voucher.endDate);
    };

    const filteredVouchers = vouchers.filter(voucher => {
        if (filter === 'active') return isVoucherAvailable(voucher);
        if (filter === 'expired') return isVoucherExpired(voucher.endDate);
        return true;
    });

    return (
        <>
            <Header />
            
            <main className="voucher-wallet-container">
                <div className="wallet-header">
                    <div className="header-content">
                        <BiSolidDiscount className="header-icon" />
                        <div>
                            <h1>Ví Voucher</h1>
                            <p>Khám phá và sử dụng mã giảm giá để tiết kiệm chi phí</p>
                        </div>
                    </div>
                    
                    <div className="filter-tabs">
                        <button 
                            className={filter === 'all' ? 'active' : ''}
                            onClick={() => setFilter('all')}
                        >
                            Tất cả ({vouchers.length})
                        </button>
                        <button 
                            className={filter === 'active' ? 'active' : ''}
                            onClick={() => setFilter('active')}
                        >
                            Khả dụng ({vouchers.filter(v => isVoucherAvailable(v)).length})
                        </button>
                        <button 
                            className={filter === 'expired' ? 'active' : ''}
                            onClick={() => setFilter('expired')}
                        >
                            Hết hạn ({vouchers.filter(v => isVoucherExpired(v.endDate)).length})
                        </button>
                    </div>
                </div>

                {loading && (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Đang tải voucher...</p>
                    </div>
                )}

                {error && (
                    <div className="error-state">
                        <p>❌ {error}</p>
                        <button onClick={fetchVouchers} className="retry-btn">
                            Thử lại
                        </button>
                    </div>
                )}

                {!loading && !error && (
                    <div className="vouchers-grid">
                        {filteredVouchers.length === 0 ? (
                            <div className="empty-state">
                                <IoTicketSharp className="empty-icon" />
                                <h3>Không có voucher nào</h3>
                                <p>Hiện tại chưa có voucher khả dụng</p>
                                <Link to="/" className="browse-btn">
                                    Khám phá sản phẩm
                                </Link>
                            </div>
                        ) : (
                            filteredVouchers.map((voucher) => {
                                const isExpired = isVoucherExpired(voucher.endDate);
                                const isAvailable = isVoucherAvailable(voucher);
                                const discountText = voucher.discountType === 'PERCENTAGE' 
                                    ? `${voucher.discountValue}%`
                                    : formatPrice(voucher.discountValue);

                                return (
                                    <div 
                                        key={voucher.id} 
                                        className={`voucher-card ${isExpired ? 'expired' : ''} ${!isAvailable ? 'unavailable' : ''}`}
                                    >
                                        <div className="voucher-left">
                                            <div className="discount-badge">
                                                <span className="discount-value">{discountText}</span>
                                                <span className="discount-label">GIẢM</span>
                                            </div>
                                        </div>
                                        
                                        <div className="voucher-right">
                                            <div className="voucher-info">
                                                <h3 className="voucher-name">{voucher.name}</h3>
                                                <p className="voucher-description">{voucher.description}</p>
                                                
                                                <div className="voucher-details">
                                                    {voucher.minOrderValue > 0 && (
                                                        <p className="detail-item">
                                                            📦 Đơn tối thiểu: <strong>{formatPrice(voucher.minOrderValue)}</strong>
                                                        </p>
                                                    )}
                                                    {voucher.maxDiscount > 0 && voucher.discountType === 'PERCENTAGE' && (
                                                        <p className="detail-item">
                                                            🎯 Giảm tối đa: <strong>{formatPrice(voucher.maxDiscount)}</strong>
                                                        </p>
                                                    )}
                                                    <p className="detail-item">
                                                        📅 HSD: <strong>{formatDate(voucher.endDate)}</strong>
                                                    </p>
                                                    <p className="detail-item">
                                                        🎫 Còn lại: <strong>{voucher.quantity - voucher.usedCount}/{voucher.quantity}</strong>
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div className="voucher-action">
                                                <div className="voucher-code">
                                                    <code>{voucher.code}</code>
                                                </div>
                                                <button
                                                    className={`copy-btn ${copiedCode === voucher.code ? 'copied' : ''}`}
                                                    onClick={() => copyVoucherCode(voucher.code)}
                                                    disabled={!isAvailable}
                                                >
                                                    {copiedCode === voucher.code ? (
                                                        <>
                                                            <FiCheck /> Đã copy
                                                        </>
                                                    ) : (
                                                        <>
                                                            <IoCopyOutline /> Copy mã
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                            
                                            {isExpired && (
                                                <div className="voucher-status expired-badge">
                                                    ❌ Đã hết hạn
                                                </div>
                                            )}
                                            {!isExpired && voucher.quantity <= voucher.usedCount && (
                                                <div className="voucher-status soldout-badge">
                                                    ⚠️ Đã hết lượt sử dụng
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                <div className="wallet-info-section">
                    <h2>📌 Hướng dẫn sử dụng voucher</h2>
                    <div className="info-grid">
                        <div className="info-card">
                            <span className="step-number">1</span>
                            <h3>Chọn voucher phù hợp</h3>
                            <p>Xem điều kiện áp dụng và chọn voucher phù hợp với đơn hàng của bạn</p>
                        </div>
                        <div className="info-card">
                            <span className="step-number">2</span>
                            <h3>Copy mã voucher</h3>
                            <p>Nhấn nút "Copy mã" để sao chép mã voucher vào clipboard</p>
                        </div>
                        <div className="info-card">
                            <span className="step-number">3</span>
                            <h3>Áp dụng khi thanh toán</h3>
                            <p>Dán mã voucher vào ô "Mã giảm giá" khi thanh toán đơn hàng</p>
                        </div>
                    </div>
                </div>

                <div className="back-link">
                    <Link to="/account">← Quay lại tài khoản</Link>
                </div>
            </main>

            <Footer />
        </>
    );
};

export default VoucherWallet;
