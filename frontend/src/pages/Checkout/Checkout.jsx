import React, { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import { useLocation, useNavigate } from "react-router-dom";
import "./Checkout.css";
import axios from "axios";
import vnpayIcon from "../../assets/vnpay.png";
import cashIcon from "../../assets/money.png";
import promoIcon from "../../assets/promote.png"; // Đừng quên import icon này

function Checkout() {
    const navigate = useNavigate();
    const location = useLocation();

    // Nhận danh sách sản phẩm từ trang Cart (được truyền qua state)
    const {
        items: receivedItems = [],
        discountAmount: receivedDiscount = 0, // Nhận discount từ Cart nếu có
        couponCode: receivedCoupon = "",      // Nhận coupon code từ Cart nếu có
    } = location.state || {};

    // --- 1. STATES MỚI CHO VOUCHER (Mang từ Cart sang) ---
    const [showPromoModal, setShowPromoModal] = useState(false);
    const [coupons, setCoupons] = useState([]);
    // Nếu có mã từ Cart gửi sang thì set mặc định, nếu không thì null
    const [selectedCoupon, setSelectedCoupon] = useState(receivedCoupon ? { code: receivedCoupon } : null);
    const [discountAmount, setDiscountAmount] = useState(receivedDiscount);
    const API_VOUCHER_URL = "/vouchers/active";

    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        country: "Việt Nam",
        province: "",
        district: "",
        ward: "",
        address: "",
    });

    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    const [paymentMethod, setPaymentMethod] = useState("cash");

    // Tính subtotal lại tại trang Checkout để đảm bảo chính xác
    const subtotal = receivedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );
    const shippingFee = 32000;

    // --- 2. LOGIC VOUCHER (API & TÍNH TOÁN) ---

    // Hàm lấy danh sách voucher
    const fetchCoupons = async () => {
        try {
            const res = await axiosClient.get(API_VOUCHER_URL);
            setCoupons(res.data);

            // Nếu "Mua ngay" -> selectedCoupon là null.
            // Nếu từ "Giỏ hàng" -> selectedCoupon có code.
            // Ta cần tìm object đầy đủ (có id, minValue...) trong list vừa tải về để gán vào state.
            if (receivedCoupon && res.data.length > 0) {
                 const couponObj = res.data.find(c => c.code === receivedCoupon);
                 if (couponObj) setSelectedCoupon(couponObj);
            }
        } catch (error) {
            console.error("Lỗi lấy voucher:", error);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    // Hàm áp dụng voucher (Logic giống hệt Cart)
    const handleApplyCoupon = (voucher) => {
        if (voucher.minOrderValue && subtotal < voucher.minOrderValue) {
            alert(`Đơn hàng phải từ ${formatPrice(voucher.minOrderValue)} để dùng mã này!`);
            return;
        }

        let calculatedDiscount = 0;

        if (voucher.discountType === "FIXED_AMOUNT") {
            calculatedDiscount = voucher.discountValue;
        } else if (voucher.discountType === "PERCENTAGE") {
            calculatedDiscount = subtotal * (voucher.discountValue / 100);
            if (voucher.maxDiscount && calculatedDiscount > voucher.maxDiscount) {
                calculatedDiscount = voucher.maxDiscount;
            }
        }

        if (calculatedDiscount > subtotal) {
            calculatedDiscount = subtotal;
        }

        setSelectedCoupon(voucher);
        setDiscountAmount(calculatedDiscount);
        setShowPromoModal(false);
    };

    // --- LOGIC ĐỊA CHỈ & USER ---
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const response = await axios.get(
                    "https://esgoo.net/api-tinhthanh/1/0.htm",
                    { withCredentials: false }
                );
                if (response.data.error === 0) {
                    setProvinces(response.data.data);
                }
            } catch (error) {
                console.error("Lỗi tải tỉnh thành:", error);
            }
        };
        fetchProvinces();
    }, []);

    const handleLocationChange = async (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (name === "province") {
            setDistricts([]);
            setWards([]);
            setFormData((prev) => ({ ...prev, province: value, district: "", ward: "" }));
            if (value) {
                try {
                    const res = await axios.get(`https://esgoo.net/api-tinhthanh/2/${value}.htm`, { withCredentials: false });
                    if (res.data.error === 0) setDistricts(res.data.data);
                } catch (err) { console.error(err); }
            }
        } else if (name === "district") {
            setWards([]);
            setFormData((prev) => ({ ...prev, district: value, ward: "" }));
            if (value) {
                try {
                    const res = await axios.get(`https://esgoo.net/api-tinhthanh/3/${value}.htm`, { withCredentials: false });
                    if (res.data.error === 0) setWards(res.data.data);
                } catch (err) { console.error(err); }
            }
        }
    };

    useEffect(() => {
        if (!receivedItems || receivedItems.length === 0) {
            alert("Bạn chưa chọn sản phẩm nào để thanh toán!");
            navigate("/cart");
        }
    }, [receivedItems, navigate]);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await axiosClient.get("/users/me");
                const user = response.data;
                setFormData((prev) => ({
                    ...prev,
                    fullName: user.fullName || "",
                    phone: user.phoneNumber || "",
                    address: user.address || "",
                }));
            } catch (error) {
                console.error("Lỗi lấy thông tin user:", error);
                if (error.response?.status === 401) {
                    alert("Phiên đăng nhập hết hạn.");
                    navigate("/login");
                }
            }
        };
        fetchUserProfile();
    }, [navigate]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const locationOptions = { province: provinces, district: districts, ward: wards };

    // Tính tổng tiền cuối cùng (Subtotal - Discount + Ship)
    const total = subtotal - discountAmount > 0 ? subtotal - discountAmount : 0;
    const totalWithShipping = total + shippingFee;

    const formatPrice = (price) => price?.toLocaleString("vi-VN") + " ₫";

    const handleOrderSubmit = async () => {
        if (!formData.fullName || !formData.phone || !formData.address || !formData.province || !formData.district || !formData.ward) {
            alert("Vui lòng điền đầy đủ thông tin giao hàng!");
            return;
        }

        try {
            const provinceName = provinces.find((p) => p.id === formData.province)?.full_name || "";
            const districtName = districts.find((d) => d.id === formData.district)?.full_name || "";
            const wardName = wards.find((w) => w.id === formData.ward)?.full_name || "";

            const orderPayload = {
                customerInfo: { fullName: formData.fullName, phoneNumber: formData.phone },
                deliveryAddress: {
                    country: "Việt Nam",
                    province: provinceName,
                    district: districtName,
                    ward: wardName,
                    details: formData.address,
                    fullAddress: `${formData.address}, ${wardName}, ${districtName}, ${provinceName}`,
                },
                paymentMethod: paymentMethod,
                couponCode: selectedCoupon ? selectedCoupon.code : null, // Gửi mã coupon đã chọn
                items: receivedItems.map((item) => ({
                    bookId: item.bookVariantId || item.id,
                    bookTitle: item.name,
                    quantity: item.quantity,
                    pricePurchased: item.price,
                    subTotal: item.price * item.quantity,
                })),
                totalAmount: totalWithShipping,
                shippingFee: 32000,
                note: "Giao giờ hành chính",
            };

            console.log("📦 Gửi order data:", orderPayload);
            const response = await axiosClient.post("/checkout", orderPayload);

            if (response.data.code === "00") {
                const { requiresPayment, paymentUrl, orderId } = response.data;
                if (requiresPayment && paymentUrl) {
                    window.location.href = paymentUrl;
                } else {
                    navigate("/payment/pending?orderId=" + orderId);
                }
            } else {
                alert("Lỗi tạo đơn hàng: " + response.data.message);
            }
        } catch (error) {
            console.error("❌ Error creating order:", error);
            alert("Không thể tạo đơn hàng. Vui lòng thử lại!");
        }
    };

    return (
        <div className="checkout-container w-full min-h-screen flex justify-center bg-[#f2f2f2] py-6">
            <div className="w-full max-w-[1180px] flex gap-6">
                {/* LEFT SIDE */}
                <div className="flex-1 space-y-6">
                    {/* ADDRESS SECTION */}
                    <div className="form-section bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">ĐỊA CHỈ GIAO HÀNG</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-lg mb-1">Họ và tên người nhận</label>
                                <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full p-3! border rounded-md text-lg " />
                            </div>
                            <div>
                                <label className="block text-lg mb-1">Số điện thoại</label>
                                <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full p-3! border rounded-md text-lg" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="block text-lg mb-1">Quốc gia</label>
                            <select name="country" value={formData.country} onChange={handleInputChange} className="w-full p-3! border rounded-md text-lg">
                                <option>Việt Nam</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-4">
                            {["province", "district", "ward"].map((field) => (
                                <div key={field}>
                                    <label className="block text-lg mb-1">
                                        {field === "province" ? "Tỉnh/Thành phố" : field === "district" ? "Quận/Huyện" : "Phường/Xã"}
                                    </label>
                                    <select name={field} value={formData[field]} onChange={handleLocationChange} className="w-full p-3! border rounded-md text-lg">
                                        <option value="">Chọn</option>
                                        {locationOptions[field]?.map((item) => (
                                            <option key={item.id} value={item.id}>{item.full_name}</option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4">
                            <label className="block text-lg mb-1">Địa chỉ nhận hàng</label>
                            <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full p-3! border rounded-md text-lg" />
                        </div>
                    </div>

                    {/* SHIPPING METHOD */}
                    <div className="form-section">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">PHƯƠNG THỨC VẬN CHUYỂN</h2>
                        <div className="payment-option selected" style={{ cursor: "default", border: "1px solid #C92127", background: "#fff5f5", display: "flex", alignItems: "center", padding: "16px", borderRadius: "8px" }}>
                            <div style={{ width: "20px", height: "20px", borderRadius: "50%", border: "6px solid #C92127", marginRight: "12px", backgroundColor: "white", flexShrink: 0 }}></div>
                            <div>
                                <div style={{ fontWeight: "700", color: "#333", fontSize: "13px" }}>Giao hàng tiêu chuẩn: 32.000 đ</div>
                                <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>Giao hàng từ 2-4 ngày làm việc</div>
                            </div>
                        </div>
                    </div>

                    {/* PAYMENT METHOD */}
                    <div className="form-section bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">PHƯƠNG THỨC THANH TOÁN</h2>
                        <div className="space-y-3">
                            {[{ id: "vnpay", label: "VNPAY ", icon: vnpayIcon }, { id: "cash", label: "Thanh toán bằng tiền mặt khi nhận hàng ", icon: cashIcon }].map((method) => (
                                <label key={method.id} className={`payment-option flex items-center p-3 border rounded-md ${paymentMethod === method.id ? "selected" : ""}`}>
                                    <input type="radio" name="payment" checked={paymentMethod === method.id} onChange={() => setPaymentMethod(method.id)} className="w-4 h-4" />
                                    <img src={method.icon} alt={method.label} className="ml-3 w-8 h-8 object-contain" />
                                    <span className="ml-3" style={{ fontSize: "13px", color: "#333", marginLeft: "12px" }}>{method.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* --- 3. GIAO DIỆN CHỌN VOUCHER (ĐÃ SỬA) --- */}
                    <div className="form-section bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">MÃ KHUYẾN MÃI / GIFT CARD</h2>

                        {selectedCoupon ? (
                            // Giao diện khi ĐÃ CHỌN voucher
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#fef2e0", border: "1px solid #fcdab0", borderRadius: "6px", padding: "10px 12px", height: "42px", boxSizing: "border-box" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <span style={{ border: "1px solid #f7941e", color: "#f7941e", padding: "1px 4px", borderRadius: "3px", fontSize: "10px", fontWeight: "bold" }}>VOUCHER</span>
                                    <span style={{ color: "#f7941e", fontWeight: "600", fontSize: "15px" }}>{selectedCoupon.code}</span>
                                </div>
                                <button
                                    onClick={() => { setSelectedCoupon(null); setDiscountAmount(0); }}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: '18px' }}
                                >✕</button>
                            </div>
                        ) : (
                            // Giao diện khi CHƯA CHỌN voucher (Nút bấm mở Modal)
                            <div
                                onClick={() => setShowPromoModal(true)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    padding: '10px 15px',
                                    cursor: 'pointer',
                                    color: '#0d6efd'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666' }}>
                                    <img src={promoIcon} alt="promo" width={20} />
                                    <span>Chọn hoặc nhập mã khuyến mãi</span>
                                </div>

                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT SIDE (ORDER SUMMARY) */}
                <div className="w-full md:w-[380px]">
                    <div className="sticky-sidebar">
                        <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "15px", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>KIỂM TRA ĐƠN HÀNG</h3>
                        <div className="order-items-scroll" style={{ maxHeight: "300px", overflowY: "auto", paddingRight: "5px", marginBottom: "15px" }}>
                            {receivedItems.map((item) => (
                                <div key={item.id} style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
                                    <div className="relative">
                                        <img src={item.image} className="summary-img" />
                                        {item.badge && <span className="discount-badge badge-pulse absolute -top-1 -right-1 px-2 py-0.5 text-white text-xs rounded">{item.badge}</span>}
                                    </div>
                                    <div className="flex-1">
                                        <h4 style={{ fontSize: "15px", fontWeight: "600", lineHeight: "1.4", marginBottom: "4px", color: "#333", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.name}</h4>
                                        <div className="flex gap-2 mt-1" style={{ fontSize: "14px" }}>
                                            <span className="text-red-600 font-semibold">{formatPrice(item.price)}</span>
                                            {item.price !== item.originalPrice && <span className="text-gray-400 line-through">{formatPrice(item.originalPrice)}</span>}
                                        </div>
                                        <div className="flex justify-between items-center mt-2" style={{ fontSize: "14px" }}>
                                            <span className="text-gray-500">x{item.quantity}</span>
                                            <span className="text-red-600 font-semibold">{formatPrice(item.price * item.quantity)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t pt-4 space-y-2" style={{ fontSize: "18px", color: "#444" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "15px", marginTop: "1rem" }}>
                                <span>Thành tiền:</span>
                                <span>{formatPrice(subtotal)}</span>
                            </div>

                            {/* Hiển thị dòng giảm giá nếu có */}
                            {discountAmount > 0 && (
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "15px" }}>
                                    <span>Giảm giá {selectedCoupon ? `(${selectedCoupon.code})` : ''}:</span>
                                    <span style={{ color: "#2eb85c", fontWeight: "bold" }}>-{formatPrice(discountAmount)}</span>
                                </div>
                            )}

                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "15px" }}>
                                <span>Phí vận chuyển:</span>
                                <span>{formatPrice(shippingFee)}</span>
                            </div>

                            <div className="flex justify-between text-base font-semibold pt-2 border-t total-price">
                                <span>Tổng tiền:</span>
                                <span className="text-red-600 text-xl">{formatPrice(totalWithShipping)}</span>
                            </div>
                        </div>

                        <button onClick={handleOrderSubmit} className="checkout-button mt-4 w-full py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition">Xác nhận thanh toán</button>
                    </div>
                </div>
            </div>

            {/* --- 4. MODAL VOUCHER (COPY TỪ CART SANG) --- */}
            {showPromoModal && (
                <div className="modal-overlay">
                    <div className="modal-box voucher-modal">
                        <div className="modal-header">
                            <h3>CHỌN MÃ KHUYẾN MÃI</h3>
                            <button className="close-btn" onClick={() => setShowPromoModal(false)}>✕</button>
                        </div>

                        <div className="voucher-list">
                            {coupons.length === 0 ? (
                                <div className="empty-voucher">
                                    <img src={promoIcon} alt="" width="50" style={{ opacity: 0.5 }} />
                                    <p>Không có voucher nào khả dụng.</p>
                                </div>
                            ) : (
                                coupons.map((coupon) => {
                                    const isSelected = selectedCoupon && selectedCoupon.id === coupon.id;
                                    const minOrder = coupon.minOrderValue || 0;
                                    const isEligible = subtotal >= minOrder;
                                    const missingAmount = minOrder - subtotal;

                                    return (
                                        <div key={coupon.id} className={`voucher-item ${isSelected ? "active" : ""}`} style={{ opacity: isEligible ? 1 : 0.8 }}>
                                            <div className="voucher-left">
                                                <div className="voucher-icon-circle">
                                                    <img src={promoIcon} alt="icon" />
                                                </div>
                                                <span>VOUCHER</span>
                                            </div>
                                            <div className="voucher-right">
                                                <div className="voucher-content">
                                                    <h4>{coupon.code}</h4>
                                                    <p className="voucher-name">{coupon.name}</p>
                                                    <p className="voucher-desc">
                                                        Đơn tối thiểu: {formatPrice(minOrder)} <br />
                                                        {coupon.description}
                                                    </p>
                                                    <p className="expiry">HSD: {coupon.endDate ? new Date(coupon.endDate).toLocaleDateString("vi-VN") : "Vô thời hạn"}</p>
                                                    {!isEligible && missingAmount > 0 && (
                                                        <div className="buy-more-hint">Mua thêm {formatPrice(missingAmount)} để sử dụng</div>
                                                    )}
                                                </div>
                                                <div className="voucher-action">
                                                    {isEligible ? (
                                                        <button
                                                            className={`use-btn ${isSelected ? "selected" : ""}`}
                                                            onClick={() => !isSelected && handleApplyCoupon(coupon)}
                                                            disabled={isSelected}
                                                        >
                                                            {isSelected ? "Đã áp dụng" : "Áp dụng"}
                                                        </button>
                                                    ) : (
                                                        <button className="use-btn" style={{ backgroundColor: "#fff", color: "#C92127", border: "1px solid #C92127" }} onClick={() => navigate("/")}>
                                                            Mua thêm
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Checkout;