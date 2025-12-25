import React, { useState, useEffect, useContext } from "react";
import { FaStar, FaUpload } from "react-icons/fa";
import axiosClient from "../../config/axiosConfig";
import "./ReviewSection.css";
import { AppContext } from "../../context/AppContext";

// MO TA: ReviewSection
// - Chuc nang: xem va viet danh gia cho sach
// - Su dung: axiosClient de lay va gui review
export default function ReviewSection({ bookId }) {
  const [reviews, setReviews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;
  const [newReview, setNewReview] = useState({ rating: 0, text: "", images: [] });
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const { isLoggedIn } = useContext(AppContext);
  const token = localStorage.getItem('accessToken');
  const effectiveIsLoggedIn = isLoggedIn || !!token;

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axiosClient.get(`/api/books/${bookId}/reviews`);
        const list = (res.data || []).map((r) => ({
          id: r.id,
          userName: r.userName || r.userName,
          date: r.createdAt ? new Date(r.createdAt).toLocaleString() : r.date || "",
          rating: r.rating || 0,
          text: r.comment || r.text || "",
          images: r.images || [],
          status: r.status,
        }));
        setReviews(list);
      } catch (err) {
        // Loi khi lay review tu backend
        console.error("Khong the tai review", err);
      }
    };
    fetchReviews();
  }, [bookId]);

  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  const handleRatingClick = (star) => setNewReview({ ...newReview, rating: star });
  const handleFileChange = (e) => setNewReview({ ...newReview, images: Array.from(e.target.files) });
  const handleLoginRequired = () => {
    setShowLoginPrompt(true);
    setTimeout(() => setShowLoginPrompt(false), 3000);
  };

  const handleSubmitReview = async () => {
    if (!effectiveIsLoggedIn) {
      handleLoginRequired();
      return;
    }
    if (!newReview.rating || !newReview.text.trim()) return alert("Chọn sao và viết đánh giá");
    try {
      // Backend expects JSON body: { rating, comment }
      const payload = { rating: newReview.rating, comment: newReview.text };
      console.log('Goi API gui review, payload:', payload);
      // Use full API path (backend controller is under /api/books/...)
      const res = await axiosClient.post(`/api/books/${bookId}/reviews`, payload);
      console.log('Gui review thanh cong:', res?.data);
      // Normalize backend response to front-end review shape
      const data = res.data || {};
      const normalized = {
        userName: data.userName || 'Bạn',
        date: data.createdAt ? new Date(data.createdAt).toLocaleString() : new Date().toLocaleString(),
        rating: data.rating || payload.rating,
        text: data.comment || newReview.text,
        images: data.images || newReview.images || [],
      };
      // Sau khi gui thanh cong, them review moi len dau danh sach
      setReviews([normalized, ...reviews]);
      setNewReview({ rating: 0, text: "", images: [] });
      setCurrentPage(1);
    } catch (err) {
      // Loi khi gui review
      console.error('Loi khi gui review:', err.response?.data || err);
      alert("Gửi review thất bại: " + (err.response?.data?.error || err.response?.data?.message || "Lỗi server"));
    }
  };

  return (
    <div className="review-section section-box">
      <h3>Đánh giá sản phẩm</h3>

      {/* Login Prompt */}
      {showLoginPrompt && (
        <div className="login-prompt">
          Bạn cần đăng nhập để viết đánh giá. <a href="/login">Đăng nhập ngay</a>
        </div>
      )}

      {/* Viết review */}
      <div className="write-review-box">
        <div className="star-picker">
          {[1, 2, 3, 4, 5].map((star) => (
            <FaStar
              key={star}
              size={20}
              color={newReview.rating >= star ? "#ffa500" : "#ddd"}
              onClick={effectiveIsLoggedIn ? () => handleRatingClick(star) : handleLoginRequired}
              style={{ cursor: "pointer", opacity: effectiveIsLoggedIn ? 1 : 0.6 }}
            />
          ))}
        </div>
        <textarea
          placeholder={effectiveIsLoggedIn ? "Viết đánh giá của bạn..." : "Đăng nhập để viết đánh giá"}
          value={newReview.text}
          onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
          disabled={!effectiveIsLoggedIn}
          onClick={!effectiveIsLoggedIn ? handleLoginRequired : undefined}
        />
        <div className="file-upload-section">
          <label className="file-upload-btn" onClick={!effectiveIsLoggedIn ? handleLoginRequired : undefined}>
            <FaUpload /> Chọn ảnh
            <input 
              type="file" 
              multiple 
              onChange={handleFileChange} 
              style={{ display: 'none' }}
              disabled={!effectiveIsLoggedIn}
            />
          </label>
          {newReview.images.length > 0 && (
            <span className="file-count">{newReview.images.length} ảnh đã chọn</span>
          )}
        </div>
        <button 
          className="submit-review-btn" 
          onClick={handleSubmitReview}
          disabled={!effectiveIsLoggedIn}
        >
          {effectiveIsLoggedIn ? 'Gửi đánh giá' : 'Đăng nhập để đánh giá'}
        </button>
      </div>

      {/* Hiển thị review */}
      {currentReviews.length === 0 ? (
        <div className="no-reviews">Chưa có đánh giá nào.</div>
      ) : (
        <div className="review-list">
          {currentReviews.map((rev, idx) => (
            <div key={idx} className="review-item">
              <div className="review-header">
                <span className="review-name">{rev.userName}</span>
                <span className="review-date">{rev.date}</span>
                <div className="review-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar key={star} size={16} color={rev.rating >= star ? "#ffa500" : "#ddd"} />
                  ))}
                </div>
              </div>
              <p className="review-text">{rev.text}</p>
              {rev.images?.length > 0 && (
                <div className="review-images">
                  {rev.images.map((img, i) => (
                    <img key={i} src={img} alt="review" />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="review-pagination">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={currentPage === i + 1 ? "active" : ""}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}