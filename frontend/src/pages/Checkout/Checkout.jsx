import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { toast } from 'react-toastify';
import './Checkout.css';

const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { items = [] } = location.state || {};

    // Thông tin khách hàng
    const [customerInfo, setCustomerInfo] = useState({
        fullName: '',
        phoneNumber: '',
        email: ''
    });

    // Địa chỉ giao hàng
    const [deliveryAddress, setDeliveryAddress] = useState({
        street: '',
        ward: '',
        district: '',
        city: ''
    });

    // Phương thức thanh toán
    const [paymentMethod, setPaymentMethod] = useState('CASH');

    // Voucher
    const [availableVouchers, setAvailableVouchers] = useState([]);
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const [loadingVouchers, setLoadingVouchers] = useState(false);

    // Loading state
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch user info và vouchers khi component mount
    useEffect(() => {
        fetchUserInfo();
        fetchAvailableVouchers();
    }, []);

    // Fetch thông tin user từ localStorage hoặc API
    const fetchUserInfo = async () => {
        try {
            const response = await axiosClient.get('/users/me');
            const user = response.data;
            
            setCustomerInfo({
                fullName: user.fullName || '',
                phoneNumber: user.phoneNumber || '',
                email: user.email || ''
            });

            // Nếu có địa chỉ mặc định
            if (user.address) {
                setDeliveryAddress({
                    street: user.address || '',
                    ward: '',
                    district: '',
                    city: ''
                });
            }
        } catch (error) {
            console.error('Error fetching user info:', error);
            if (error.response?.status === 401) {
                toast.error('Phiên đăng nhập hết hạn');
                navigate('/login');
            }
        }
    };

    // Fetch danh sách voucher khả dụng
    const fetchAvailableVouchers = async () => {
        setLoadingVouchers(true);
        try {
            const response = await axiosClient.get('/vouchers/active');
            const vouchers = response.data || [];
            
            // Filter vouchers phù hợp với tổng tiền đơn hàng
            const subtotal = calculateSubtotal();
            const eligibleVouchers = vouchers.filter(v => {
                return !v.minOrderValue || subtotal >= v.minOrderValue;
            });
            
            setAvailableVouchers(eligibleVouchers);
        } catch (error) {
            console.error('Error fetching vouchers:', error);
            toast.error('Không thể tải danh sách voucher');
        } finally {
            setLoadingVouchers(false);
        }
    };

    // Tính subtotal (tổng tiền hàng)
    const calculateSubtotal = () => {
        return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    // Tính shipping fee
    const shippingFee = 32000;

    // Tính discount từ voucher
    const calculateVoucherDiscount = () => {
        if (!selectedVoucher) return 0;

        const subtotal = calculateSubtotal();
        const voucher = availableVouchers.find(v => v.code === selectedVoucher);
        
        if (!voucher) return 0;

        let discount = 0;
        if (voucher.discountType === 'PERCENTAGE') {
            discount = subtotal * (voucher.discountValue / 100);
            // Áp dụng maxDiscount nếu có
            if (voucher.maxDiscount && discount > voucher.maxDiscount) {
                discount = voucher.maxDiscount;
            }
        } else if (voucher.discountType === 'FIXED_AMOUNT') {
            discount = voucher.discountValue;
        }

        return Math.min(discount, subtotal); // Không được giảm quá tổng tiền hàng
    };

    // Tính tổng tiền phải trả
    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        const discount = calculateVoucherDiscount();
        return subtotal + shippingFee - discount;
    };

    // Handle voucher selection
    const handleVoucherChange = (e) => {
        const voucherCode = e.target.value;
        setSelectedVoucher(voucherCode || null);
        
        if (voucherCode) {
            const voucher = availableVouchers.find(v => v.code === voucherCode);
            if (voucher) {
                toast.success(`Đã áp dụng voucher: ${voucher.name}`);
            }
        }
    };

    // Handle input changes
    const handleCustomerInfoChange = (e) => {
        setCustomerInfo({
            ...customerInfo,
            [e.target.name]: e.target.value
        });
    };

    const handleAddressChange = (e) => {
        setDeliveryAddress({
            ...deliveryAddress,
            [e.target.name]: e.target.value
        });
    };

    // Validate form
    const validateForm = () => {
        if (!customerInfo.fullName.trim()) {
            toast.error('Vui lòng nhập họ tên');
            return false;
        }
        if (!customerInfo.phoneNumber.trim()) {
            toast.error('Vui lòng nhập số điện thoại');
            return false;
        }
        if (!deliveryAddress.street.trim() || !deliveryAddress.city.trim()) {
            toast.error('Vui lòng nhập đầy đủ địa chỉ giao hàng');
            return false;
        }
        if (items.length === 0) {
            toast.error('Giỏ hàng trống');
            return false;
        }
        return true;
    };

    // Submit order
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            // Chuẩn bị data để gửi lên backend
            const fullAddress = `${deliveryAddress.street}, ${deliveryAddress.ward ? deliveryAddress.ward + ', ' : ''}${deliveryAddress.district ? deliveryAddress.district + ', ' : ''}${deliveryAddress.city}`.trim();

            const orderData = {
                details: items.map(item => ({
                    bookVariantId: item.bookVariantId,
                    quantity: item.quantity,
                    pricePurchased: item.price
                })),
                voucherCode: selectedVoucher || null,
                paymentType: paymentMethod,
                shippingAddress: fullAddress,
                phoneNumber: customerInfo.phoneNumber
            };

            console.log('Submitting order:', orderData);

            const response = await axiosClient.post('/orders', orderData);

            console.log('Order response:', response.data);

            if (response.data && response.data.id) {
                const orderId = response.data.id;
                toast.success('Đặt hàng thành công!');

                // Nếu thanh toán VNPAY, tạo payment và redirect
                if (paymentMethod === 'BANKING' || paymentMethod === 'VNPAY') {
                    try {
                        const paymentResponse = await axiosClient.post('/payment/create', {
                            orderId: orderId
                        });

                        if (paymentResponse.data && paymentResponse.data.paymentUrl) {
                            // Redirect đến VNPay
                            window.location.href = paymentResponse.data.paymentUrl;
                        } else {
                            toast.error('Không thể tạo link thanh toán');
                            navigate(`/orders/${orderId}`);
                        }
                    } catch (paymentError) {
                        console.error('Payment creation error:', paymentError);
                        toast.error('Lỗi tạo thanh toán, vui lòng thanh toán sau');
                        navigate(`/orders/${orderId}`);
                    }
                } else {
                    // COD - redirect tới trang chi tiết đơn hàng
                    navigate(`/orders/${orderId}`);
                }
            } else {
                throw new Error('Không nhận được thông tin đơn hàng');
            }

        } catch (error) {
            console.error('Error submitting order:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi đặt hàng';
            toast.error(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Redirect if no items
    if (items.length === 0) {
        return (
            <div className="checkout-container">
                <div className="checkout-empty">
                    <h2>Giỏ hàng trống</h2>
                    <p>Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán</p>
                    <button onClick={() => navigate('/')} className="btn-back-home">
                        Về trang chủ
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-container">
            <div className="checkout-content">
                <h1 className="checkout-title">Thanh toán đơn hàng</h1>

                <form onSubmit={handleSubmit} className="checkout-form">
                    {/* Left Column - Customer Info & Address */}
                    <div className="checkout-left">
                        {/* Thông tin khách hàng */}
                        <div className="checkout-section">
                            <h2 className="section-title">Thông tin khách hàng</h2>
                            <div className="form-group">
                                <label htmlFor="fullName">Họ và tên *</label>
                                <input
                                    type="text"
                                    id="fullName"
                                    name="fullName"
                                    value={customerInfo.fullName}
                                    onChange={handleCustomerInfoChange}
                                    required
                                    placeholder="Nhập họ tên"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="phoneNumber">Số điện thoại *</label>
                                <input
                                    type="tel"
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    value={customerInfo.phoneNumber}
                                    onChange={handleCustomerInfoChange}
                                    required
                                    placeholder="Nhập số điện thoại"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={customerInfo.email}
                                    onChange={handleCustomerInfoChange}
                                    placeholder="Nhập email (không bắt buộc)"
                                />
                            </div>
                        </div>

                        {/* Địa chỉ giao hàng */}
                        <div className="checkout-section">
                            <h2 className="section-title">Địa chỉ giao hàng</h2>
                            <div className="form-group">
                                <label htmlFor="street">Địa chỉ cụ thể *</label>
                                <input
                                    type="text"
                                    id="street"
                                    name="street"
                                    value={deliveryAddress.street}
                                    onChange={handleAddressChange}
                                    required
                                    placeholder="Số nhà, tên đường"
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="ward">Phường/Xã</label>
                                    <input
                                        type="text"
                                        id="ward"
                                        name="ward"
                                        value={deliveryAddress.ward}
                                        onChange={handleAddressChange}
                                        placeholder="Phường/Xã"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="district">Quận/Huyện</label>
                                    <input
                                        type="text"
                                        id="district"
                                        name="district"
                                        value={deliveryAddress.district}
                                        onChange={handleAddressChange}
                                        placeholder="Quận/Huyện"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="city">Tỉnh/Thành phố *</label>
                                <input
                                    type="text"
                                    id="city"
                                    name="city"
                                    value={deliveryAddress.city}
                                    onChange={handleAddressChange}
                                    required
                                    placeholder="Tỉnh/Thành phố"
                                />
                            </div>
                        </div>

                        {/* Phương thức thanh toán */}
                        <div className="checkout-section">
                            <h2 className="section-title">Phương thức thanh toán</h2>
                            <div className="payment-methods">
                                <label className="payment-option">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="CASH"
                                        checked={paymentMethod === 'CASH'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <span className="payment-label">
                                        <strong>COD</strong> - Thanh toán khi nhận hàng
                                    </span>
                                </label>
                                <label className="payment-option">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="BANKING"
                                        checked={paymentMethod === 'BANKING'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <span className="payment-label">
                                        <strong>VNPAY</strong> - Thanh toán qua cổng VNPAY
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="checkout-right">
                        <div className="order-summary">
                            <h2 className="summary-title">Thông tin đơn hàng</h2>

                            {/* Danh sách sản phẩm */}
                            <div className="order-items">
                                {items.map((item, index) => (
                                    <div key={index} className="order-item">
                                        <img src={item.image} alt={item.name} className="item-image" />
                                        <div className="item-info">
                                            <h4 className="item-name">{item.name}</h4>
                                            <p className="item-quantity">Số lượng: {item.quantity}</p>
                                        </div>
                                        <div className="item-price">
                                            {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Voucher Selector */}
                            <div className="voucher-section">
                                <label htmlFor="voucherSelect" className="voucher-label">
                                    🎟️ Chọn voucher giảm giá
                                </label>
                                <select
                                    id="voucherSelect"
                                    className="voucher-select"
                                    value={selectedVoucher || ''}
                                    onChange={handleVoucherChange}
                                    disabled={loadingVouchers}
                                >
                                    <option value="">-- Không sử dụng voucher --</option>
                                    {availableVouchers.map(voucher => (
                                        <option key={voucher.id} value={voucher.code}>
                                            {voucher.name} - 
                                            {voucher.discountType === 'PERCENTAGE' 
                                                ? ` Giảm ${voucher.discountValue}%`
                                                : ` Giảm ${voucher.discountValue.toLocaleString('vi-VN')}₫`
                                            }
                                            {voucher.minOrderValue > 0 && ` (Đơn tối thiểu ${voucher.minOrderValue.toLocaleString('vi-VN')}₫)`}
                                        </option>
                                    ))}
                                </select>
                                {loadingVouchers && <p className="voucher-loading">Đang tải voucher...</p>}
                                {availableVouchers.length === 0 && !loadingVouchers && (
                                    <p className="no-vouchers">Không có voucher khả dụng</p>
                                )}
                            </div>

                            {/* Tổng tiền */}
                            <div className="order-totals">
                                <div className="total-row">
                                    <span>Tạm tính</span>
                                    <span>{calculateSubtotal().toLocaleString('vi-VN')}₫</span>
                                </div>
                                <div className="total-row">
                                    <span>Phí vận chuyển</span>
                                    <span>{shippingFee.toLocaleString('vi-VN')}₫</span>
                                </div>
                                {selectedVoucher && (
                                    <div className="total-row discount-row">
                                        <span>Giảm giá (Voucher)</span>
                                        <span className="discount-amount">
                                            -{calculateVoucherDiscount().toLocaleString('vi-VN')}₫
                                        </span>
                                    </div>
                                )}
                                <div className="total-row total-final">
                                    <span>Tổng cộng</span>
                                    <span className="final-amount">
                                        {calculateTotal().toLocaleString('vi-VN')}₫
                                    </span>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="btn-submit-order"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Đang xử lý...' : 'Đặt hàng'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Loading overlay */}
            {isSubmitting && (
                <div className="loading-overlay">
                    <div className="loading-content">
                        Đang xử lý đơn hàng...
                    </div>
                </div>
            )}
        </div>
    );
};

export default Checkout;

