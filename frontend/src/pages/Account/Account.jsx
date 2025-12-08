import React, { useState, useEffect } from "react"
import rank from "../../assets/banner/rank-banner.png"
import "../../pages/HomePage/HomePage.css";
import "../../pages/Account/Account.css"

//const API_URL = 'http://localhost:8080/vouchers';
const API_URL = 'http://localhost:8081/vouchers';

const Account = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [vouchers, setVouchers] = useState([]);
    const [loadingVouchers, setLoadingVouchers] = useState(false);
    const [copiedCode, setCopiedCode] = useState(null);

    const [formData, setFormData] = useState({
        ho: 'Nguyễn',
        ten: 'Thịnh',
        phone: '0336289549',
        email: '',
        gender: 'Nam',
        day: '17',
        month: '07',
        year: '2005',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Dữ liệu đã lưu:', formData);
        alert('Đã lưu thay đổi!');
    };

    useEffect(() => {
        if (activeTab === 'vouchers') {
            fetchVouchers();
        }
    }, [activeTab]);

    const fetchVouchers = async () => {
        try {
            setLoadingVouchers(true);
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error('Không thể tải danh sách voucher');
            }
            const data = await response.json();
            setVouchers(data);
        } catch (err) {
            console.error('Error fetching vouchers:', err);
            alert('Lỗi khi tải voucher: ' + err.message);
        } finally {
            setLoadingVouchers(false);
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

    return (
        <main>
            <div className="account-main">
                <div className="bg-[var(--components-color)] rounded-xl">
                    <div className="account-rank">
                        <img src={rank} alt="rank customer" />
                    </div>
                </div>
                <div className="account-info">
                    <h1 className="account-title">
                        Hồ sơ cá nhân
                    </h1>

                    <form onSubmit={handleSubmit} className="account-form">
                        {/* Field: Họ */}
                        <div className="form-row">
                            <label className="form-label">
                                Họ<span className="required">*</span>
                            </label>
                            <div className="form-input-wrapper">
                                <input
                                    type="text"
                                    name="ho"
                                    value={formData.ho}
                                    onChange={handleChange}
                                    className="form-input"
                                />
                            </div>
                        </div>

                        {/* Field: Tên */}
                        <div className="form-row">
                            <label className="form-label">
                                Tên<span className="required">*</span>
                            </label>
                            <div className="form-input-wrapper">
                                <input
                                    type="text"
                                    name="ten"
                                    value={formData.ten}
                                    onChange={handleChange}
                                    className="form-input"
                                />
                            </div>
                        </div>

                        {/* Field: Số điện thoại */}
                        <div className="form-row">
                            <label className="form-label">
                                Số điện thoại
                            </label>
                            <div className="form-input-wrapper">
                                <div className="readonly-field">
                                    <span>{formData.phone}</span>
                                    <button type="button" className="change-btn">
                                        Thay đổi
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Field: Email */}
                        <div className="form-row">
                            <label className="form-label">
                                Email
                            </label>
                            <div className="form-input-wrapper">
                                <div className="readonly-field">
                                    <span className="email-placeholder">
                                        {formData.email || 'Chưa có email'}
                                    </span>
                                    <button type="button" className="change-btn">
                                        Thêm mới
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Field: Giới tính */}
                        <div className="form-row">
                            <label className="form-label">
                                Giới tính<span className="required">*</span>
                            </label>
                            <div className="form-input-wrapper">
                                <div className="radio-group">
                                    <label className="radio-label">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="Nam"
                                            checked={formData.gender === 'Nam'}
                                            onChange={handleChange}
                                            className="radio-input"
                                        />
                                        <span>Nam</span>
                                    </label>
                                    <label className="radio-label">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="Nữ"
                                            checked={formData.gender === 'Nữ'}
                                            onChange={handleChange}
                                            className="radio-input"
                                        />
                                        <span>Nữ</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Field: Birthday */}
                        <div className="form-row">
                            <label className="form-label">
                                Birthday<span className="required">*</span>
                            </label>
                            <div className="form-input-wrapper">
                                <div className="birthday-group">
                                    <input
                                        type="text"
                                        name="day"
                                        value={formData.day}
                                        onChange={handleChange}
                                        placeholder="DD"
                                        className="birthday-input"
                                    />
                                    <input
                                        type="text"
                                        name="month"
                                        value={formData.month}
                                        onChange={handleChange}
                                        placeholder="MM"
                                        className="birthday-input"
                                    />
                                    <input
                                        type="text"
                                        name="year"
                                        value={formData.year}
                                        onChange={handleChange}
                                        placeholder="YYYY"
                                        className="birthday-input"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="form-submit">
                            <button type="submit" className="btn-submit">
                                Lưu thay đổi
                            </button>
                        </div>
                    </form>
                </div>
                <div className="account-info">
                    <h1 className="account-title">
                        Đổi Mật Khẩu
                    </h1>

                    <form onSubmit={handleSubmit} className="account-form">
                        <div className="form-row">
                            <label className="form-label">
                                Mật Khẩu Hiện Tại<span className="required">*</span>
                            </label>
                            <div className="form-input-wrapper">
                                <input
                                    type="text"
                                    name="ho"
                                    value={formData.ho}
                                    onChange={handleChange}
                                    className="form-input"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <label className="form-label">
                                Mật Khẩu Mới<span className="required">*</span>
                            </label>
                            <div className="form-input-wrapper">
                                <div className="readonly-field">
                                    <span>{formData.phone}</span>
                                    <button type="button" className="change-btn">
                                        Thay đổi
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="form-row">
                            <label className="form-label">
                                Nhập Lại Mật Khẩu Mới<span className="required">*</span>
                            </label>
                            <div className="form-input-wrapper">
                                <div className="readonly-field">
                                    <span>{formData.phone}</span>
                                    <button type="button" className="change-btn">
                                        Thay đổi
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="form-submit">
                            <button type="submit" className="btn-submit">
                                Xác Nhận
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    )
}

export default Account;