import React, { useState, useEffect } from "react"

import Header from '../../components/Header/Header'
import Footer from '../../components/Footer/Footer'

import { PiCrownSimpleFill } from "react-icons/pi";
import { IoIosArrowForward } from "react-icons/io";
import { CiUser } from "react-icons/ci";
import { TfiReceipt } from "react-icons/tfi";
import { IoTicketSharp, IoCopyOutline } from "react-icons/io5";
import { GoBell } from "react-icons/go";
import { CiStar } from "react-icons/ci";
import { FiCheck } from "react-icons/fi";

import ex1 from "../../assets/ex1.jpg";
import recommendBanner from "../../assets/banner/recommend-banner.png";
import rank from "../../assets/banner/rank-banner.png"

import "../../pages/HomePage/HomePage.css";
import "../../pages/Account/Account.css"
import { Link } from "react-router-dom";

const API_URL = 'http://localhost:8081/vouchers';

const Account = () => {
    const [activeTab, setActiveTab] = useState('profile'); // profile, vouchers, orders, notifications, reviews
    const [vouchers, setVouchers] = useState([]);
    const [loadingVouchers, setLoadingVouchers] = useState(false);
    const [copiedCode, setCopiedCode] = useState(null);

    const listTrend = [
        { id: 1, img: ex1, link: "/books/1", title: "Doraemon - Movie Story Màu - Nobita Và Những Hiệp Sĩ Không Gian", oldPrice: "40.000 đ", newPrice: "36.000 đ", discount: "-10%" },
        { id: 2, img: ex1, link: "/books/2", title: "One Piece - Tập 1: Romance Dawn", oldPrice: "35.000 đ", newPrice: "31.500 đ", discount: "-10%" },
        { id: 3, img: ex1, link: "/books/3", title: "Naruto - Tập 1: Uzumaki Naruto", oldPrice: "30.000 đ", newPrice: "27.000 đ", discount: "-10%" },
        { id: 4, img: ex1, link: "/books/4", title: "Attack on Titan - Tập 1", oldPrice: "45.000 đ", newPrice: "40.500 đ", discount: "-10%" },
        { id: 5, img: ex1, link: "/books/5", title: "Dragon Ball - Tập 1", oldPrice: "32.000 đ", newPrice: "28.800 đ", discount: "-10%" },
        { id: 6, img: ex1, link: "/books/6", title: "Detective Conan - Tập 1", oldPrice: "38.000 đ", newPrice: "34.200 đ", discount: "-10%" },
        { id: 7, img: ex1, link: "/books/7", title: "Demon Slayer - Tập 1", oldPrice: "42.000 đ", newPrice: "37.800 đ", discount: "-10%" },
        { id: 8, img: ex1, link: "/books/8", title: "My Hero Academia - Tập 1", oldPrice: "36.000 đ", newPrice: "32.400 đ", discount: "-10%" },
        { id: 9, img: ex1, link: "/books/9", title: "Jujutsu Kaisen - Tập 1", oldPrice: "44.000 đ", newPrice: "39.600 đ", discount: "-10%" },
        { id: 10, img: ex1, link: "/books/10", title: "Chainsaw Man - Tập 1", oldPrice: "41.000 đ", newPrice: "36.900 đ", discount: "-10%" }
    ];

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

    // Fetch vouchers when voucher tab is active
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
        <>
            <Header />
            
            <main>
                <div className="account-container">
                    <div className="account-nav">
                        <div className="top-nav">
                            < PiCrownSimpleFill className="w-30 h-30 p-5 rounded-full text-gray-400 border-8 mx-auto" />
                            <div className="content">
                                <h1>Tên User</h1>
                                <h2 className="bg-gray-400 rounded-full">Thành Viên ...</h2>
                                <h2>Mua Thêm ... đơn để nâng hạng ....</h2>
                            </div>
                        </div>
                        <div className="main-nav items-center text-center">
                            <button 
                                onClick={() => setActiveTab('profile')}
                                className={`flex flex-row justify-start py-2 px-7 gap-4 w-full ${activeTab === 'profile' ? 'bg-red-50 text-red-600 font-semibold' : ''}`}
                            > 
                                <CiUser className="w-7 h-7"/> 
                                <span>Thông tin tài khoản</span>
                            </button>
                            <button 
                                onClick={() => setActiveTab('orders')}
                                className={`flex flex-row justify-start py-2 px-7 gap-4 w-full ${activeTab === 'orders' ? 'bg-red-50 text-red-600 font-semibold' : ''}`}
                            >
                                <TfiReceipt className="w-7 h-7"/> 
                                <span> Đơn hàng của tôi</span>
                            </button>
                            <button 
                                onClick={() => setActiveTab('vouchers')}
                                className={`flex flex-row justify-start py-2 px-7 gap-4 w-full ${activeTab === 'vouchers' ? 'bg-red-50 text-red-600 font-semibold' : ''}`}
                            > 
                                <IoTicketSharp className="w-7 h-7"/> 
                                <span> Ví Voucher</span>
                            </button>
                            <button 
                                onClick={() => setActiveTab('notifications')}
                                className={`flex flex-row justify-start py-2 px-7 gap-4 w-full ${activeTab === 'notifications' ? 'bg-red-50 text-red-600 font-semibold' : ''}`}
                            > 
                                <GoBell className="w-7 h-7"/> 
                                <span> Thông báo</span>
                            </button>
                            <button 
                                onClick={() => setActiveTab('reviews')}
                                className={`flex flex-row justify-start py-2 px-7 gap-4 w-full ${activeTab === 'reviews' ? 'bg-red-50 text-red-600 font-semibold' : ''}`}
                            > 
                                <CiStar className="w-7 h-7"/> 
                                <span> Nhận xét của tôi</span>
                            </button>
                        </div>
                    </div>
                    <div className="account-main">
                        {activeTab === 'profile' && (
                            <>
                        <div className="account-rank">
                            <img src={rank} alt="rank customer" />
                        </div>
                        <div className="account-info">
                            <h1 className="text-xl md:text-2xl text-gray-700 font-medium mb-8">
                                Hồ sơ cá nhân
                            </h1>

                            <form onSubmit={handleSubmit} className="space-y-6">
                            
                            {/* Field: Họ */}
                            <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-2 md:gap-4">
                                <label className="md:col-span-2 text-gray-600">
                                Họ<span className="text-red-500">*</span>
                                </label>
                                <div className="md:col-span-8">
                                <input
                                    type="text"
                                    name="ho"
                                    value={formData.ho}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500 text-gray-700"
                                />
                                </div>
                            </div>

                            {/* Field: Tên */}
                            <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-2 md:gap-4">
                                <label className="md:col-span-2 text-gray-600">
                                Tên<span className="text-red-500">*</span>
                                </label>
                                <div className="md:col-span-8">
                                <input
                                    type="text"
                                    name="ten"
                                    value={formData.ten}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500 text-gray-700"
                                />
                                </div>
                            </div>

                            {/* Field: Số điện thoại */}
                            <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-2 md:gap-4">
                                <label className="md:col-span-2 text-gray-600">
                                Số điện thoại
                                </label>
                                <div className="md:col-span-8 relative">
                                <div className="flex items-center justify-between w-full border border-gray-300 rounded px-3 py-2">
                                    <span className="text-gray-700">{formData.phone}</span>
                                    <button type="button" className="text-blue-500 hover:underline text-sm">
                                    Thay đổi
                                    </button>
                                </div>
                                </div>
                            </div>

                            {/* Field: Email */}
                            <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-2 md:gap-4">
                                <label className="md:col-span-2 text-gray-600">
                                Email
                                </label>
                                <div className="md:col-span-8">
                                <div className="flex items-center justify-between w-full border border-gray-300 rounded px-3 py-2">
                                    <span className="text-gray-400">
                                    {formData.email || 'Chưa có email'}
                                    </span>
                                    <button type="button" className="text-blue-500 hover:underline text-sm">
                                    Thêm mới
                                    </button>
                                </div>
                                </div>
                            </div>

                            {/* Field: Giới tính */}
                            <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-2 md:gap-4">
                                <label className="md:col-span-2 text-gray-600">
                                Giới tính<span className="text-red-500">*</span>
                                </label>
                                <div className="md:col-span-8 flex items-center space-x-6">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                    type="radio"
                                    name="gender"
                                    value="Nam"
                                    checked={formData.gender === 'Nam'}
                                    onChange={handleChange}
                                    className="form-radio text-red-600 focus:ring-red-500 h-4 w-4 accent-red-600"
                                    />
                                    <span className="text-gray-700">Nam</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                    type="radio"
                                    name="gender"
                                    value="Nữ"
                                    checked={formData.gender === 'Nữ'}
                                    onChange={handleChange}
                                    className="form-radio text-red-600 focus:ring-red-500 h-4 w-4 accent-red-600"
                                    />
                                    <span className="text-gray-700">Nữ</span>
                                </label>
                                </div>
                            </div>

                            {/* Field: Birthday */}
                            <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-2 md:gap-4">
                                <label className="md:col-span-2 text-gray-600">
                                Birthday<span className="text-red-500">*</span>
                                </label>
                                <div className="md:col-span-8 grid grid-cols-3 gap-4">
                                <div className="border border-gray-300 rounded px-3 py-2 flex justify-center">
                                    <input 
                                        type="text" 
                                        name="day"
                                        value={formData.day}
                                        onChange={handleChange}
                                        className="w-full text-center outline-none text-gray-700"
                                    />
                                </div>
                                <div className="border border-gray-300 rounded px-3 py-2 flex justify-center">
                                    <input 
                                        type="text" 
                                        name="month"
                                        value={formData.month}
                                        onChange={handleChange}
                                        className="w-full text-center outline-none text-gray-700"
                                    />
                                </div>
                                <div className="border border-gray-300 rounded px-3 py-2 flex justify-center">
                                    <input 
                                        type="text" 
                                        name="year"
                                        value={formData.year}
                                        onChange={handleChange}
                                        className="w-full text-center outline-none text-gray-700"
                                    />
                                </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4 flex justify-center">
                                <button
                                type="submit"
                                className="bg-red-700 hover:bg-red-800 text-white font-medium py-2 px-8 rounded shadow-sm transition-colors"
                                >
                                Lưu thay đổi
                                </button>
                            </div>

                            </form>
                        </div>
                            </>
                        )}

                        {activeTab === 'vouchers' && (
                            <div className="voucher-section" style={{ width: '100%' }}>
                                <h1 className="text-2xl font-bold text-gray-800 mb-6">
                                    Ví Voucher của bạn
                                </h1>
                                
                                {loadingVouchers ? (
                                    <div className="text-center py-10">
                                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                                        <p className="mt-4 text-gray-600">Đang tải voucher...</p>
                                    </div>
                                ) : vouchers.length === 0 ? (
                                    <div className="text-center py-10 bg-gray-50 rounded-lg">
                                        <IoTicketSharp className="mx-auto text-6xl text-gray-300 mb-4" />
                                        <h3 className="text-xl text-gray-600 mb-2">Chưa có voucher</h3>
                                        <p className="text-gray-500">Hiện tại bạn chưa có voucher nào</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {vouchers.map((voucher) => {
                                            const isExpired = isVoucherExpired(voucher.endDate);
                                            const isAvailable = isVoucherAvailable(voucher);
                                            const discountText = voucher.discountType === 'PERCENTAGE' 
                                                ? `${voucher.discountValue}%`
                                                : formatPrice(voucher.discountValue);

                                            return (
                                                <div 
                                                    key={voucher.id} 
                                                    className={`flex bg-white border-2 rounded-xl overflow-hidden transition-all hover:shadow-lg ${isExpired ? 'opacity-60' : 'border-gray-200 hover:border-red-400'}`}
                                                    style={{ minHeight: '180px' }}
                                                >
                                                    <div className="bg-gradient-to-br from-red-600 to-red-400 p-6 flex items-center justify-center" style={{ minWidth: '140px' }}>
                                                        <div className="text-center">
                                                            <div className="text-4xl font-bold text-yellow-300 drop-shadow-lg">{discountText}</div>
                                                            <div className="text-sm mt-1 text-yellow-300 font-semibold">GIẢM</div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex-1 p-5 flex flex-col justify-between">
                                                        <div>
                                                            <h3 className="text-lg font-bold text-gray-800 mb-2">{voucher.name}</h3>
                                                            <p className="text-sm text-gray-600 mb-3">{voucher.description}</p>
                                                            
                                                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                                                                {voucher.minOrderValue > 0 && (
                                                                    <div>📦 Đơn tối thiểu: <strong>{formatPrice(voucher.minOrderValue)}</strong></div>
                                                                )}
                                                                {voucher.maxDiscount > 0 && voucher.discountType === 'PERCENTAGE' && (
                                                                    <div>🎯 Giảm tối đa: <strong>{formatPrice(voucher.maxDiscount)}</strong></div>
                                                                )}
                                                                <div>📅 HSD: <strong>{formatDate(voucher.endDate)}</strong></div>
                                                                <div>🎫 Còn: <strong>{voucher.quantity - voucher.usedCount}/{voucher.quantity}</strong></div>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex gap-3 items-center">
                                                            <div className="flex-1 bg-gray-100 px-4 py-2 rounded-lg border-2 border-dashed border-gray-300">
                                                                <code className="text-red-600 font-bold tracking-wider">{voucher.code}</code>
                                                            </div>
                                                            <button
                                                                className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                                                                    copiedCode === voucher.code 
                                                                        ? 'bg-green-500 text-white' 
                                                                        : isAvailable 
                                                                            ? 'bg-red-600 text-white hover:bg-red-700' 
                                                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                                }`}
                                                                onClick={() => isAvailable && copyVoucherCode(voucher.code)}
                                                                disabled={!isAvailable}
                                                            >
                                                                {copiedCode === voucher.code ? (
                                                                    <>
                                                                        <FiCheck /> Đã copy
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <IoCopyOutline /> Copy
                                                                    </>
                                                                )}
                                                            </button>
                                                        </div>
                                                        
                                                        {isExpired && (
                                                            <div className="mt-2 text-xs text-red-600 font-semibold">
                                                                ❌ Đã hết hạn
                                                            </div>
                                                        )}
                                                        {!isExpired && voucher.quantity <= voucher.usedCount && (
                                                            <div className="mt-2 text-xs text-orange-600 font-semibold">
                                                                ⚠️ Đã hết lượt sử dụng
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                <div className="mt-8 p-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg">
                                    <h3 className="font-bold text-gray-800 mb-4">💡 Hướng dẫn sử dụng</h3>
                                    <ol className="space-y-2 text-sm text-gray-700">
                                        <li>1. Chọn voucher phù hợp với đơn hàng của bạn</li>
                                        <li>2. Nhấn nút "Copy" để sao chép mã voucher</li>
                                        <li>3. Dán mã vào ô "Mã giảm giá" khi thanh toán</li>
                                    </ol>
                                </div>
                            </div>
                        )}

                        {activeTab === 'orders' && (
                            <div className="text-center py-20">
                                <TfiReceipt className="mx-auto text-6xl text-gray-300 mb-4" />
                                <h3 className="text-xl text-gray-600">Đơn hàng của tôi</h3>
                                <p className="text-gray-500 mt-2">Chức năng đang phát triển</p>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="text-center py-20">
                                <GoBell className="mx-auto text-6xl text-gray-300 mb-4" />
                                <h3 className="text-xl text-gray-600">Thông báo</h3>
                                <p className="text-gray-500 mt-2">Chức năng đang phát triển</p>
                            </div>
                        )}

                        {activeTab === 'reviews' && (
                            <div className="text-center py-20">
                                <CiStar className="mx-auto text-6xl text-gray-300 mb-4" />
                                <h3 className="text-xl text-gray-600">Nhận xét của tôi</h3>
                                <p className="text-gray-500 mt-2">Chức năng đang phát triển</p>
                            </div>
                        )}
                    </div>

                </div>

                <div className="recommend">
                    <img src={recommendBanner} alt="recommend banner" />

                    <div className="recommend-detail">
                        {listTrend.map((item, index) => (
                            <Link key={index} to={item.link}>
                                <img src={item.img} alt="" className="w-full h-auto" />
                                <div className="label-price">
                                    <h3>{item.title}</h3>
                                    <p className="special-price">
                                        <span className="price-new">{item.newPrice}</span>
                                        <span className="percent-discount">{item.discount}</span>
                                    </p>
                                    <span className="price-old">{item.oldPrice}</span>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div className="button-more mt-65">
                        <Link to="#" className="flex gap-2">
                            Xem Tất Cả
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    )
}

export default Account;