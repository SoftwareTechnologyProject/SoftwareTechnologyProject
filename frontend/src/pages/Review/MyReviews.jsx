import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import "./MyReviews.css";

const MyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyReviews();
  }, []);

  const fetchMyReviews = async () => {
    try {
      // ✅ GỌI API /reviews/me (ĐÚNG VỚI BACKEND)
      const res = await axiosClient.get("/reviews/me");
      setReviews(res.data);
    } catch (err) {
      console.error("Lỗi lấy nhận xét:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      APPROVED: { text: "Đã duyệt", class: "status-approved" },
      PENDING: { text: "Chờ duyệt", class: "status-pending" },
      REJECTED: { text: "Bị từ chối", class: "status-rejected" },
    };
    return statusConfig[status] || { text: status, class: "status-default" };
  };

  if (loading) {
    return <p>Đang tải nhận xét...</p>;
  }

  return (
    <main>
      <div className="my-reviews-container">
        <h1 className="my-reviews-title">Nhận xét của tôi</h1>

        {reviews.length === 0 ? (
          <p className="no-reviews-text">Bạn chưa có nhận xét nào.</p>
        ) : (
          <div className="reviews-list">
            {reviews.map((r) => {
              const statusBadge = getStatusBadge(r.status);
              return (
              <div key={r.id} className={`review-card ${r.status === 'REJECTED' ? 'rejected' : ''}`}>
                <div className="review-header">
                  <div className="review-title-row">
                    <span className="review-product-title">
                      {r.bookTitle}
                    </span>
                    <span className={`review-status-badge ${statusBadge.class}`}>
                      {statusBadge.text}
                    </span>
                  </div>
                  <span className="review-rating">
                    {"⭐".repeat(r.rating || 0)}
                  </span>
                </div>

                <p className="review-content">{r.comment}</p>
                {r.status === 'REJECTED' && (
                  <p className="rejection-note">💡 Đánh giá này đã bị từ chối bởi quản trị viên</p>
                )}
                <div className="review-footer">
                  <span className="review-date">
                    {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                  <button
                    className="review-btn"
                    onClick={() => navigate(`/books/${r.bookId}`)}
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            );
            })}
          </div>
        )}
      </div>
    </main>
  );
};

export default MyReviews;