import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import PaymentSuccess from "../PaymentSuccess/PaymentSuccess";
import PaymentFailed from "../PaymentFailed/PaymentFailed";
import "./PaymentResult.css";

const PaymentResult = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [paymentData, setPaymentData] = useState(null);
    const [error, setError] = useState(null);

    // useRef để khóa API call (chống React Strict Mode chạy 2 lần)
    const hasFetched = useRef(false);

    useEffect(() => {
        // Nếu đã fetch rồi thì return ngay (ngăn duplicate call)
        if (hasFetched.current) {
            console.log("⏭️ Skip: Already fetched");
            return;
        }

        const orderId = searchParams.get("orderId");
        const urlError = searchParams.get("error");

        // Kiểm tra lỗi từ URL
        if (urlError) {
            setError(`Lỗi: ${urlError}`);
            setLoading(false);
            return;
        }

        if (!orderId) {
            setError("Không tìm thấy thông tin đơn hàng");
            setLoading(false);
            return;
        }

        // Đánh dấu đã fetch để không gọi lại
        hasFetched.current = true;

        // Lấy thông tin đơn hàng (đã được verify ở backend)
        fetchOrderDetails(orderId);
    }, [searchParams]);

    const fetchOrderDetails = async (orderId) => {
        try {
            console.log("📦 Fetching order details for orderId:", orderId);

            const response = await fetch(
                `http://localhost:8080/api/payment/result?orderId=${orderId}`
            );

            if (!response.ok) {
                throw new Error("Không thể lấy thông tin đơn hàng");
            }

            const data = await response.json();
            console.log("Order data:", data);
            setPaymentData(data);
            setLoading(false);
        } catch (err) {
            console.error("Order details error:", err);
            setError(err.message || "Không thể lấy thông tin đơn hàng");
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="payment-result">
                <div className="payment-result__content">
                    <div className="spinner"></div>
                    <h1 className="payment-result__title">
                        Đang tải thông tin đơn hàng
                    </h1>
                    <div className="payment-result__message">
                        <p>Đang tải chi tiết đơn hàng của bạn...</p>
                        <p>Vui lòng không tắt trang này</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="payment-result">
                <div className="payment-result__content">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 640 640"
                        className="payment-result__icon"
                    >
                        <path d="M320 576C178.6 576 64 461.4 64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576zM320 112C205.1 112 112 205.1 112 320C112 434.9 205.1 528 320 528C434.9 528 528 434.9 528 320C528 205.1 434.9 112 320 112zM224 280C224 262.3 238.3 248 256 248C273.7 248 288 262.3 288 280C288 297.7 273.7 312 256 312C238.3 312 224 297.7 224 280zM352 280C352 262.3 366.3 248 384 248C401.7 248 416 262.3 416 280C416 297.7 401.7 312 384 312C366.3 312 352 297.7 352 280zM217.4 382.1C207.6 377.2 203.3 365.4 208.2 355.6C213.1 345.8 224.9 341.5 234.7 346.4C234.8 346.5 258.1 358.5 320 358.5C381.9 358.5 405.2 346.5 405.3 346.4C415.1 341.5 426.9 345.8 431.8 355.6C436.7 365.4 432.4 377.2 422.6 382.1C421.1 382.9 389.8 398.5 320 398.5C250.2 398.5 218.9 382.9 217.4 382.1z" />
                    </svg>

                    <h1 className="payment-result__title">Có lỗi xảy ra</h1>

                    <div className="payment-result__message">
                        <p>{error}</p>
                    </div>

                    <div className="payment-result__buttons">
                        <button
                            onClick={() => navigate("/")}
                            className="payment-result__btn home-btn"
                        >
                            Về trang chủ
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (paymentData?.paymentStatus === "PAID") {
        return <PaymentSuccess orderData={paymentData} />;
    }

    return <PaymentFailed error={error || "Thanh toán không thành công"} />;
};

export default PaymentResult;
