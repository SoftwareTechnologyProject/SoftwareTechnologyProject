import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./OrderDetail.css";

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([
    { id: 101935154, status: "SUCCESS", date: "29/05/2021 - 08:52", title: "Bài Tập Trắc Nghiệm Vật Lí 11", qty: 3, total: 166950 },
    { id: 101924594, status: "DELIVERY", date: "23/05/2021 - 15:18", title: "Học Tốt Hóa Học 11", qty: 1, total: 82000 },
    { id: 101900000, status: "PENDING", date: "20/05/2021 - 11:20", title: "Sách Toán 11", qty: 1, total: 110000 },
  ]);

  const order = orders.find(o => o.id.toString() === id);

  if (!order) {
    return (
      <div className="order-page">
        <p>Không tìm thấy đơn hàng #{id}</p>
        <button onClick={() => navigate(-1)}>Quay lại</button>
      </div>
    );
  }

  return (
    <div className="order-page">
      <h1>Chi tiết đơn hàng #{order.id}</h1>

      <div className="order-card">
        <div className="order-header">
          <span className="status">{order.status}</span>
          <span className="date">{order.date}</span>
        </div>

        <div className="order-body">
          <div className="info">
            <h4>{order.title}</h4>
            <span>Số lượng: {order.qty}</span>
          </div>

          <div className="price-actions">
            <div className="price">
              Tổng tiền: <strong>{order.total.toLocaleString()} đ</strong>
            </div>
          </div>
        </div>
      </div>

      <button onClick={() => navigate(-1)} style={{ marginTop: "20px" }}>Quay lại</button>
    </div>
  );
}
