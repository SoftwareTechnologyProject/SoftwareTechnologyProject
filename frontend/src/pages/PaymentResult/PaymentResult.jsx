import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import PaymentSuccess from "../PaymentSuccess/PaymentSuccess";
import "./PaymentResult.css";

const PaymentResult = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [paymentData, setPaymentData] = useState(null);
    const [error, setError] = useState(null);
    const [verificationStatus, setVerificationStatus] = useState("verifying"); // verifying | success | failed

    useEffect(() => {
        const paymentKey = searchParams.get("paymentKey");
        const transactionDate = searchParams.get("transactionDate");
        const urlError = searchParams.get("error");

        // Kiểm tra lỗi từ URL
        if (urlError) {
            setError(`Lỗi: ${urlError}`);
            setLoading(false);
            return;
        }

        if (!paymentKey) {
            setError("Không tìm thấy thông tin thanh toán");
            setLoading(false);
            return;
        }

        if (!transactionDate) {
            setError("Thiếu thông tin ngày giao dịch");
            setLoading(false);
            return;
        }

        // ✅ Gọi API verify để xác thực thanh toán với VNPay
        verifyPayment(paymentKey, transactionDate);
    }, [searchParams]);

    const verifyPayment = async (paymentKey, transactionDate) => {
        try {
            console.log("🔐 Verifying payment:", paymentKey);

            const formData = new URLSearchParams();
            formData.append("paymentKey", paymentKey);
            formData.append("transactionDate", transactionDate);

            const response = await fetch(
                "http://localhost:8080/payment/verify",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    body: formData,
                }
            );

            if (!response.ok) {
                throw new Error("Không thể xác thực thanh toán");
            }

            const data = await response.json();
            console.log("✅ Verification result:", data);

            if (data.paymentStatus === "SUCCESS") {
                setVerificationStatus("success");
                // Lấy thông tin order sau khi verify thành công
                fetchOrderDetails(paymentKey);
            } else {
                setVerificationStatus("failed");
                setError(data.message || "Thanh toán không thành công");
                setLoading(false);
            }
        } catch (err) {
            console.error("❌ Verification error:", err);
            setError(err.message || "Không thể xác thực thanh toán");
            setVerificationStatus("failed");
            setLoading(false);
        }
    };

    const fetchOrderDetails = async (paymentKey) => {
        try {
            const response = await fetch(
                `http://localhost:8080/payment/result?paymentKey=${paymentKey}`
            );

            if (!response.ok) {
                throw new Error("Không thể lấy thông tin đơn hàng");
            }

            const data = await response.json();
            setPaymentData(data);
            setLoading(false);
        } catch (err) {
            console.error("Order details error:", err);
            // Vẫn hiển thị success nhưng không có chi tiết order
            setPaymentData({ paymentStatus: "PAID" });
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="payment-result">
                <div className="payment-result__loading">
                    <div className="spinner"></div>
                    <p className="payment-result__loading-text">
                        {verificationStatus === "verifying"
                            ? "🔐 Đang xác thực thanh toán với VNPay..."
                            : "📦 Đang tải thông tin đơn hàng..."}
                    </p>
                    <p className="payment-result__loading-subtext">
                        Vui lòng không tắt trang này
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="payment-result">
                <div className="payment-result__error">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 640 640"
                        className="payment-result__icon error"
                    >
                        <path d="M320 576C178.6 576 64 461.4 64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576zM320 112C205.1 112 112 205.1 112 320C112 434.9 205.1 528 320 528C434.9 528 528 434.9 528 320C528 205.1 434.9 112 320 112zM224 280C224 262.3 238.3 248 256 248C273.7 248 288 262.3 288 280C288 297.7 273.7 312 256 312C238.3 312 224 297.7 224 280zM352 280C352 262.3 366.3 248 384 248C401.7 248 416 262.3 416 280C416 297.7 401.7 312 384 312C366.3 312 352 297.7 352 280zM217.4 382.1C207.6 377.2 203.3 365.4 208.2 355.6C213.1 345.8 224.9 341.5 234.7 346.4C234.8 346.5 258.1 358.5 320 358.5C381.9 358.5 405.2 346.5 405.3 346.4C415.1 341.5 426.9 345.8 431.8 355.6C436.7 365.4 432.4 377.2 422.6 382.1C421.1 382.9 389.8 398.5 320 398.5C250.2 398.5 218.9 382.9 217.4 382.1z" />
                    </svg>
                    <h1 className="payment-result__title error">
                        Có lỗi xảy ra
                    </h1>
                    <p className="payment-result__message">{error}</p>
                    <button
                        onClick={() => navigate("/")}
                        className="payment-result__btn"
                    >
                        Về trang chủ
                    </button>
                </div>
            </div>
        );
    }

    // ✅ Thanh toán thành công và đã verify
    if (
        verificationStatus === "success" &&
        paymentData?.paymentStatus === "PAID"
    ) {
        return <PaymentSuccess orderData={paymentData} />;
    }

    // ❌ Thanh toán thất bại hoặc không verify được
    return (
        <div className="payment-result">
            <div className="payment-result__failed">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 640 640"
                    className="payment-result__icon failed"
                >
                    <path d="M320 576C178.6 576 64 461.4 64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576zM320 112C205.1 112 112 205.1 112 320C112 434.9 205.1 528 320 528C434.9 528 528 434.9 528 320C528 205.1 434.9 112 320 112zM217.4 257.9C207.6 253 195.8 257.3 190.9 267.1C186 276.9 190.3 288.7 200.1 293.6C200.2 293.7 223.5 305.7 285.4 305.7C347.3 305.7 370.6 293.7 370.7 293.6C380.5 288.7 384.8 276.9 379.9 267.1C375 257.3 363.2 253 353.4 257.9C352 258.7 336.8 266.7 285.4 266.7C234 266.7 218.8 258.7 217.4 257.9zM217.4 382.1C207.6 377.2 195.8 381.5 190.9 391.3C186 401.1 190.3 412.9 200.1 417.8C200.2 417.9 223.5 429.9 285.4 429.9C347.3 429.9 370.6 417.9 370.7 417.8C380.5 412.9 384.8 401.1 379.9 391.3C375 381.5 363.2 377.2 353.4 382.1C352 382.9 336.8 390.9 285.4 390.9C234 390.9 218.8 382.9 217.4 382.1z" />
                </svg>
                <h1 className="payment-result__title failed">
                    Thanh toán không thành công
                </h1>
                <p className="payment-result__message">
                    {error ||
                        "Giao dịch của bạn đã bị hủy hoặc không thành công."}
                </p>
                {verificationStatus === "failed" && (
                    <p className="payment-result__message-sub">
                        Xác thực thanh toán với VNPay thất bại. Vui lòng kiểm
                        tra lại hoặc liên hệ hỗ trợ.
                    </p>
                )}
                <div className="payment-result__buttons">
                    <button
                        onClick={() => navigate("/")}
                        className="payment-result__btn secondary"
                    >
                        Về trang chủ
                    </button>
                    <button
                        onClick={() => navigate("/cart")}
                        className="payment-result__btn primary"
                    >
                        Quay lại giỏ hàng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentResult;
