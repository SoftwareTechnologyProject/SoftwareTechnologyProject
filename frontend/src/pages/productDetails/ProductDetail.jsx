import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaShoppingCart } from "react-icons/fa";
import ReviewSection from "../Review/ReviewSection";
import "../Book/ProductDetail.css";

export default function BookDetail() {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // TODO: Replace with real authentication
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Mock: set to true for development
  
  const handleAuthRequired = (action) => {
    if (!isLoggedIn) {
      alert(`Bạn cần đăng nhập để ${action}`);
      // TODO: Redirect to login page
      // window.location.href = '/login';
      return false;
    }
    return true;
  };
  
  const handleAddToCart = () => {
    if (handleAuthRequired('thêm vào giỏ hàng')) {
      // TODO: Add to cart logic here
      alert('Đã thêm vào giỏ hàng!');
    }
  };
  
  const handleBuyNow = () => {
    if (handleAuthRequired('mua hàng')) {
      // TODO: Buy now logic here
      alert('Chuyển đến trang thanh toán!');
    }
  };

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8080/books/${id}`);
        setBook(response.data);
      } catch (err) {
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
              className={`thumb-item ${selectedImageIndex === idx ? "active" : ""}`}
              onClick={() => setSelectedImageIndex(idx)}
              onError={(e) => (e.target.style.display = "none")}
            />
          ))}
        </div>

        <div className="action-buttons">
          <button className="add-cart-btn" onClick={handleAddToCart}>
            <FaShoppingCart /> Thêm vào giỏ
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
          <div className="offers-box">
            <h4>Ưu đãi liên quan</h4>
            <div className="offer-list">
              <div>Giảm 10k - toàn sàn</div>
              <div>Giảm 20k - toàn sàn</div>
              <div>Shopeepay: -20k</div>
            </div>
          </div>

          <div className="category-qty-box">
            <div>
              <span>Phân loại: </span>
              <span className="category-tag">{category}</span>
            </div>

            <div className="qty-row">
              <span>Số lượng:</span>
              <div className="qty-controls">
                <button onClick={decreaseQuantity}>-</button>
                <span>{quantity}</span>
                <button onClick={increaseQuantity}>+</button>
              </div>
              <span>{variant?.quantity} có sẵn</span>
            </div>
          </div>
        </div>

        {/* Shipping */}
        <div className="shipping-box">
          <h4>Thông tin vận chuyển</h4>
          <span>Giao đến Long Xuyên, An Giang</span>
          <button className="change-location">Thay đổi</button>
        </div>
      </div>

      {/* BOTTOM: Details, Description, Reviews */}
      <div className="bottom-section">

        {/* Details */}
        <div className="section-box">
          <h3>Thông tin chi tiết</h3>
          <div className="details-grid">
            <div>
              <span>Mã hàng</span>
              <span>{variant?.isbn}</span>
            </div>
            <div>
              <span>Nhà cung cấp</span>
              <span>{book.publisherName}</span>
            </div>
            <div>
              <span>Tác giả</span>
              <span>{book.authorNames?.join(", ")}</span>
            </div>
            <div>
              <span>Năm XB</span>
              <span>{book.publisherYear}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="section-box">
          <h3>Mô tả sản phẩm</h3>
          <p>{book.description || "Chưa có mô tả"}</p>
        </div>

        {/* Reviews */}
        <ReviewSection bookId={id} />

      </div>
    </div>
  );
}