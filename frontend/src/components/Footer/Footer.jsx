import React from "react"

import { useLocation } from "react-router-dom";
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

import { Link } from "react-router-dom"; 

const Footer = () => {
    const { pathname } = useLocation();

    if (pathname.startsWith("/admin")) return null;

    return (
        <>
            <footer>
                <div className="footer-container">

                    {/* LEFT */}
                    <div className="footer-left">
                        <Link to="/">
                            <img src={logo} alt="logo" />
                        </Link>

                        <span>Lầu 7, Tòa nhà Saigon Centre, 65 Lê Lợi, Phường Bến Nghé, Quận 1, TP. HCM</span><br />
                        <span>Công Ty TNHH Thương Mại Dịch Vụ EliteBooks</span><br />
                        <br />
                        <span>Số 120, Đường Nguyễn Văn Hưởng, Phường Thảo Điền, TP. Thủ Đức, TP. HCM, Việt Nam</span><br />
                        <span>EliteBooks.com nhận đặt hàng trực tuyến và giao hàng tận nơi...</span><br />

                        <div className="social-icons">
                            <a href="#"><FaFacebook className="w-10 h-10" /></a>
                            <a href="#"><AiFillInstagram className="w-10 h-10 mx-5" /></a>
                            <a href="#"><FaYoutube className="w-10 h-10" /></a>
                            <a href="#"><AiFillPinterest className="w-10 h-10 mx-5" /></a>
                            <a href="#"><AiFillTwitterCircle className="w-10 h-10" /></a>
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div className="footer-right">

                        {/* DỊCH VỤ */}
                        <div className="footer-service">
                            <div>
                                <h2>DỊCH VỤ</h2>
                                <ul>
                                    <li><Link to="/terms">Điều khoản sử dụng</Link></li>
                                    <li><Link to="/privacy">Chính sách bảo mật</Link></li>
                                    <li><Link to="/payment-policy">Chính sách thanh toán</Link></li>
                                    <li><Link to="/about">Giới thiệu EliteBooks.com</Link></li>
                                    <li><Link to="/stores">Hệ thống nhà sách</Link></li>
                                </ul>
                            </div>

                            {/* HỖ TRỢ */}
                            <div>
                                <h2>HỖ TRỢ</h2>
                                <ul>
                                    <li><Link to="/return-policy">Chính sách đổi - trả - hoàn tiền</Link></li>
                                    <li><Link to="/warranty">Chính sách bảo hành</Link></li>
                                    <li><Link to="/shipping">Chính sách vận chuyển</Link></li>
                                </ul>
                            </div>

                            {/* TÀI KHOẢN */}
                            <div>
                                <h2>TÀI KHOẢN CỦA TÔI</h2>
                                <ul>
                                    <li><Link to="/login">Đăng nhập / Tạo tài khoản</Link></li>
                                    <li><Link to="/account/address">Thay đổi địa chỉ</Link></li>
                                    <li><Link to="/account/accountInf">Chi tiết tài khoản</Link></li>
                                    <li><Link to="/orders">Lịch sử mua hàng</Link></li>
                                </ul>
                            </div>
                        </div>

                        {/* LIÊN HỆ */}
                        <div className="footer-contact">
                            <h2>LIÊN HỆ</h2>
                            <ul>
                                <li><GiPositionMarker className="w-6 h-6" /> 60–62 Lê Lợi, Q.1, TP. HCM</li>
                                <li><IoMdMail className="w-6 h-6" /> cskh@elitebooks.com.vn</li>
                                <li><FaPhoneAlt className="w-6 h-6" /> 1900 636 467</li>
                            </ul>
                        </div>

                        {/* SHIPPING LOGO */}
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
