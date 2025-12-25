import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./OrderDetail.css";

const API_URL = "http://localhost:8080/api/orders";

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("accessToken");

  const getStepColor = (step, status) => {
    switch (status) {
      case "PENDING":
        return step === "Chờ xử lý" ? "#E67E22" : "black";
      case "DELIVERY":
        return step === "Đang giao hàng" ? "#2980B9" : "black";
      case "SUCCESS":
        return step === "Hoàn tất" ? "#27AE60" : "black";
      case "CANCELLED":
        return step === "Đã hủy" ? "#e60023" : "black";
      default:
        return "black";
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
    } else {
      fetchOrderDetail();
    }
  }, [id, token, navigate]);

  const fetchOrderDetail = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Lỗi server");

      const data = await res.json();
      setOrder(data); // setOrder chứ không phải setOrders
    } catch (err) {
      console.error(err);
      setError("Không thể tải đơn hàng.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="order-page">Đang tải...</div>;
  if (error) return <div className="order-page">{error}</div>;
  if (!order)
    return (
      <div className="order-page">
        <p>Không tìm thấy đơn hàng #{id}</p>
        <button onClick={() => navigate(-1)}>Quay lại</button>
      </div>
    );

  return (
    <div className="order-detail-container">
      <div className="order-top">
        <h2>Mã đơn hàng #{order.id}</h2>
        <span className="order-status-final">{order.status}</span>
      </div>

      <div className="timeline">
        <div className="step" style={{ color: getStepColor("Chờ xử lý", order.status) }}>
          <span>Chờ xử lý</span>
        </div>
        <div className="line"></div>
        <div className="step" style={{ color: getStepColor("Đang giao hàng", order.status) }}>
          <span>Đang giao hàng</span>
        </div>
        <div className="line"></div>
        <div className="step" style={{ color: getStepColor(order.status === "CANCELLED" ? "Đã hủy" : "Hoàn tất", order.status) }}>
          <span>{order.status === "CANCELLED" ? "Đã hủy" : "Hoàn tất"}</span>
        </div>
      </div>

      <div className="shipping-info">
        <h3>Thông tin vận chuyển</h3>
        <p><strong>Tên khách hàng:</strong> {order.userFullName}</p>
        <p><strong>Địa chỉ:</strong> {order.shippingAddress}</p>
        <p><strong>Điện thoại:</strong> {order.phoneNumber}</p>
      </div>

      <div className="product-list">
        <h3>Sản phẩm ({order.orderDetails.length})</h3>
        {order.orderDetails.map((item) => (
          <div className="product-row" key={item.id}>
            <img src={item.imageUrl || "/book-default.png"} alt={item.bookTitle} className="product-img" />
            <div className="product-info">
              <h4>{item.bookTitle}</h4>
              <span className="sku">Mã biến thể: {item.bookVariantId}</span>
            </div>
            <div className="product-price">
              <p className="price">{item.pricePurchased.toLocaleString()} đ</p>
            </div>
            <div className="product-qty">
              <p>{item.quantity}</p>
            </div>
            <div className="product-total">
              {item.totalPrice.toLocaleString()} đ
            </div>
          </div>
        ))}
      </div>

      <div className="total-section">
        <span>Tổng tiền:</span>
        <strong>
          {order.orderDetails.reduce((sum, item) => sum + item.totalPrice, 0).toLocaleString()} đ
        </strong>
      </div>

      <button className="back-btn" onClick={() => navigate(-1)}>Quay lại</button>
    </div>
  );
}