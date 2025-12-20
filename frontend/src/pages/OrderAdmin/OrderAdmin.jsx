import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient.js";
import "./OrderAdmin.css";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:8080/api/orders";

export default function OrderAdmin() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  const calcTotal = (details) =>
    details?.reduce((sum, d) => sum + d.pricePurchased * d.quantity, 0) || 0;

  // update status general function
  const updateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Không thể cập nhật trạng thái đơn do thiếu hàng.");

      fetchOrders();
    } catch (err) {
      console.log(err);
    }
  };

  // Cancel order
  const handleCancel = (orderId) => {
    if (window.confirm("Bạn muốn hủy đơn?"))
      updateStatus(orderId, "CANCELLED");
  };

  // Accept order
  const handleAccept = (orderId) => {
    updateStatus(orderId, "DELIVERY");
  };

  // Finish order
  const handleFinish = (orderId) => {
    updateStatus(orderId, "SUCCESS");
  };

  return (
    <div className="order-page">
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
        filteredOrders.map((order) => {
          const firstItem = order.orderDetails?.[0];
          const qty = order.orderDetails?.length || 0;
          const total = calcTotal(order.orderDetails);

          return (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <span>#{order.id}</span>
                <span>{order.status}</span>
              </div>

              <div className="order-body">
                <div className="info">
                  <div>
                    <h4 onClick={() => navigate(`/admin/order/${order.id}`)}>
                      {firstItem?.bookTitle || "Sản phẩm"}
                    </h4>
                    <span>{qty} sản phẩm</span>
                  </div>
                </div>

                <div className="price-actions">
                  <strong>{total.toLocaleString()} đ</strong>

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
    </div>
  );
}