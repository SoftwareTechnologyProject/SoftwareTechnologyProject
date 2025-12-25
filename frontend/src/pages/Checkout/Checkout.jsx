import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { useLocation, useNavigate } from 'react-router-dom';
import "./Checkout.css";
import axios from 'axios';
import vnpayIcon from "../../assets/vnpay.png";
import cashIcon from "../../assets/money.png";

function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Nhận danh sách sản phẩm từ trang Cart (được truyền qua state) và Nếu không có (người dùng vào thẳng link), mặc định là mảng rỗng
  const {
        items: receivedItems = [],
        discountAmount: receivedDiscount = 0,
        couponCode: receivedCoupon = ''
  } = location.state || {};

  const [formData, setFormData] = useState({
      fullName: '',
      phone: '',
      country: 'Việt Nam',
      province: '',
      district: '',
      ward: '',
      address: ''
  });

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  useEffect(() => {
      const fetchProvinces = async () => {
        try {
          const response = await axios.get('https://esgoo.net/api-tinhthanh/1/0.htm', { withCredentials: false });
          if (response.data.error === 0) {
            setProvinces(response.data.data);
          }
        } catch (error) {
          console.error("Lỗi tải tỉnh thành:", error);
        }
      };
      fetchProvinces();
  }, []);

  // XỬ LÝ KHI CHỌN DROP DOWN
    const handleLocationChange = async (e) => {
      const { name, value } = e.target;

      // Cập nhật state formData
      setFormData(prev => ({ ...prev, [name]: value }));

      // Logic riêng cho từng cấp
      if (name === 'province') {
        // Nếu chọn Tỉnh -> Reset Huyện & Xã -> Load Huyện mới
        setDistricts([]);
        setWards([]);
        setFormData(prev => ({ ...prev, province: value, district: '', ward: '' }));

        if (value) {
          try {
            const res = await axios.get(`https://esgoo.net/api-tinhthanh/2/${value}.htm`, { withCredentials: false });
            if (res.data.error === 0) setDistricts(res.data.data);
          } catch (err) { console.error(err); }
        }
      }
      else if (name === 'district') {
        // Nếu chọn Huyện -> Reset Xã -> Load Xã mới
        setWards([]);
        setFormData(prev => ({ ...prev, district: value, ward: '' }));

        if (value) {
          try {
            const res = await axios.get(`https://esgoo.net/api-tinhthanh/3/${value}.htm`, { withCredentials: false });
            if (res.data.error === 0) setWards(res.data.data);
          } catch (err) { console.error(err); }
        }
      }
    };

  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [appliedPromo, setAppliedPromo] = useState(receivedCoupon);
  const [promoCode, setPromoCode] = useState(receivedCoupon);
  const [useFPoint, setUseFPoint] = useState(false);
  const [useFreeship, setUseFreeship] = useState(false);
  const [exportInvoice, setExportInvoice] = useState(false);

  //Kiểm tra xem có hàng để thanh toán không
  useEffect(() => {
      if (!receivedItems || receivedItems.length === 0) {
        alert("Bạn chưa chọn sản phẩm nào để thanh toán!");
        navigate("/cart");
      }
  }, [receivedItems, navigate]);

    useEffect(() => {
      const fetchUserProfile = async () => {
        try {
          const response = await axiosClient.get("/users/profile");
          const user = response.data;

          setFormData(prev => ({
            ...prev,
            fullName: user.fullName || '',
            phone: user.phoneNumber || '',
            address: user.address || '',
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

  // Helper object để map field name sang danh sách option tương ứng
    const locationOptions = {
      province: provinces,
      district: districts,
      ward: wards
    };

  const applyPromoCode = () => {
    if (promoCode.trim()) {
      setAppliedPromo(promoCode);
      setPromoCode('');
    }
  };

  const removePromo = () => {
    setAppliedPromo('');
  };

  const subtotal = receivedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discount = receivedDiscount;
  const shippingFee = 32000;

  const total = subtotal - discount > 0 ? subtotal - discount : 0;
  const totalWithShipping = total + shippingFee;
  const formatPrice = (price) => price.toLocaleString('vi-VN') + 'đ';

  // Create Object ORDER
  const handleOrderSubmit = async () => {
      if (!formData.fullName || !formData.phone || !formData.address || !formData.province || !formData.district || !formData.ward) {
        alert("Vui lòng điền đầy đủ thông tin giao hàng!");
        return;
      }

      // Tìm tên Tỉnh/Huyện/Xã từ ID (Vì formData chỉ lưu ID)
      const provinceName = provinces.find(p => p.id === formData.province)?.full_name || "";
      const districtName = districts.find(d => d.id === formData.district)?.full_name || "";
      const wardName = wards.find(w => w.id === formData.ward)?.full_name || "";

      // Tạo cấu trúc Object dữ liệu (Order Data)
      const orderPayload = {
        customerInfo: {
          fullName: formData.fullName,
          phoneNumber: formData.phone,
        },

        deliveryAddress: {
          country: "Việt Nam",
          province: provinceName,
          district: districtName,
          ward: wardName,
          details: formData.address,
          fullAddress: `${formData.address}, ${wardName}, ${districtName}, ${provinceName}`
        },

        paymentMethod: paymentMethod,
        couponCode: appliedPromo || null,

        items: receivedItems.map(item => ({
          bookId: item.bookVariantId || item.id,
          bookTitle: item.name,
          quantity: item.quantity,
          price: item.price,
          subTotal: item.price * item.quantity
        })),

        totalAmount: totalWithShipping,
        shippingFee: 32000,
        note: "Giao giờ hành chính"

      };

      const jsonString = JSON.stringify(orderPayload, null, 2);

      console.log("DỮ LIỆU ĐƠN HÀNG:");
      console.log(jsonString);

      alert("Đã tạo dữ liệu đơn hàng! Hãy kiểm tra Console (F12).");

      try {
            const response = await axiosClient.post('/orders', orderPayload);
            if (response.status === 200 || response.status === 201) {
               alert("Đặt hàng thành công!");
               navigate("/");
            }
        } catch (error) {
            console.error("Lỗi đặt hàng:", error);
            alert("Đặt hàng thất bại!");
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
                <label className="block text-sm mb-1">Họ và tên người nhận</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Số điện thoại</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm mb-1">Quốc gia</label>
              <select
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                <option>Việt Nam</option>
              </select>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4">
              {['province', 'district', 'ward'].map((field) => (
                <div key={field}>
                  <label className="block text-sm mb-1">
                    {field === 'province'
                      ? 'Tỉnh/Thành phố'
                      : field === 'district'
                      ? 'Quận/Huyện'
                      : 'Phường/Xã'}
                  </label>
                  <select
                    name={field}
                    value={formData[field]}
                    onChange={handleLocationChange}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  >
                    <option value="">Chọn</option>
                    {locationOptions[field]?.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.full_name}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <label className="block text-sm mb-1">Địa chỉ nhận hàng</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>
          </div>

          {/* SHIPPING METHOD */}
          <div className="form-section">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">PHƯƠNG THỨC VẬN CHUYỂN</h2>

              {/* Luôn hiển thị ô này, không cần điều kiện if/else nữa */}
              <div className="payment-option selected" style={{
                  cursor: 'default', /* Để chuột thường vì chỉ có 1 option */
                  border: '1px solid #C92127',
                  background: '#fff5f5',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px',
                  borderRadius: '8px'
              }}>

                    {/* Tạo hình nút Radio tròn đỏ */}
                    <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        border: '6px solid #C92127',
                        marginRight: '12px',
                        backgroundColor: 'white',
                        flexShrink: 0
                    }}></div>

                    {/* Nội dung chữ */}
                    <div>
                       <div style={{ fontWeight: '700', color: '#333', fontSize: '13px' }}>
                          Giao hàng tiêu chuẩn: 32.000 đ
                       </div>
                       <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                          Giao hàng từ 2-4 ngày làm việc
                       </div>
                    </div>
              </div>
            </div>
          {/* PAYMENT METHOD */}
          <div className="form-section bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">PHƯƠNG THỨC THANH TOÁN</h2>

            <div className="space-y-3">
              {[
                { id: 'vnpay', label: 'VNPAY ', icon: vnpayIcon },
                { id: 'cash', label: 'Thanh toán bằng tiền mặt khi nhận hàng ', icon: cashIcon }
              ].map((method) => (
                <label
                  key={method.id}
                  className={`payment-option flex items-center p-3 border rounded-md ${paymentMethod === method.id ? 'selected' : ""}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === method.id}
                    onChange={() => setPaymentMethod(method.id)}
                    className="w-4 h-4"
                  />
                  <img
                      src={method.icon}
                      alt={method.label}
                      className="ml-3 w-8 h-8 object-contain"
                    />

                  <span
                      className="ml-3"
                      style={{
                          fontSize: '13px',
                          color: '#333',
                          marginLeft: '12px'
                      }}
                    >
                      {method.label}
                    </span>
                </label>
              ))}
            </div>
          </div>


          {/* PROMO */}
          <div className="form-section bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">MÃ KHUYẾN MÃI / GIFT CARD</h2>

              {/* Sử dụng toán tử 3 ngôi để kiểm tra điều kiện */}
              {appliedPromo ? (
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#fef2e0', // Màu nền vàng nhạt Fahasa
                    border: '1px solid #fcdab0', // Viền màu cam nhạt
                    borderRadius: '6px',        // Bo góc giống ô input
                    padding: '10px 12px',       // Padding để tạo khoảng cách
                    fontSize: '14px',
                    height: '42px',             // Chiều cao cố định bằng ô input để không bị nhảy layout
                    boxSizing: 'border-box'
                }}>
                  {/* Mã code và icon */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ border: '1px solid #f7941e', color: '#f7941e', padding: '1px 4px', borderRadius: '3px', fontSize: '10px', fontWeight: 'bold' }}>VOUCHER</span>
                      <span style={{ color: '#f7941e', fontWeight: '600', fontSize: '15px' }}>
                        {appliedPromo}
                      </span>
                  </div>

                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Nhập mã khuyến mãi"
                    className="flex-1 px-3 py-2 border rounded-md text-sm"
                    style={{ height: '42px' }} // Cố định chiều cao
                  />

                </div>
              )}
            </div>
        </div>

        {/* RIGHT SIDE (ORDER SUMMARY) */}
        <div className="w-full md:w-[380px]">
          <div className="sticky-sidebar">
            <h3 style={{fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px'}}>
                KIỂM TRA ĐƠN HÀNG
            </h3>

            <div className="order-items-scroll" style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '5px', marginBottom: '15px' }}>
              {receivedItems.map((item) => (
                <div key={item.id} style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                  <div className="relative">
                    <img src={item.image} className="summary-img" />
                    {item.badge && (
                      <span className="discount-badge badge-pulse absolute -top-1 -right-1 px-2 py-0.5 text-white text-xs rounded">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  <div className="flex-1">
                    <h4 style={{
                        fontSize: '15px',     // Cỡ chữ tên sách
                        fontWeight: '600',
                        lineHeight: '1.4',
                        marginBottom: '4px',
                        color: '#333',
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' // Giới hạn 2 dòng
                    }}>
                        {item.name}
                    </h4>
                    <div className="flex gap-2 mt-1" style={{ fontSize: '14px' }}>
                      <span className="text-red-600 font-semibold">{formatPrice(item.price)}</span>
                        {item.price !== item.originalPrice && (
                           <span className="text-gray-400 line-through">{formatPrice(item.originalPrice)}</span>
                        )}
                    </div>
                    <div className="flex justify-between items-center mt-2" style={{ fontSize: '14px' }}>
                      <span className="text-gray-500">x{item.quantity}</span>
                        <span className="text-red-600 font-semibold">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2" style={{ fontSize: '18px', color: '#444' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px' }}>
                  <span>Thành tiền:</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

              {discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px' }}>
                     <span>Giảm giá:</span>
                     <span style={{ color: '#2eb85c', fontWeight: 'bold' }}>-{formatPrice(discount)}</span>
                  </div>
                )}

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px' }}>
                  <span>Phí vận chuyển:</span>
                  <span>{formatPrice(32000)}</span>
                </div>

              <div className="flex justify-between text-base font-semibold pt-2 border-t total-price">
                <span>Tổng tiền:</span>
                <span className="text-red-600 text-xl">{formatPrice(totalWithShipping)}</span>
              </div>
            </div>

            <button
                onClick={handleOrderSubmit}
                className="checkout-button mt-4 w-full py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
            >
              Xác nhận thanh toán
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Checkout;