import React from "react";
import "./PaymentPending.css";

const PaymentPending = () => {
    return (
        <div className="payment-pending-container">
            <div className="payment-pending-content">
                <div className="pending-icon">⏳</div>
                <h1>Đang xử lý thanh toán</h1>
                <p>Vui lòng chờ trong giây lát...</p>
            </div>
        </div>
    );
};

export default PaymentPending;
