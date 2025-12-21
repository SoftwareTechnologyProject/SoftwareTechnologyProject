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
    const [verificationStatus, setVerificationStatus] = useState("verifying"); // verifying | success | failed

    // 🔒 useRef để khóa API call (chống React Strict Mode chạy 2 lần)
    const hasVerified = useRef(false);

    useEffect(() => {
        // ⚠️ Nếu đã verify rồi thì return ngay (ngăn duplicate call)
        if (hasVerified.current) {
            console.log("⏭️ Skip: Already verified");
            return;
        }

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

        // 🔐 Đánh dấu đã verify để không gọi lại
        hasVerified.current = true;

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

            // ⚠️ Đọc data trước khi check response.ok để lấy message lỗi
            const data = await response.json();

            // Logic xử lý lỗi thông minh hơn
            if (!response.ok) {
                // 👇 QUAN TRỌNG: Nếu lỗi là "đã xử lý rồi" -> Coi như thành công
                if (
                    data.message &&
                    (data.message.includes("already processed") ||
                        data.message.includes("processed"))
                ) {
                    console.log(
                        "⚠️ Payment already processed -> Treating as SUCCESS"
                    );
                    setVerificationStatus("success");
                    fetchOrderDetails(paymentKey);
                    return; // Thoát hàm, không throw error nữa
                }

                // Nếu là lỗi khác thì mới báo lỗi
                throw new Error(
                    data.message || "Không thể xác thực thanh toán"
                );
            }

            console.log("✅ Verification result:", data);

            if (data.paymentStatus === "SUCCESS") {
                setVerificationStatus("success");
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
                            ? "Đang xác thực thanh toán với VNPay..."
                            : "Đang tải thông tin đơn hàng..."}
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

    // Thanh toán thành công và đã verify
    if (
        verificationStatus === "success" &&
        paymentData?.paymentStatus === "PAID"
    ) {
        return <PaymentSuccess orderData={paymentData} />;
    }

    // Thanh toán thất bại hoặc không verify được
    return (
        <PaymentFailed error={error} verificationStatus={verificationStatus} />
    );
};

export default PaymentResult;
