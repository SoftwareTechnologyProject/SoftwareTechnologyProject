import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Cart.css';

const Cart = () => {
    const navigate = useNavigate();

    return (
        <div className="cart-container">
            <div className="cart-placeholder">
                <h1>🛒 Giỏ Hàng</h1>
                <p>Trang giỏ hàng đang được phát triển...</p>
                <p>Hiện tại bạn có thể sử dụng nút "Mua Ngay" trên trang sản phẩm.</p>
                <button onClick={() => navigate('/')} className="btn-back-home">
                    Về trang chủ
                </button>
            </div>
        </div>
    );
};

export default Cart;
