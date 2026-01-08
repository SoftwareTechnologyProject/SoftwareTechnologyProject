import { useNavigate } from "react-router-dom";
import "./PaymentFailed.css";

const PaymentFailed = ({ error, verificationStatus }) => {
    const navigate = useNavigate();
    return (
        <div className="payment-failed">
            <div className="payment-failed__content">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 640 640"
                    className="payment-failed__icon"
                >
                    <path d="M320 112C434.9 112 528 205.1 528 320C528 434.9 434.9 528 320 528C205.1 528 112 434.9 112 320C112 205.1 205.1 112 320 112zM320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576zM231 231C221.6 240.4 221.6 255.6 231 264.9L286 319.9L231 374.9C221.6 384.3 221.6 399.5 231 408.8C240.4 418.1 255.6 418.2 264.9 408.8L319.9 353.8L374.9 408.8C384.3 418.2 399.5 418.2 408.8 408.8C418.1 399.4 418.2 384.2 408.8 374.9L353.8 319.9L408.8 264.9C418.2 255.5 418.2 240.3 408.8 231C399.4 221.7 384.2 221.6 374.9 231L319.9 286L264.9 231C255.5 221.6 240.3 221.6 231 231z" />
                </svg>

                <h1 className="payment-failed__title">
                    Thanh toán không thành công
                </h1>

                <div className="payment-failed__message">
                    <p>
                        {error ||
                            "Giao dịch của bạn đã bị hủy hoặc không thành công."}
                    </p>
                    {verificationStatus === "failed" && (
                        <p className="payment-failed__message-sub">
                            Xác thực thanh toán với VNPay thất bại. Vui lòng
                            kiểm tra lại hoặc liên hệ hỗ trợ.
                        </p>
                    )}
                </div>

                <div className="payment-failed__buttons">
                    <button
                        onClick={() => navigate("/cart")}
                        className="payment-failed__btn retry-btn"
                    >
                        Quay lại giỏ hàng
                    </button>

                    <button
                        onClick={() => navigate("/")}
                        className="payment-failed__btn home-btn"
                    >
                        Về trang chủ
                    </button>
                </div>
            </div>
        </div>
    );
};
export default PaymentFailed;