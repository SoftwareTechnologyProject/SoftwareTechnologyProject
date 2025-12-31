import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient.js";
import "./OrderAdmin.css";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const API_URL = "http://localhost:8080/api/orders";

export default function OrderAdmin() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const token = localStorage.getItem("accessToken");

  const tabs = [
    { key: "ALL", label: "Tất cả" },
    { key: "PENDING", label: "Chờ xử lý" },
    { key: "DELIVERY", label: "Đang giao" },
    { key: "SUCCESS", label: "Hoàn tất" },
    { key: "CANCELLED", label: "Bị hủy" },
  ];

  // check token
  useEffect(() => {
    if (!token) {
      toast.error("Vui l\u00f2ng \u0111\u0103ng nh\u1eadp \u0111\u1ec3 truy c\u1eadp trang n\u00e0y");
      navigate("/login");
    } else {
      fetchOrders();
    }
  }, []);

  // fetch orders
  const fetchOrders = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Lỗi server");

      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Không thể tải đơn hàng.");
    } finally {
      setLoading(false);
    }
  };

  // filter orders by tab
  const filteredOrders =
    activeTab === "ALL"
      ? orders
      : orders.filter((o) => o.status?.toUpperCase() === activeTab);

  // pagination logic
  const totalPages = Math.ceil(filteredOrders.length / pageSize);

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // reset page when change tab
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

//   const calcTotal = (details) =>
//     details?.reduce((sum, d) => sum + d.pricePurchased * d.quantity, 0) || 0;

  // update status general function
  const updateStatus = async (orderId, newStatus, successMessage) => {
    const loadingToast = toast.loading("\u0110ang c\u1eadp nh\u1eadt...");
    
    try {
      const res = await fetch(`${API_URL}/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.error || "Kh\u00f4ng th\u1ec3 c\u1eadp nh\u1eadt tr\u1ea1ng th\u00e1i");
      }

      toast.success(successMessage || "C\u1eadp nh\u1eadt th\u00e0nh c\u00f4ng!", { id: loadingToast });
      fetchOrders();
    } catch (err) {
      console.error(err);
      toast.error(err.message, { id: loadingToast });
    }
  };

  // Cancel order
  const handleCancel = async (orderId) => {
    const result = await toast.promise(
      new Promise((resolve) => {
        if (window.confirm("B\u1ea1n mu\u1ed1n h\u1ee7y \u0111\u01a1n n\u00e0y?")) {
          resolve(true);
        } else {
          resolve(false);
        }
      }),
      {
        loading: "\u0110ang x\u1eed l\u00fd...",
        success: "\u0110\u00e3 x\u00e1c nh\u1eadn",
        error: "\u0110\u00e3 h\u1ee7y"
      }
    );
    
    if (result) {
      updateStatus(orderId, "CANCELLED", "\u0110\u00e3 h\u1ee7y \u0111\u01a1n h\u00e0ng");
    }
  };

  // Accept order
  const handleAccept = (orderId) => {
    updateStatus(orderId, "DELIVERY", "\u0110\u00e3 ti\u1ebfp nh\u1eadn \u0111\u01a1n h\u00e0ng");
  };

  // Finish order
  const handleFinish = (orderId) => {
    updateStatus(orderId, "SUCCESS", "\u0110\u01a1n h\u00e0ng ho\u00e0n t\u1ea5t");
  };

  return (
    <div className="order-page">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="admin-header-section">
        <h1>Quản lý đơn hàng</h1>
        <p>Tổng: <strong>{orders.length}</strong> đơn hàng</p>
      </div>
      
      {/* Tabs */}
      <div className="tabs">
        {tabs.map((t) => (
          <div
            key={t.key}
            className={`tab ${activeTab === t.key ? "active" : ""}`}
            onClick={() => setActiveTab(t.key)}
          >
            {orders.filter(
              (o) => t.key === "ALL" || o.status?.toUpperCase() === t.key
            ).length}{" "}
            {t.label}
          </div>
        ))}
      </div>

      {loading && <div className="loading">Đang tải...</div>}
      {error && <div className="error">{error}</div>}

      {!loading && !error && filteredOrders.length === 0 && (
        <div className="empty">Không có đơn hàng nào.</div>
      )}

      {!loading &&
        !error &&
        paginatedOrders.map((order) => {
          const firstItem = order.orderDetails?.[0];
          const qty = order.orderDetails?.length || 0;
          const shippingFee = 32000;
          const total = Number(order?.totalAmount || 0) + shippingFee;

          return (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <span className="order-id" onClick={() => navigate(`/admin/order/${order.id}`)}>
                  #{order.id}
                </span>
                <span className="status status-{order.status}">{order.status}</span>
              </div>

              <div className="order-body">
                <div className="info">
                  {firstItem?.imageUrl && (
                    <img 
                      src={firstItem.imageUrl} 
                      alt={firstItem.bookTitle}
                      className="book-img"
                    />
                  )}
                  <div>
                    <h4 onClick={() => navigate(`/admin/order/${order.id}`)}>
                      {firstItem?.bookTitle || "Sản phẩm"}
                    </h4>
                    <span>{qty} sản phẩm</span>
                    <div className="order-info-meta">
                      <span className="user-name">👤 {order.userFullName}</span>
                    </div>
                  </div>
                </div>

                <div className="price-actions">
                  <div className="price-breakdown">
                    <div className="subtotal">Tiền hàng: {Number(order?.totalAmount || 0).toLocaleString()}₫</div>
                    <div className="shipping">Phí ship: {shippingFee.toLocaleString()}₫</div>
                    <strong className="total-price">Tổng: {total.toLocaleString()}₫</strong>
                  </div>

                  {order.status === "PENDING" && (
                    <>
                      <button className="button-actions" onClick={() => handleCancel(order.id)}>
                        Hủy đơn
                      </button>

                      <button className="button-actions" onClick={() => handleAccept(order.id)}>
                        Tiếp nhận
                      </button>
                    </>
                  )}

                  {order.status === "DELIVERY" && (
                    <button className="button-actions" onClick={() => handleFinish(order.id)}>
                      Hoàn thành
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        
      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} 
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Trang tr\u01b0\u1edbc
          </button>
          
          <span className="page-info">
            Trang {currentPage} / {totalPages}
          </span>
          
          <button 
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} 
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Trang sau
          </button>
        </div>
      )}
    </div>
  );
}