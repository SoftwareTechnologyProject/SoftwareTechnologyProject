import React from 'react';
import { Link } from 'react-router-dom';
import BlogHeader from './BlogHeader';
import Footer from '../../components/Footer/Footer';
import './BlogAbout.css';

const BlogAbout = () => {
    return (
        <div className="blog-page">
            <BlogHeader />
            <div className="blog-container">
                <main className="about-content">
                <h2>Giới thiệu</h2>
                
                <p>
                    Chào mừng bạn đến với EliteBooks - không gian chia sẻ những câu chuyện, 
                    suy nghĩ và kiến thức xoay quanh thế giới sách và văn học.
                </p>

                <p>
                    Tại đây, chúng tôi tin rằng mỗi cuốn sách đều mở ra một thế giới mới, 
                    và việc đọc sách không chỉ là sở thích mà còn là cách để chúng ta 
                    hiểu thêm về bản thân và thế giới xung quanh.
                </p>

                <p>
                    Blog được tạo ra với mong muốn kết nối những người yêu sách, 
                    chia sẻ những trải nghiệm đọc sách và cùng nhau khám phá 
                    những tác phẩm hay.
                </p>

                <h3>Nội dung Blog</h3>
                <ul>
                    <li>Giới thiệu sách mới và sách hay</li>
                    <li>Review và nhận xét về các tác phẩm</li>
                    <li>Chia sẻ kinh nghiệm đọc sách</li>
                    <li>Tin tức về văn học và xuất bản</li>
                </ul>

                <p>
                    Mọi ý kiến đóng góp và bình luận của bạn đều rất quan trọng 
                    với chúng tôi. Hãy thoải mái chia sẻ suy nghĩ của bạn!
                </p>
            </main>
            <Footer />
        </div>
        </div>
    );
};

export default BlogAbout;
