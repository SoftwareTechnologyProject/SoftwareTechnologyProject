import trashIcon from "../../assets/trash.png";
import promoIcon from "../../assets/promote.png";
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

  // HÀM LOAD GIỎ HÀNG
  const fetchCart = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get(API_CART_URL);
      const backendData = response.data;

        if (backendData && backendData.items) {
        const formattedItems = backendData.items.map(item => ({
          id: item.id,
          bookVariantId: item.bookVariantId,
          bookId: item.bookId || null,
          name: item.bookTitle,
          price: item.price,
          originalPrice: item.price * 1.2,
          quantity: item.quantity,
          image: item.image || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=150&h=200&fit=crop",
          checked: false,
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

  const fetchCoupons = async () => {
      try {
        const res = await axiosClient.get(API_VOUCHER_URL);
        setCoupons(res.data);
      } catch (error) {
        console.error("Lỗi lấy voucher:", error);
      }
  };

  useEffect(() => {
    fetchCart();
    fetchCoupons();
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

  // CẬP NHẬT SỐ LƯỢNG
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
      setCartItems(items => items.filter(item => item.id !== itemToDelete));
      closeModal();
    } catch (error) {
      console.error("Lỗi xóa:", error);
      if(error.response?.status === 401) navigate('/login');
      else alert("Lỗi khi xóa sản phẩm.");
      closeModal();
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setItemToDelete(null);
  };

  // Tính tổng tiền tamj tính
  const subtotal = cartItems.reduce((sum, item) => item.checked ? sum + (item.price * item.quantity) : sum, 0);

    // Tìm voucher có điều kiện thấp nhất mà khách CHƯA đạt được
    const nextPotentialCoupon = coupons
      .filter(c => subtotal < (c.minOrderValue || 0)) // Lọc voucher chưa đủ điều kiện
      .sort((a, b) => (a.minOrderValue || 0) - (b.minOrderValue || 0))[0];

    let progressPercent = 100;
    let missingAmount = 0;

    if (nextPotentialCoupon) {
        const minVal = nextPotentialCoupon.minOrderValue || 0;
        missingAmount = minVal - subtotal;
        progressPercent = (subtotal / minVal) * 100;
        if (progressPercent > 100) progressPercent = 100;
    }

    const handleBuyMore = () => {
        navigate('/');
    };

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
        // Kiểm tra giá trị đơn hàng tối thiểu (minOrderValue)
        if (voucher.minOrderValue && subtotal < voucher.minOrderValue) {
          alert(`Đơn hàng phải từ ${formatPrice(voucher.minOrderValue)} để dùng mã này!`);
          return;
        }

        let calculatedDiscount = 0;

        // Tính toán dựa trên DiscountType (PERCENTAGE hoặc FIXED_AMOUNT)
        if (voucher.discountType === 'FIXED_AMOUNT') {
          calculatedDiscount = voucher.discountValue;
        }
        else if (voucher.discountType === 'PERCENTAGE') {
          calculatedDiscount = subtotal * (voucher.discountValue / 100);

          // Kiểm tra giảm tối đa (maxDiscount)
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
        navigate('/checkout', {
            state: {
                items: selectedItems,
                discountAmount: discountAmount,
                couponCode: selectedCoupon ? selectedCoupon.code : null
            }
        });
      };
    const formatPrice = (price) => price?.toLocaleString('vi-VN') + ' ₫';
    const hasSelectedItems = cartItems.some(item => item.checked);

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
                <label htmlFor="select-all" style={{ color: 'white', fontWeight: 'bold' }}>
                    Chọn tất cả
                </label>
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
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <h3 style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
                      <img src={promoIcon} alt="promo" width={24} height={24} />
                      KHUYẾN MÃI
                  </h3>
                  <span className="view-more" onClick={handleOpenPromoModal} style={{cursor: 'pointer', color: '#0d6efd', fontSize: '13px'}}>
                      Xem thêm <i className="arrow right"></i>
                  </span>
              </div>

              {/* --- HIỂN THỊ VOUCHER ĐÃ CHỌN (STYLE FAHASA) --- */}
              {selectedCoupon ? (
                  <div className="fahasa-applied-coupon">
                      <div className="coupon-tag-content">
                          {/* Icon cái vé hoặc icon % */}
                          <span style={{border: '1px solid #f7941e', padding: '0 4px', fontSize: '10px', borderRadius: '2px'}}>VOUCHER</span>
                          <span>{selectedCoupon.code}</span>
                      </div>
                      <button className="btn-remove-coupon" onClick={() => {setSelectedCoupon(null); setDiscountAmount(0)}}>✕</button>
                  </div>
              ) : (
                  <div className="promo-placeholder" onClick={handleOpenPromoModal} style={{marginTop: '10px', fontSize: '13px', color: '#666', cursor: 'pointer'}}>
                      Chọn hoặc nhập mã khuyến mãi
                  </div>
              )}

              {/* --- THANH PROGRESS BAR ĐỘNG --- */}
                {/* Chỉ hiện khi chưa chọn voucher VÀ tìm thấy voucher tiềm năng */}
                {nextPotentialCoupon && (
                    <div className="fahasa-promo-suggestion">
                        <div className="suggestion-header">
                            <span className="suggestion-title">{nextPotentialCoupon.name || `Mã ${nextPotentialCoupon.code}`}</span>
                            <div className="info-icon" title="Chi tiết điều kiện">!</div>
                        </div>

                        <p className="suggestion-desc">
                            Đơn hàng từ {formatPrice(nextPotentialCoupon.minOrderValue)} - {nextPotentialCoupon.description || "Áp dụng cho các sản phẩm hợp lệ."}
                        </p>

                        <p className="suggestion-expiry">
                            HSD: {nextPotentialCoupon.endDate ? new Date(nextPotentialCoupon.endDate).toLocaleDateString('vi-VN') : 'Vô thời hạn'}
                        </p>

                        <div className="suggestion-footer">
                            <div className="progress-area">
                                <div className="fahasa-progress-track">
                                    <div
                                        className="fahasa-progress-fill"
                                        style={{width: `${progressPercent}%`}}
                                    ></div>
                                </div>
                                <p className="missing-text">Mua thêm {formatPrice(missingAmount)}</p>
                            </div>

                            <button className="btn-buy-more-fahasa" onClick={handleBuyMore}>
                                Mua thêm
                            </button>
                        </div>
                    </div>
                )}

                {/* Thông báo nếu đã đủ điều kiện hết các voucher */}
                {!nextPotentialCoupon && coupons.length > 0 && (
                    <div style={{marginTop: '10px', color: '#2eb85c', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px'}}>
                        <span> Bạn đã đủ điều kiện áp dụng các mã giảm giá hiện có!</span>
                    </div>
                )}
          </div>

            <div className="summary-section">
              <div className="price-summary">
                  <div className="summary-row">
                      <span>Thành tiền</span>
                      <span>{formatPrice(subtotal)}</span>
                  </div>

                  {discountAmount > 0 && (
                      <div className="summary-discount-row">
                          <span>
                              Giảm giá {selectedCoupon ? `(${selectedCoupon.code})` : ''}
                          </span>
                          <span className="summary-discount-value">
                              -{formatPrice(discountAmount)}
                          </span>
                      </div>
                  )}

                  <div className="summary-row total" style={{borderTop: '1px solid #eee', paddingTop: '10px', marginTop: '10px'}}>
                      <span>Tổng Số Tiền (gồm VAT)</span>
                      <span className="total-price" style={{color: '#C92127', fontSize: '20px', fontWeight: 'bold'}}>
                          {formatPrice(total)}
                      </span>
                  </div>
              </div>

              <button
                  className="checkout-btn"
                  onClick={handleCheckout}
                  disabled={!hasSelectedItems}
              >
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
                  const minOrder = coupon.minOrderValue || 0;
                  const isEligible = subtotal >= minOrder;

                  const missingAmount = minOrder - subtotal;

                  return (
                    <div key={coupon.id} className={`voucher-item ${isSelected ? 'active' : ''}`} style={{ opacity: isEligible ? 1 : 0.8 }}>
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
                                Đơn tối thiểu: {formatPrice(minOrder)} <br/>
                                {coupon.description}
                            </p>
                            <p className="expiry">HSD: {coupon.endDate ? new Date(coupon.endDate).toLocaleDateString('vi-VN') : 'Vô thời hạn'}</p>
                            {!isEligible && missingAmount > 0 && (
                                <div className="buy-more-hint">
                                   Mua thêm {formatPrice(missingAmount)} để sử dụng
                                </div>
                            )}
                        </div>

                        <div className="voucher-action">
                           {isEligible ? (
                               <button
                                  className={`use-btn ${isSelected ? 'selected' : ''}`}
                                  onClick={() => !isSelected && handleApplyCoupon(coupon)}
                                  disabled={isSelected}
                               >
                                  {isSelected ? 'Đã áp dụng' : 'Áp dụng'}
                               </button>
                           ) : (
                               <button
                                  className="use-btn"
                                  style={{
                                      backgroundColor: '#fff',
                                      color: '#C92127',
                                      border: '1px solid #C92127'
                                  }}
                                  onClick={handleBuyMore}
                               >
                                  Mua thêm
                               </button>
                           )}
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