import "./PaymentFailed.css";
const PaymentFailed = ({ error, verificationStatus }) => {
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
export default PaymentFailed;
