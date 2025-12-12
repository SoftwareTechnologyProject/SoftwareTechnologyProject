import { useState } from "react";
import "./OrderAdmin.css";

export default function OrderAdmin() {
  const initialOrders = [
    { id: 101935154, status: "PENDING", date: "29/05/2021 - 08:52", title: "Bài Tập Trắc Nghiệm Vật Lí 11", qty: 3, total: 166950 },
    { id: 101924594, status: "DELIVERY", date: "23/05/2021 - 15:18", title: "Học Tốt Hóa Học 11", qty: 1, total: 82000 },
    { id: 101900000, status: "SUCCESS", date: "20/05/2021 - 11:20", title: "Sách Toán 11", qty: 1, total: 110000 },
  ];

  const [orders, setOrders] = useState(initialOrders);

  const handleNextStatus = (id) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === id) {
          if (order.status === "PENDING") return { ...order, status: "DELIVERY" };
          if (order.status === "DELIVERY") return { ...order, status: "SUCCESS" };
        }
        return order;
      })
    );
  };

  return (
    <div className="order-page">
      <h1>Quản lý đơn hàng</h1>

      {orders.map((order) => (
        <div key={order.id} className="order-card">
          <div className="order-header">
            <span className="order-id">#{order.id}</span>
            <span className="status">{order.status}</span>
            <span className="date">{order.date}</span>
          </div>

          <div className="order-body">
            <div className="info">
              <h4>{order.title}</h4>
              <span>{order.qty} sản phẩm</span>
            </div>

            <div className="price-actions">
              <div className="price">
                Tổng tiền: <strong>{order.total.toLocaleString()} đ</strong>
              </div>
              <div className="actions">
                {order.status === "PENDING" && (
                  <button className="buy-again" onClick={() => handleNextStatus(order.id)}>
                    Tiếp nhận
                  </button>
                )}
                {order.status === "DELIVERY" && (
                  <button className="buy-again" onClick={() => handleNextStatus(order.id)}>
                    Hoàn tất
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {orders.length === 0 && <div className="empty">Không có đơn hàng nào.</div>}
    </div>
  );
}
