import trashIcon from "../../assets/trash.png";
import promoIcon from "../../assets/promote.png";
import moneyIcon from "../../assets/money.png";
import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { useNavigate } from 'react-router-dom';
import './Cart.css';

function Cart() {
  const navigate = useNavigate();

  const API_CART_URL = "/cart";
  const API_VOUCHER_URL = "/vouchers/active";

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- STATE CHO MODAL XÓA ---
  const [showModal, setShowModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [showPromoModal, setShowPromoModal] = useState(false);
  const [coupons, setCoupons] = useState([]); // Danh sách voucher từ API
  const [selectedCoupon, setSelectedCoupon] = useState(null); // Voucher object đang chọn
  const [discountAmount, setDiscountAmount] = useState(0);

  // 1. HÀM LOAD GIỎ HÀNG
  const fetchCart = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get(API_CART_URL);
      const backendData = response.data;

        if (backendData && backendData.items) {
        const formattedItems = backendData.items.map(item => ({
          id: item.id,
          bookId: item.bookId || null,
          name: item.bookTitle,
          price: item.price,
          originalPrice: item.price * 1.2,
          quantity: item.quantity,
          image: item.image || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=150&h=200&fit=crop",
          checked: true,
        }));
        setCartItems(formattedItems);
      }
    } catch (error) {
      console.error("Lỗi kết nối Backend:", error);
      // Nếu lỗi 401 Unauthorized -> Chưa có cookie hoặc cookie hết hạn
      if (error.response && error.response.status === 401) {
          alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
          navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // 2. XỬ LÝ CHECKBOX
  const handleCheckboxChange = (id) => {
    const updatedItems = cartItems.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setCartItems(updatedItems);
  };

  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    const updatedItems = cartItems.map(item => ({ ...item, checked: isChecked }));
    setCartItems(updatedItems);
  };

  // 3. CẬP NHẬT SỐ LƯỢNG
  const updateQuantity = async (id, change) => {
    const currentItem = cartItems.find(item => item.id === id);
    if (!currentItem) return;

    const newQuantity = currentItem.quantity + change;
    if (newQuantity < 1) return;

    try {
      await axiosClient.put(`${API_CART_URL}/update/${id}?quantity=${newQuantity}`);
      setCartItems(items =>
        items.map(item => item.id === id ? { ...item, quantity: newQuantity } : item)
      );
    } catch (error) {
      console.error("Lỗi update:", error);
      if (error.response?.status === 401) navigate('/login');
      else alert("Không thể cập nhật số lượng.");
    }
  };

  // --- LOGIC XÓA SẢN PHẨM MỚI ---

  const handleDeleteClick = (id) => {
    setItemToDelete(id); // Lưu ID cần xóa
    setShowModal(true);
  };

  // Khi bấm nút "Xóa" trong bảng thông báo -> Gọi API
  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      await axiosClient.delete(`${API_CART_URL}/remove/${itemToDelete}`);
      // Cập nhật UI
      setCartItems(items => items.filter(item => item.id !== itemToDelete));
      // Đóng bảng và reset ID
      closeModal();
    } catch (error) {
      console.error("Lỗi xóa:", error);
      if(error.response?.status === 401) navigate('/login');
      else alert("Lỗi khi xóa sản phẩm.");
      closeModal();
    }
  };

  // Bước 3: Đóng bảng thông báo (Khi bấm Hủy hoặc Xóa xong)
  const closeModal = () => {
    setShowModal(false);
    setItemToDelete(null);
  };

  // Tính tổng tiền tamj tính
  const subtotal = cartItems.reduce((sum, item) => item.checked ? sum + (item.price * item.quantity) : sum, 0);

  // --- HÀM MỞ MODAL & LẤY VOUCHER TỪ API (UPDATE) ---
    const handleOpenPromoModal = async () => {
      setShowPromoModal(true);
      try {
        const res = await axiosClient.get(API_VOUCHER_URL);
        setCoupons(res.data);
      } catch (error) {
        console.error("Lỗi lấy voucher:", error);
      }
    };

    // --- 3. HÀM ÁP DỤNG VOUCHER (UPDATE LOGIC PHỨC TẠP) ---
      const handleApplyCoupon = (voucher) => {
        // a. Kiểm tra giá trị đơn hàng tối thiểu (minOrderValue)
        if (voucher.minOrderValue && subtotal < voucher.minOrderValue) {
          alert(`Đơn hàng phải từ ${formatPrice(voucher.minOrderValue)} để dùng mã này!`);
          return;
        }

        let calculatedDiscount = 0;

        // b. Tính toán dựa trên DiscountType (PERCENTAGE hoặc FIXED_AMOUNT)
        if (voucher.discountType === 'FIXED_AMOUNT') {
          calculatedDiscount = voucher.discountValue;
        }
        else if (voucher.discountType === 'PERCENTAGE') {
          calculatedDiscount = subtotal * (voucher.discountValue / 100);

          // c. Kiểm tra giảm tối đa (maxDiscount) nếu có
          if (voucher.maxDiscount && calculatedDiscount > voucher.maxDiscount) {
            calculatedDiscount = voucher.maxDiscount;
          }
        }

        // Đảm bảo không giảm quá số tiền đơn hàng
        if (calculatedDiscount > subtotal) {
            calculatedDiscount = subtotal;
        }

        setSelectedCoupon(voucher);
        setDiscountAmount(calculatedDiscount);
        setShowPromoModal(false);
      };

  const total = subtotal - discountAmount > 0 ? subtotal - discountAmount : 0;
  // --- CHUYỂN SANG THANH TOÁN ---
      const handleCheckout = () => {
        const selectedItems = cartItems.filter(item => item.checked);
        if (selectedItems.length === 0) {
          alert("Vui lòng chọn ít nhất một sản phẩm!");
          return;
        }
        navigate('/checkout', { state: { items: selectedItems } });
      };
    const formatPrice = (price) => price?.toLocaleString('vi-VN') + ' ₫';

    if (loading) return <div style={{textAlign: 'center', marginTop: 50}}>⏳ Đang tải...</div>;

  return (
    <div className="cart-container">
      <div className="cart-content">
        <div className="cart-main">
          <h1 className="cart-title">GIỎ HÀNG <span className="item-count">({cartItems.length} sản phẩm)</span></h1>

          <div className="cart-items">
            {/* Header */}
            <div className="cart-header">
              <div className="header-checkbox">
                <input type="checkbox" id="select-all" onChange={handleSelectAll} checked={cartItems.length > 0 && cartItems.every(i => i.checked)} />
                <label htmlFor="select-all">Chọn tất cả</label>
              </div>
              <div className="header-quantity">Số lượng</div>
              <div className="header-price">Thành tiền</div>
            </div>

            {/* Item List */}
            {cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <div className="item-checkbox">
                  <input type="checkbox" checked={item.checked} onChange={() => handleCheckboxChange(item.id)} />
                </div>
                <div className="item-image">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="item-details">
                  <h3>{item.name}</h3>
                  <p style={{fontSize: '13px', color: '#666'}}>Phân loại: Tiêu chuẩn</p>
                  <div className="item-price-info">
                    <span className="current-price">{formatPrice(item.price)}</span>
                    <span className="original-price">{formatPrice(item.originalPrice)}</span>
                  </div>
                  {item.bookId && (
                    <button
                      className="view-detail-btn"
                      style={{marginTop: '8px', padding: '6px 10px', fontSize: '13px', cursor: 'pointer'}}
                      onClick={() => navigate(`/books/${item.bookId}`)}
                    >
                      Xem chi tiết
                    </button>
                  )}
                </div>
                <div className="item-quantity">
                  <button className="qty-btn" onClick={() => updateQuantity(item.id, -1)}>−</button>
                  <input type="text" value={item.quantity} readOnly className="qty-input" />
                  <button className="qty-btn" onClick={() => updateQuantity(item.id, 1)}>+</button>
                </div>
                <div className="item-total">{formatPrice(item.price * item.quantity)}</div>

                {/* Sửa onClick gọi hàm mở Modal */}
                <button className="item-remove" onClick={() => handleDeleteClick(item.id)}>
                  <img src={trashIcon} alt="delete" width="20" height="20" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="cart-sidebar">
          <div className="promo-section">
              <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <img src={promoIcon} alt="promo" width={24} height={24} />
                KHUYẾN MÃI
              </h3>
              <button className="view-more" onClick={handleOpenPromoModal}>Xem thêm →</button>

              {selectedCoupon ? (
               <div className="promo-card applied">
                  <div className="promo-info">
                      {/* Hiển thị code và mô tả từ Object Backend */}
                      <h4 style={{color: '#198754'}}>Đã áp dụng: {selectedCoupon.code}</h4>
                      <p>{selectedCoupon.name}</p>
                      <p style={{fontWeight: 'bold', color: '#d32f2f'}}>- {formatPrice(discountAmount)}</p>
                  </div>
                  <button className="remove-promo-btn" onClick={() => {setSelectedCoupon(null); setDiscountAmount(0)}}>Bỏ chọn</button>
               </div>
               ) : (
               <>
              <div className="promo-card">
                <div className="promo-info">
                  <h4>Mã Giảm 10K - Toàn Sàn</h4>
                  <p>Đơn hàng từ 130k - Không bao gồm giá trị của các sản phẩm sau Manga, Ngoại...</p>
                  <p className="promo-expiry">HSD: 31/12/2025</p>
                  <div className="promo-progress">
                    <div className="progress-bar">
                      <div className="progress-fill"></div>
                    </div>
                    <p>Mua thêm 28.600 ₫</p>
                  </div>
                </div>
                <button className="buy-more-btn">Mua thêm</button>
              </div>

              <div className="promo-input-section">
                <button className="promo-eligible">1 khuyến mãi đủ điều kiện →</button>
                <div className="gift-card-info">
                  <span>🎁 Hướng dẫn sử dụng Gift Card</span>
                  <span className="info-icon">ℹ️</span>
                </div>
              </div>
              </>
            )}
        </div>

            <div className="summary-section">
              <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <img src={moneyIcon} alt="money" width={24} height={24} />
                Nhận quà
              </h3>
              <button className="select-gift">Chọn quà →</button>

              <div className="price-summary">
                <div className="summary-row">
                  <span>Thành tiền</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="summary-row total">
                  <span>Tổng Số Tiền (gồm VAT)</span>
                  <span className="total-price">{formatPrice(total)}</span>
                </div>
              </div>

              <button className="checkout-btn" onClick={handleCheckout}>
                THANH TOÁN
              </button>
              <p className="discount-note">(Giảm giá trên web chỉ áp dụng cho bán lẻ)</p>
            </div>
        </div>
      </div>

      {/* --- MODAL DANH SÁCH VOUCHER --- */}
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
                      <img src={promoIcon} alt="" width="50" style={{opacity: 0.5}}/>
                      <p>Không có voucher nào khả dụng.</p>
                  </div>
              ) : coupons.map(coupon => {
                  // Kiểm tra xem voucher này có đang được chọn không
                  const isSelected = selectedCoupon && selectedCoupon.id === coupon.id;

                  return (
                      <div key={coupon.id} className={`voucher-item ${isSelected ? 'active' : ''}`}>
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
                              <p className="voucher-desc">{coupon.description || "Áp dụng cho mọi đơn hàng"}</p>
                              <p className="expiry">HSD: {coupon.endDate ? new Date(coupon.endDate).toLocaleDateString('vi-VN') : 'Vô thời hạn'}</p>
                          </div>

                          <div className="voucher-action">
                             {/* Nút bấm thay đổi trạng thái dựa vào isSelected */}
                             <button
                                className={`use-btn ${isSelected ? 'selected' : ''}`}
                                onClick={() => !isSelected && handleApplyCoupon(coupon)}
                                disabled={isSelected}
                             >
                                {isSelected ? 'Đã áp dụng ✓' : 'Áp dụng'}
                             </button>
                          </div>
                        </div>
                      </div>
                  );
              })}
            </div>
          </div>
        </div>
      )}

      {/* --- PHẦN BẢNG THÔNG BÁO (MODAL) --- */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Xác nhận xóa</h3>
            <p>Bạn có chắc chắn muốn xóa sản phẩm này?</p>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={closeModal}>Hủy</button>
              <button className="modal-btn confirm" onClick={confirmDelete}>Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;