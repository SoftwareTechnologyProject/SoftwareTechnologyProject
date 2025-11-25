import React from "react"
import logo from '../../assets/logo/logo.png';
import logoLex from '../../assets/logo/logo_lex.png';
import logoNinja from '../../assets/logo/Logo_ninjavan.png';
import logoZalo from '../../assets/logo/logo_zalopay_2.png';
import logoMomo from '../../assets/logo/momopay.png';
import logoVnpay from '../../assets/logo/vnpay_logo.png';
import logoVnpost from '../../assets/logo/vnpost1.png';
import "./Footer.css"
import { FaFacebook } from "react-icons/fa";
import { AiFillInstagram } from "react-icons/ai";
import { FaYoutube } from "react-icons/fa6";
import { AiFillPinterest } from "react-icons/ai";
import { AiFillTwitterCircle } from "react-icons/ai";
import { IoMdMail } from "react-icons/io";
import { FaPhoneAlt } from "react-icons/fa";
import { GiPositionMarker } from "react-icons/gi";

const Footer = () => {
    return (
        <>
            <footer>
                <div className="footer-container">
                    <div className="footer-left">
                        <img src={logo} alt="logo" />

                        <span>Lầu 7, Tòa nhà Saigon Centre, 65 Lê Lợi, Phường Bến Nghé, Quận 1, TP. HCM</span><br />
                        <span>Công Ty TNHH Thương Mại Dịch Vụ EliteBooks</span><br />
                        <br />
                        <span>Số 120, Đường Nguyễn Văn Hưởng, Phường Thảo Điền, TP. Thủ Đức, TP. HCM, Việt Nam</span><br />
                        <span>EliteBooks.com nhận đặt hàng trực tuyến và giao hàng tận nơi. KHÔNG hỗ trợ đặt mua và nhận hàng trực tiếp tại văn phòng cũng như tất cả Hệ Thống EliteBooks trên toàn quốc.</span><br />

                        <div className="social-icons">
                            <a href="#"><FaFacebook className="w-10 h-10"/></a>
                            <a href="#"><AiFillInstagram className="w-10 h-10 mx-5"/></a>
                            <a href="#"><FaYoutube className="w-10 h-10"/></a>
                            <a href="#"><AiFillPinterest className="w-10 h-10 mx-5"/></a>
                            <a href="#"><AiFillTwitterCircle className="w-10 h-10"/></a>
                        </div>
                    </div>

                    <div className="footer-right">
                        <div className="footer-service">
                            <div>
                                <h2>DỊCH VỤ</h2>
                                <ul>
                                    <li><a href="#">Điều khoản sử dụng</a></li>
                                    <li><a href="#">Chính sách bảo mật thông tin cá nhân</a></li>
                                    <li><a href="#">Chính sách bảo mật thanh toán</a></li>
                                    <li><a href="#">Giới thiệu EliteBooks.com</a></li>
                                    <li><a href="#">Hệ thống nhà sách</a></li>
                                </ul>
                            </div>

                            <div>
                                <h2>HỖ TRỢ</h2>
                                <ul>
                                    <li><a href="#">Chính sách đổi - trả - hoàn tiền</a></li>
                                    <li><a href="#">Chính sách bảo hành - bồi hoàn</a></li>
                                    <li><a href="#">Chính sách vận chuyển</a></li>
                                </ul>
                            </div>

                            <div>
                                <h2>TÀI KHOẢN CỦA TÔI</h2>
                                <ul>
                                    <li><a href="#">Đăng nhập / Tạo mới tài khoản</a></li>
                                    <li><a href="#">Thay đổi địa chỉ khách hàng</a></li>
                                    <li><a href="#">Chi tiết tài khoản</a></li>
                                    <li><a href="#">Lịch sử mua hàng</a></li>
                                </ul>
                            </div>  
                        </div>

                        <div className="footer-contact">
                            <h2>LIÊN HỆ</h2>
                            <ul>
                                <li> <GiPositionMarker className="w-6 h-6"/>60–62 Lê Lợi, Q.1, TP. HCM</li>
                                <li> <IoMdMail className="w-6 h-6"/> cskh@elitebooks.com.vn</li>
                                <li> <FaPhoneAlt className="w-6 h-6"/>1900 636 467</li>
                            </ul>                            
                        </div>

                        <div className="logo-delivery">
                            <img src={logoLex} alt="Lex" />
                            <img src={logoNinja} alt="NinjaVan" />
                            <img src={logoZalo} alt="Zalopay" />
                            <img src={logoMomo} alt="Momo" />
                            <img src={logoVnpay} alt="VnPay" />
                            <img src={logoVnpost} alt="VnPost" />
                        </div>
                    </div>            
                </div>
            </footer>
        </>
    )
}

export default Footer;