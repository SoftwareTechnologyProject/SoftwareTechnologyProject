import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axiosClient from "../../config/axiosConfig";
import { FaShoppingCart } from "react-icons/fa";
import ReviewSection from "../Review/ReviewSection";
import Toast from "../../components/Toast/Toast";
import Andress from "../Andress/Andress";
import { useContext } from "react";
import { AppContext } from "../../context/AppContext";

// MO TA: ProductDetail
// - Chuc nang: hien thi chi tiet san pham, them vao gio hang, mua ngay, chon dia chi
// - Su dung: axiosClient de goi API backend (baseURL tu axiosConfig), Toast de hien thong bao
// - Khi them vao gio: goi API /api/cart/add va gui thong bao den backend (/api/notifications/send)
// - Dia chi: da tach modal dia chi ra component Andress de su dung lai va khong fix cung dia chi
import "../Book/ProductDetail.css";

export default function BookDetail() {
  const { id } = useParams();
  console.log(id);
  const [quantity, setQuantity] = useState(1);
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [buyNowLoading, setBuyNowLoading] = useState(false);
  const [addCartStatus, setAddCartStatus] = useState(null);
  const [addCartLoading, setAddCartLoading] = useState(false);

  // NOTE: use authentication state from AppContext instead of local mock
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('Long Xuyên, An Giang');
  const [addressForm, setAddressForm] = useState({
    city: '',
    district: '',
    ward: ''
  });
  const [addressType, setAddressType] = useState('default'); // 'default' or 'other'

  const handleAuthRequired = (action) => {
    const token = localStorage.getItem('accessToken');
    console.log('Auth check - isLoggedIn:', isLoggedIn, 'token?', !!token);
    if (!isLoggedIn && !token) {
      alert(`Bạn cần đăng nhập để ${action}`);
      return false;
    }
    // Nếu token tồn tại nhưng AppContext chưa cập nhật, vẫn cho phép hành động (dev flow)
    return true;
  };
  // Lay thong tin dang nhap va user tu AppContext (thay cho mock)
  const { userData, isLoggedIn } = useContext(AppContext);

  const handleAddToCart = async () => {
    if (handleAuthRequired('thêm vào giỏ hàng')) {
      try {
        if (!variant?.id) {
          alert('Không có biến thể sản phẩm để thêm vào giỏ hàng');
          return;
        }
        const cartItem = {
          bookVariantId: variant.id,
          quantity: quantity
        };
        console.log('Goi API them vao gio hang, payload:', cartItem);
        // HAM: them vao gio hang
        // - goi API /api/cart/add
        // - neu thanh cong: hien toast va goi service gui thong bao (notification)
        setAddCartStatus('Đang thêm vào giỏ...');
        setAddCartLoading(true);
        const addRes = await axiosClient.post(`/api/cart/add`, cartItem);
        console.log('Them vao gio hang thanh cong:', addRes?.data);
        setAddCartStatus('Thêm vào giỏ thành công');
        // Send user notification via backend
        try {
          const notiPayload = {
            content: `Đã thêm \"${book.title}\" vào giỏ hàng.`,
            url: "/cart",
            type: "PERSONAL",
            userId: userData?.id || null
          };
          // Use POST to send notification payload (server now accepts POST)
          await axiosClient.post('/api/notifications/send', notiPayload);
          // Lấy noti mới nhất từ server và dispatch event để header/notification component nhận
          try {
            const latestRes = await axiosClient.get('/api/notifications?page=0&size=1');
            const latest = latestRes.data?.content?.[0] ?? null;
            if (latest) {
              window.dispatchEvent(new CustomEvent('new-notification', { detail: latest }));
            }
          } catch (e) {
            console.warn('Không lấy được thông báo mới sau khi gửi', e);
          }
        } catch (e) {
          console.warn("Không thể gửi thông báo:", e);
        }

        setShowToast(true);
        setAddCartLoading(false);
      } catch (error) {
        console.error('Error adding to cart:', error);
        console.error('Error details:', error.response?.data);
        const msg = error.response?.data || error.message || 'Không thể thêm vào giỏ hàng';
        try {
          setAddCartStatus('Thất bại: ' + (typeof msg === 'string' ? msg : JSON.stringify(msg)));
        } catch (e) { /* ignore */ }
        alert('Không thể thêm vào giỏ hàng. Vui lòng thử lại!');
        setAddCartLoading(false);
      }
    }
  };

  const handleBuyNow = async () => {
    if (handleAuthRequired('mua hàng')) {
      try {
        setBuyNowLoading(true);
        // Thêm vào giỏ trước
        const cartItem = {
          bookVariantId: variant?.id,
          quantity: quantity
        };

        await axiosClient.post(`/api/cart/add`, cartItem);

        // Fetch cart to get items with proper data
        const cartResponse = await axiosClient.get('/api/cart');
        const cartData = cartResponse.data;

        if (cartData && cartData.items) {
          const formattedItems = cartData.items.map(item => ({
            id: item.id,
            name: item.bookTitle,
            price: item.price,
            originalPrice: item.price * 1.2,
            quantity: item.quantity,
            image: item.image || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=150&h=200&fit=crop",
            checked: true,
          }));

          // Navigate to checkout with cart items
          window.location.href = '/checkout';
          // Or better: navigate('/checkout', { state: { items: formattedItems } });
        }
      } catch (error) {
        console.error('Error during buy now:', error);
        console.error('Error details:', error.response?.data);
        alert('Không thể thực hiện. Vui lòng thử lại!');
        setBuyNowLoading(false);
      }
    }
  };

  const handleChangeLocation = () => {
    if (handleAuthRequired('thay đổi địa chỉ giao hàng')) {
      setShowLocationModal(true);
    }
  };

  const handleAddressSubmit = (addr) => {
    if (addr) setSelectedAddress(addr);
    setShowLocationModal(false);
  };

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        setLoading(true);
        console.log('Fetching book ID:', id);
        const response = await axiosClient.get(`/api/books/${id}`);
        console.log('Book data:', response.data);
        setBook(response.data);
      } catch (err) {
        console.error('Error fetching book:', err);
        console.error('Error response:', err.response?.data);
        setError("Không thể tải thông tin sách");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBookDetails();
  }, [id]);

  if (loading)
    return <div className="loading-container">Đang tải...</div>;

  if (error)
    return <div className="error-container">{error}</div>;

  if (!book)
    return <div className="error-container">Không tìm thấy sách</div>;

  const variant = book.variants?.[0];
  const images = variant?.imageUrls || [];
  const category = book.categoryNames?.[0] || "Chưa phân loại";

  // Tính discount
  const discountPercent = variant?.discount || 20;
  const originalPrice = variant?.price
    ? Math.round(variant.price * 100 / (100 - discountPercent))
    : 0;

  const increaseQuantity = () => {
    if (quantity < (variant?.quantity || 0)) setQuantity(quantity + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  return (
    <div className="product-detail-page">

      {/* LEFT: Images */}
      <div className="left-section">
        <div className="main-image">
          {images.length ? (
            <img
              src={images[selectedImageIndex]}
              alt={book.title}
              onError={(e) => (e.target.src = "/api/placeholder/400/400")}
            />
          ) : (
            <div className="no-img">Chưa có ảnh</div>
          )}
        </div>
        <div className="thumb-list">
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`Ảnh sách ${book.title} - hình ${idx + 1}`}
              className={`thumb-item ${selectedImageIndex === idx ? "active" : ""}`}
              onClick={() => setSelectedImageIndex(idx)}
              onError={(e) => (e.target.style.display = "none")}
            />
          ))}
        </div>

        <div className="action-buttons">

          <button className="add-cart-btn" onClick={handleAddToCart} disabled={addCartLoading}>
            {addCartLoading ? <span className="btn-spinner" /> : <FaShoppingCart />} {addCartLoading ? 'Đang thêm...' : 'Thêm vào giỏ'}
          </button>
          <button className="buy-now-btn" onClick={handleBuyNow}>Mua ngay</button>
        </div>

        <div className="policies-box">
          <div>Giao hàng nhanh & uy tín</div>
          <div>Đổi trả miễn phí toàn quốc</div>
          <div>Ưu đãi cho khách mua sỉ</div>
        </div>
      </div>

      {/* RIGHT: Product Summary */}
      <div className="right-section">

        {/* Summary */}
        <div className="product-summary">
          <h1>{book.title}</h1>
          <div className="meta-info">
            <span>Nhà cung cấp: {book.publisherName}</span>
            <span>Nhà xuất bản: {book.publisherName}</span>
            <span>Tác giả: {book.authorNames?.join(", ")}</span>
            <span>Hình thức: {variant?.format || "Bìa Cứng"}</span>
          </div>

          <div className="rating-sold">
            <div className="rating">
              <span className="stars">★★★★★</span>
              <span>(Chưa có đánh giá)</span>
            </div>
            <span>Đã bán: {variant?.sold || 0}</span>
          </div>

          <div className="price-block">
            <span className="price-current">{variant?.price?.toLocaleString()}₫</span>
            <span className="price-old">{originalPrice.toLocaleString()}₫</span>
            <span className="badge-discount">-{discountPercent}%</span>
          </div>

          <div className="stock-info">{variant?.quantity} sản phẩm còn hàng</div>
        </div>

        {/* Offers + Category + Quantity */}
        <div className="offers-category-qty">

          <div className="category-qty-box">
            <div>
              <span>Phân loại: </span>
              <span className="category-tag">{category}</span>
            </div>

            <div className="qty-row">
              <span>Số lượng:</span>
              <div className="qty-controls">
                <button
                  onClick={decreaseQuantity}
                  title="Giảm số lượng"
                  aria-label="Giảm số lượng"
                >-</button>
                <span>{quantity}</span>
                <button
                  onClick={increaseQuantity}
                  title="Tăng số lượng"
                  aria-label="Tăng số lượng"
                >+</button>
              </div>
              <span>{variant?.quantity} có sẵn</span>
            </div>
          </div>
        </div>

        {/* Shipping */}
        <div className="shipping-box">
          <h4>Thông tin vận chuyển</h4>
          <div className="delivery-location">
            <span>Giao đến {selectedAddress}</span>
            <button
              className="change-location"
              onClick={handleChangeLocation}
              title="Thay đổi địa chỉ giao hàng"
              aria-label="Thay đổi địa chỉ giao hàng"
            >
              Thay đổi
            </button>
          </div>
        </div>

        <div className="book-details-section">
          <h3 className="section-title">Thông tin chi tiết</h3>
          <div className="details-grid">
            <div className="detail-row">
              <span className="detail-label">Mã hàng</span>
              <span>{variant?.isbn}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Nhà cung cấp</span>
              <span>{book.publisherName}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Tác giả</span>
              <span>{book.authorNames?.join(", ")}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Năm XB</span>
              <span >{book.publisherYear}</span>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM: Details, Description, Reviews */}
      <div className="bottom-section">

        {/* Description */}
        <div className="section-box">
          <h3>Mô tả sản phẩm</h3>
          <p>{book.description || "Chưa có mô tả"}</p>
        </div>

        {/* Reviews */}
        <ReviewSection bookId={id} />

      </div>

      {/* Location Modal */}
      {showLocationModal && (
        <Andress
          show={showLocationModal}
          onClose={() => setShowLocationModal(false)}
          onConfirm={handleAddressSubmit}
          userAddresses={userData?.addresses || (userData?.address ? [userData.address] : [])}
        />
      )}

      {/* Toast notification */}
      {showToast && (
        <Toast
          message="Đã thêm vào giỏ hàng!"
          linkText="Xem ngay"
          linkHref="/cart"
          onClose={() => setShowToast(false)}
        />
      )}

      {/* Loading overlay for Buy Now */}
      {buyNowLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px 48px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '500',
            color: '#333'
          }}>
            Đang chuyển tới giỏ hàng...
          </div>
        </div>
      )}
    </div>
  );
}