import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import "./Checkout.css";

function Checkout() {
  axios.defaults.withCredentials = true;
  const navigate = useNavigate();
  const location = useLocation();

  // Nhận danh sách sản phẩm từ trang Cart (được truyền qua state) và Nếu không có (người dùng vào thẳng link), mặc định là mảng rỗng
  const receivedItems = location.state?.items || [];

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
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState('Mã giảm 10k');
  const [useFPoint, setUseFPoint] = useState(false);
  const [useFreeship, setUseFreeship] = useState(false);
  const [exportInvoice, setExportInvoice] = useState(false);

  // Kiểm tra xem có hàng để thanh toán không
//   useEffect(() => {
//       if (!receivedItems || receivedItems.length === 0) {
//         alert("Bạn chưa chọn sản phẩm nào để thanh toán!");
//         navigate("/cart");
//       }
//   }, [receivedItems, navigate]);

  // Gọi API lấy thông tin người dùng (Tự động kèm Cookie)
    useEffect(() => {
      const fetchUserProfile = async () => {
        try {
          const response = await axios.get("http://localhost:8080/api/users/profile");
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
  const discount = 10000;
  const total = subtotal - discount;
  const formatPrice = (price) => price.toLocaleString('vi-VN') + 'đ';

  // Create Object ORDER
  const handleOrderSubmit = () => {
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

        items: orderItems.map(item => ({
          bookId: item.id || item.bookVariantId,
          bookTitle: item.name,
          quantity: item.quantity,
          price: item.price,
          subTotal: item.price * item.quantity
        })),

        totalAmount: total,
        shippingFee: 0,
        note: "Giao giờ hành chính"

      };

      const jsonString = JSON.stringify(orderPayload, null, 2);

      console.log("DỮ LIỆU ĐƠN HÀNG:");
      console.log(jsonString);

      alert("Đã tạo dữ liệu đơn hàng! Hãy kiểm tra Console (F12).");

      // TODO: Gửi jsonString này xuống Backend API
      // await axios.post('http://localhost:8080/api/orders', orderData);
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
              </div> thư viện Axios tự động biến Object đó thành chuỗi JSO

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
          <div className="form-section bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">PHƯƠNG THỨC VẬN CHUYỂN</h2>
            <p className="text-sm text-gray-600">Vui lòng điền đầy đủ địa chỉ trước.</p>
          </div>

          {/* PAYMENT METHOD */}
          <div className="form-section bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">PHƯƠNG THỨC THANH TOÁN</h2>

            <div className="space-y-3">
              {[
                { id: 'zalopay', label: 'Ví ZaloPay', icon: '💳' },
                { id: 'vnpay', label: 'VNPAY', icon: '💳' },
                { id: 'shopeepay', label: 'Ví ShopeePay', icon: '🛍️' },
                { id: 'momo', label: 'Ví MoMo', icon: '💰' },
                { id: 'atm', label: 'ATM / Internet Banking', icon: '🏧' },
                { id: 'visa', label: 'Visa / Master / JCB', icon: '💳' },
                { id: 'cash', label: 'Tiền mặt khi nhận hàng', icon: '💵' }
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
                  <span className="ml-3 text-xl">{method.icon}</span>
                  <span className="ml-2 text-sm">{method.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* MEMBER */}
          <div className="form-section bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">THÀNH VIÊN FAHASA</h2>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Số F-Point hiện có:</span>
                <span className="text-orange-500 font-semibold">0</span>
              </div>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={useFPoint}
                  onChange={(e) => setUseFPoint(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="ml-2 text-sm text-gray-600">Dùng 0 F-Point</span>
              </label>

              <div className="flex justify-between text-sm">
                <span>Số lần freeship:</span>
                <span className="text-orange-500 font-semibold">0</span>
              </div>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={useFreeship}
                  onChange={(e) => setUseFreeship(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="ml-2 text-sm text-gray-600">Sử dụng freeship</span>
              </label>
            </div>
          </div>

          {/* PROMO */}
          <div className="form-section bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">MÃ KHUYẾN MÃI / GIFT CARD</h2>

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Nhập mã khuyến mãi"
                className="flex-1 px-3 py-2 border rounded-md text-sm"
              />
              <button onClick={applyPromoCode} className="px-6 py-2 bg-blue-600 text-white rounded-md">
                Áp dụng
              </button>
            </div>

            {appliedPromo && (
              <div className="promo-tag mt-3 flex items-center gap-2 bg-orange-50 px-3 py-2 rounded-md">
                <span className="text-orange-600 font-medium text-sm">{appliedPromo}</span>
                <button onClick={removePromo} className="ml-auto text-orange-600">✕</button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE (ORDER SUMMARY) */}
        <div className="w-[360px]">
          <div className="sticky-sidebar bg-white rounded-lg shadow p-6 sticky top-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">KIỂM TRA ĐƠN HÀNG</h2>

            <div className="order-summary space-y-4 max-h-[300px] overflow-y-auto mb-4">
              {receivedItems.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative">
                    <img src={item.image} className="product-image w-16 h-20 rounded object-cover" />
                    {item.badge && (
                      <span className="discount-badge badge-pulse absolute -top-1 -right-1 px-2 py-0.5 text-white text-xs rounded">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  <div className="flex-1">
                    <h4 className="text-xs text-gray-700 line-clamp-2">{item.name}</h4>
                    <div className="flex gap-2 text-xs mt-1">
                      <span className="text-red-600 font-semibold">{formatPrice(item.price)}</span>
                      <span className="text-gray-400 line-through">{formatPrice(item.originalPrice)}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-500">x{item.quantity}</span>
                      <span className="text-sm text-red-600 font-semibold">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Thành tiền:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Giảm giá:</span>
                <span className="text-red-600">-{formatPrice(discount)}</span>
              </div>

              <div className="flex justify-between text-base font-semibold pt-2 border-t total-price">
                <span>Tổng tiền:</span>
                <span className="text-red-600 text-xl">{formatPrice(total)}</span>
              </div>
            </div>

            <button className="checkout-button mt-4 w-full py-3 bg-red-600 text-white rounded-md">
              Xác nhận thanh toán
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Checkout;
