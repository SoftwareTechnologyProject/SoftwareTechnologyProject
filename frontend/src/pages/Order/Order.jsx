import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Order.css";

export default function Order() {
  const navigate = useNavigate();
  const userId = 1;

  const [ordersData, setOrdersData] = useState([]);
  const [activeTab, setActiveTab] = useState("ALL");

  useEffect(() => {
    axios
      .get(`http://localhost:8080/orders/user/${userId}`)
      .then((res) => setOrdersData(res.data))
      .catch((err) => console.error("Error loading orders:", err));
  }, []);

  const tabs = [
    { key: "ALL", label: "Tất cả" },
    { key: "PENDING", label: "Chờ xử lý" },
    { key: "DELIVERY", label: "Đang giao" },
    { key: "SUCCESS", label: "Hoàn tất" },
    { key: "CANCELLED", label: "Bị hủy" },
  ];

  const filteredOrders =
    activeTab === "ALL"
      ? ordersData
      : ordersData.filter((o) => o.status === activeTab);

  // 👉 Hàm tính tổng tiền của 1 order
  const calcTotal = (details) =>
    details.reduce((sum, d) => sum + d.pricePurchased * d.quantity, 0);

  return (
    <div className="order-page">
      <div className="alert">
        🔺 Bạn vui lòng cập nhật thông tin tài khoản:
        <a href="/account/accountInf"> Cập nhật thông tin ngay</a>
      </div>

      {/* TAB BAR */}
      <div className="tabs">
        {tabs.map((t) => (
          <div
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`tab ${activeTab === t.key ? "active" : ""}`}
          >
            {ordersData.filter(o => t.key === "ALL" || o.status === t.key).length} {t.label}
          </div>
        ))}
      </div>

      {/* ORDER LIST */}
      {filteredOrders.map((order) => {
        const firstItem = [...order.orderDetails][0]; // lấy item đầu tiên
        const bookTitle = firstItem?.bookTitle || "Sản phẩm";
        const imageUrl = firstItem?.imageUrl;
        const qty = order.orderDetails.length;
        const total = calcTotal(order.orderDetails);

        return (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <span className="order-id">#{order.id}</span>
              <span className="status">{order.status}</span>
              <span className="date">
                {new Date(order.orderDate).toLocaleString()}
              </span>
            </div>

            <div className="order-body">
              <div className="info">
                <img
                  src={imageUrl || "/book-default.png"}
                  alt={bookTitle}
                  className="product-img"
                />

                <div>
                  <h4 onClick={() => navigate(`/account/order/${order.id}`)}>
                    {bookTitle}
                  </h4>
                  <span>{qty} sản phẩm</span>
                </div>
              </div>

              <div className="price-actions">
                <div className="price">
                  Tổng tiền: <strong>{total.toLocaleString()} đ</strong>
                </div>

                <div className="actions">
                  {order.status === "PENDING" && (
                    <button className="cancel">Hủy đơn</button>
                  )}
                  {order.status === "SUCCESS" && (
                    <button className="buy-again">Mua lại</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {filteredOrders.length === 0 && (
        <div className="empty">Không có đơn hàng nào.</div>
      )}
    </div>
  );
}
