import React, { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import "./ReviewAdmin.css";

const ReviewAdmin = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await axiosClient.get("/admin/reviews");
      setReviews(res.data);
    } catch (err) {
      console.error("Lỗi lấy danh sách review:", err);
      alert("Không thể tải danh sách review");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (reviewId, newStatus) => {
    try {
      await axiosClient.put(`/admin/reviews/${reviewId}/status`, {
        status: newStatus,
      });
      alert(`Đã ${newStatus === "APPROVED" ? "duyệt" : "từ chối"} review`);
      fetchReviews();
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái:", err);
      alert("Không thể cập nhật trạng thái review");
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Bạn có chắc muốn xóa review này?")) return;

    try {
      await axiosClient.delete(`/admin/reviews/${reviewId}`);
      alert("Đã xóa review");
      fetchReviews();
    } catch (err) {
      console.error("Lỗi xóa review:", err);
      alert("Không thể xóa review");
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (filterStatus === "ALL") return true;
    return r.status === filterStatus;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "APPROVED":
        return "badge-approved";
      case "REJECTED":
        return "badge-rejected";
      case "PENDING":
        return "badge-pending";
      default:
        return "";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "APPROVED":
        return "Đã duyệt";
      case "REJECTED":
        return "Đã từ chối";
      case "PENDING":
        return "Chờ duyệt";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="review-admin-container">
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="review-admin-container">
      <h1 className="review-admin-title">Quản lý đánh giá</h1>

      <div className="filter-section">
        <label>Lọc theo trạng thái:</label>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="ALL">Tất cả</option>
          <option value="PENDING">Chờ duyệt</option>
          <option value="APPROVED">Đã duyệt</option>
          <option value="REJECTED">Đã từ chối</option>
        </select>
      </div>

      <div className="review-stats">
        <div className="stat-card">
          <span className="stat-number">{reviews.length}</span>
          <span className="stat-label">Tổng đánh giá</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {reviews.filter((r) => r.status === "PENDING").length}
          </span>
          <span className="stat-label">Chờ duyệt</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {reviews.filter((r) => r.status === "APPROVED").length}
          </span>
          <span className="stat-label">Đã duyệt</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {reviews.filter((r) => r.status === "REJECTED").length}
          </span>
          <span className="stat-label">Đã từ chối</span>
        </div>
      </div>

      {filteredReviews.length === 0 ? (
        <p className="no-reviews-text">Không có đánh giá nào.</p>
      ) : (
        <div className="reviews-table-container">
          <table className="reviews-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Người dùng</th>
                <th>Sách</th>
                <th>Đánh giá</th>
                <th>Nội dung</th>
                <th>Ngày tạo</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.map((review) => (
                <tr key={review.id}>
                  <td>{review.id}</td>
                  <td>
                    <div className="user-info">
                      <strong>{review.userName}</strong>
                      <small>{review.userEmail}</small>
                    </div>
                  </td>
                  <td>
                    <a
                      href={`/books/${review.bookId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="book-link"
                    >
                      {review.bookTitle}
                    </a>
                  </td>
                  <td>
                    <div className="rating-stars">
                      {"⭐".repeat(review.rating)}
                    </div>
                  </td>
                  <td>
                    <div className="review-comment">
                      {review.comment?.length > 100
                        ? review.comment.substring(0, 100) + "..."
                        : review.comment}
                    </div>
                  </td>
                  <td>
                    {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td>
                    <span
                      className={`status-badge ${getStatusBadgeClass(
                        review.status
                      )}`}
                    >
                      {getStatusText(review.status)}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {review.status !== "APPROVED" && (
                        <button
                          onClick={() =>
                            handleUpdateStatus(review.id, "APPROVED")
                          }
                          className="btn-approve"
                          title="Duyệt"
                        >
                          ✓
                        </button>
                      )}
                      {review.status !== "REJECTED" && (
                        <button
                          onClick={() =>
                            handleUpdateStatus(review.id, "REJECTED")
                          }
                          className="btn-reject"
                          title="Từ chối"
                        >
                          ✗
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="btn-delete"
                        title="Xóa"
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReviewAdmin;
