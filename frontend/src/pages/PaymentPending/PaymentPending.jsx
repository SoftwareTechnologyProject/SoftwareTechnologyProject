import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import "./PaymentPending.css";

const PaymentPending = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const orderId = searchParams.get("orderId");

        if (!orderId) {
            setError("Không tìm thấy mã đơn hàng");
            setLoading(false);
            return;
        }

        // Fetch order details từ backend
        const fetchOrderDetails = async () => {
            try {
                const response = await axiosClient.get(`/orders/${orderId}`);
                setOrderData(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching order:", err);
                setError("Không thể tải thông tin đơn hàng");
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [searchParams]);

    if (loading) {
        return (
            <div className="payment-success">
                <div className="payment-pending__content">
                    <p>Đang tải thông tin đơn hàng...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="payment-success">
                <div className="payment-pending__content">
                    <p>{error}</p>
                    <button onClick={() => navigate("/")}>Về trang chủ</button>
                </div>
            </div>
        );
    }

    return (
        <div className="payment-success">
            <div className="payment-pending__content">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 640 640"
                    className="payment-pending__icon animate-bounce"
                >
                    <path d="M320 576C178.6 576 64 461.4 64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576zM320 112C205.1 112 112 205.1 112 320C112 434.9 205.1 528 320 528C434.9 528 528 434.9 528 320C528 205.1 434.9 112 320 112zM390.7 233.9C398.5 223.2 413.5 220.8 424.2 228.6C434.9 236.4 437.3 251.4 429.5 262.1L307.4 430.1C303.3 435.8 296.9 439.4 289.9 439.9C282.9 440.4 276 437.9 271.1 433L215.2 377.1C205.8 367.7 205.8 352.5 215.2 343.2C224.6 333.9 239.8 333.8 249.1 343.2L285.1 379.2L390.7 234z" />
                </svg>

                <h1 className="payment-pending__title">
                    Đơn hàng của bạn đã được tiếp nhận
                </h1>

                <div className="payment-pending__message">
                    <p>Cảm ơn bạn đã đặt hàng tại EliteBooks.com</p>
                    <p>
                        Mã đơn hàng của bạn là{" "}
                        <strong>#{orderData?.id || ""}</strong>
                    </p>
                    <p>
                        Số tiền cần thanh toán khi nhận hàng:{" "}
                        <strong>
                            {orderData?.totalAmount?.toLocaleString("vi-VN") ||
                                "0"}{" "}
                            ₫
                        </strong>
                    </p>
                    <p>Đơn hàng đang chờ xác nhận.</p>
                    <p>
                        Nhân viên giao hàng sẽ liên hệ với bạn trong thời gian
                        sớm nhất.
                    </p>
                </div>

                <div className="payment-pending__buttons">
                    <a
                        href="/"
                        className="payment-pending__btn continue-shopping_btn"
                    >
                        Tiếp tục mua sắm
                    </a>

                    <a
                        href={`/account/order/${orderData?.id || ""}`}
                        className="payment-pending__btn view-order_btn"
                    >
                        Xem chi tiết hóa đơn
                    </a>
                </div>
            </div>
        </div>
    );
};

export default PaymentPending;
