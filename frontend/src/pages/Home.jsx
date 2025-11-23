import React from 'react';
import './Home.css';

const Home = () => {
    return (
        <div className="home-container">
            <div className="hero-section">
                <h1>Chào mừng đến với Bookstore</h1>
                <p>Khám phá thế giới sách cùng chúng tôi</p>
            </div>
            
            <div className="features-section">
                <div className="feature-card">
                    <h3>📚 Kho sách đa dạng</h3>
                    <p>Hàng ngàn đầu sách từ nhiều thể loại khác nhau</p>
                </div>
                
                <div className="feature-card">
                    <h3>🎫 Voucher ưu đãi</h3>
                    <p>Nhiều chương trình khuyến mãi hấp dẫn</p>
                </div>
                
                <div className="feature-card">
                    <h3>🚚 Giao hàng nhanh</h3>
                    <p>Miễn phí vận chuyển cho đơn hàng trên 200k</p>
                </div>
            </div>
        </div>
    );
};

export default Home;
