import { useState } from "react";
import { useNavigate } from "react-router-dom"; // <- Thêm dòng này
import "./Order.css";

export default function Order() {
  const navigate = useNavigate(); // <- Khởi tạo navigate

  const ordersData = [
    { id: 101935154, status: "SUCCESS", date: "29/05/2021 - 08:52", title: "Bài Tập Trắc Nghiệm Vật Lí 11", qty: 3, total: 166950 },
    { id: 101924594, status: "DELIVERY", date: "23/05/2021 - 15:18", title: "Học Tốt Hóa Học 11", qty: 1, total: 82000 },
    { id: 101900000, status: "PENDING", date: "20/05/2021 - 11:20", title: "Sách Toán 11", qty: 1, total: 110000 },
  ];

  const tabs = [
    { key: "ALL", label: "Tất cả" },
    { key: "PENDING", label: "Chờ xử lý" },
    { key: "DELIVERY", label: "Đang giao" },
    { key: "SUCCESS", label: "Hoàn tất" },
    { key: "CANCELLED", label: "Bị hủy" },
  ];

  const [activeTab, setActiveTab] = useState("ALL");

  const filteredOrders =
    activeTab === "ALL"
      ? ordersData
      : ordersData.filter((o) => o.status === activeTab);

  return (
    <div className="order-page">
      <div className="alert">
        🔺 Bạn vui lòng cập nhật thông tin tài khoản:
        <a href="Account"> Cập nhật thông tin ngay</a>
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
      {filteredOrders.map((order) => (
        <div key={order.id} className="order-card">
          <div className="order-header">
            <span className="order-id">#{order.id}</span>
            <span className="status">{order.status}</span>
            <span className="date">{order.date}</span>
          </div>

          <div className="order-body">
            <div className="info">
              <h4
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/order/${order.id}`)}
              >
                {order.title}
              </h4>
              <span>{order.qty} sản phẩm</span>
            </div>

            <div className="price-actions">
              <div className="price">
                Tổng tiền: <strong>{order.total.toLocaleString()} đ</strong>
              </div>
              <div className="actions">
                {order.status === "PENDING" && <button className="cancel">Hủy đơn</button>}
                {order.status === "SUCCESS" && <button className="buy-again">Mua lại</button>}
              </div>
            </div>
          </div>
        </div>
      ))}

      {filteredOrders.length === 0 && (
        <div className="empty">Không có đơn hàng nào.</div>
      )}
    </div>
  );
}
