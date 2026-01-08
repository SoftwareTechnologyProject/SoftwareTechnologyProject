import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Order.css";
import "../../util/alert";
import { showWarning, showSuccess, showError } from "../../util/alert";

const API_URL = "http://localhost:8080/api/orders";

export default function Order() {
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

    // Nếu không có token → về login
    useEffect(() => {
        if (!token) {
            navigate("/login");
        } else {
            fetchOrders();
        }
    }, []);

    // --- Fetch orders ---
    const fetchOrders = async () => {
        setLoading(true);
        setError("");

        try {
            const res = await fetch(`${API_URL}/user`, {
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

    const filteredOrders =
        activeTab === "ALL"
            ? orders
            : orders.filter((o) => o.status?.toUpperCase() === activeTab);

    //   const calcTotal = (details) =>
    //     details?.reduce((sum, d) => sum + d.pricePurchased * d.quantity, 0) || 0;

    // --- Cancel Order ---
    const handleCancel = async (orderId) => {
        const result = await showWarning(
            "Bạn có chắc muốn hủy đơn hàng này không?"
        );

        if (!result.isConfirmed) return;

        try {
            const res = await fetch(`${API_URL}/${orderId}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    status: "CANCELLED",
                }),
            });

            if (!res.ok) throw new Error("Không thể hủy đơn.");

            showSuccess("Đã hủy đơn hàng thành công!");
            fetchOrders();
        } catch (err) {
            console.error(err);
            showError("Hủy đơn thất bại, vui lòng thử lại!");
        }
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
                        {
                            orders.filter(
                                (o) =>
                                    t.key === "ALL" ||
                                    o.status?.toUpperCase() === t.key
                            ).length
                        }{" "}
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
                    const total = Number(order?.totalAmount || 0);

                    return (
                        <div key={order.id} className="order-card">
                            <div className="order-header">
                                <span>#{order.id}</span>
                                <span>{order.status}</span>
                            </div>

                            <div className="order-body">
                                <div className="info">
                                    <img
                                        src={
                                            firstItem?.imageUrl ||
                                            "/book-default.png"
                                        }
                                        alt="ảnh"
                                    />
                                    <div>
                                        <h4
                                            onClick={() =>
                                                navigate(
                                                    `/account/order/${order.id}`
                                                )
                                            }
                                        >
                                            {firstItem?.bookTitle || "Sản phẩm"}
                                        </h4>
                                        <span>{qty} sản phẩm</span>
                                    </div>
                                </div>

                                <div className="price-actions">
                                    <strong>{total.toLocaleString()} đ</strong>

                                    {order.status === "PENDING" && (
                                        <button
                                            className="cancel"
                                            onClick={() =>
                                                handleCancel(order.id)
                                            }
                                        >
                                            Hủy đơn
                                        </button>
                                    )}

                                    {order.status === "SUCCESS" && (
                                        <button
                                            className="buy-again"
                                            onClick={() =>
                                                navigate(
                                                    `/product/${firstItem?.bookVariantId}`
                                                )
                                            }
                                        >
                                            Mua lại
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
