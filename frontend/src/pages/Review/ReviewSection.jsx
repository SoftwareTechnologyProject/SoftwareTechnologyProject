import React, { useState, useEffect } from "react";
import { FaStar, FaUpload } from "react-icons/fa";
import axiosClient from "../../config/axiosConfig";
import "./ReviewSection.css";

export default function ReviewSection({ bookId }) {
  const [reviews, setReviews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;
  const [newReview, setNewReview] = useState({ rating: 0, text: "", images: [] });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    // TODO: Replace this with real authentication check
    // const token = localStorage.getItem('authToken');
    // setIsLoggedIn(!!token);
    
    // Mock: Temporarily set to true for development
    setIsLoggedIn(true);
  }, []);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axiosClient.get(`/api/books/${bookId}/reviews`);
        setReviews(res.data || []);
      } catch (err) {
        console.error("Không thể tải review", err);
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
    if (!isLoggedIn) {
      handleLoginRequired();
      return;
    }
    if (!newReview.rating || !newReview.text.trim()) return alert("Chọn sao và viết đánh giá");
    try {
      const formData = new FormData();
      formData.append("rating", newReview.rating);
      formData.append("text", newReview.text);
      newReview.images.forEach(img => formData.append("images", img));
      const res = await axiosClient.post(`/api/books/${bookId}/reviews`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setReviews([res.data, ...reviews]);
      setNewReview({ rating: 0, text: "", images: [] });
      setCurrentPage(1);
    } catch (err) {
      alert("Gửi review thất bại");
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
              onClick={isLoggedIn ? () => handleRatingClick(star) : handleLoginRequired}
              style={{ cursor: "pointer", opacity: isLoggedIn ? 1 : 0.6 }}
            />
          ))}
        </div>
        <textarea
          placeholder={isLoggedIn ? "Viết đánh giá của bạn..." : "Đăng nhập để viết đánh giá"}
          value={newReview.text}
          onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
          disabled={!isLoggedIn}
          onClick={!isLoggedIn ? handleLoginRequired : undefined}
        />
        <div className="file-upload-section">
          <label className="file-upload-btn" onClick={!isLoggedIn ? handleLoginRequired : undefined}>
            <FaUpload /> Chọn ảnh
            <input 
              type="file" 
              multiple 
              onChange={handleFileChange} 
              style={{ display: 'none' }}
              disabled={!isLoggedIn}
            />
          </label>
          {newReview.images.length > 0 && (
            <span className="file-count">{newReview.images.length} ảnh đã chọn</span>
          )}
        </div>
        <button 
          className="submit-review-btn" 
          onClick={handleSubmitReview}
          disabled={!isLoggedIn}
        >
          {isLoggedIn ? 'Gửi đánh giá' : 'Đăng nhập để đánh giá'}
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