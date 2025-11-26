<<<<<<< HEAD
import React from "react";
import bannerHeader from '../../assets/banner/banner-header.png';
import logo from '../../assets/logo/logo.png';
import "./Header.css";
=======
import React from "react"
import { Link } from "react-router-dom"
import bannerHeader from '../../assets/banner-header.png';
import logo from '../../assets/logo.png';
import "./Header.css"
>>>>>>> origin/feature/voucher-crud
import { BsGrid } from "react-icons/bs";
import { CiSearch } from "react-icons/ci";
import { FiShoppingCart } from "react-icons/fi";
import { GoBell } from "react-icons/go";
import { CiUser } from "react-icons/ci";
<<<<<<< HEAD
import { Link } from "react-router-dom";
=======
import { RiCoupon3Line } from "react-icons/ri";
>>>>>>> origin/feature/voucher-crud

const Header = () => {
    return (
        <div className="bg-[var(--components-color)]">
            <header>
                <img src={bannerHeader} alt="banner" />
            </header>

<<<<<<< HEAD
            <nav>
                <div className="nav-left">
                    <Link to="/">
                        <img src={logo} alt="logo" />
                    </Link>
                </div>

                <div className="nav-search">
                    <input type="text" placeholder="Tìm kiếm..." className="input-search"/>
                    <button><CiSearch className="w-5 h-5 cursor-pointer" /></button>
                </div>

                <div className="nav-right">
                    <div>
                        <Link to="/category" className="flex flex-col items-center">
                            <BsGrid className="nav-icons" />
                        </Link>
                        <span>Danh mục</span>
=======
                <nav>
                    <div className="nav-left">
                        <Link to="/">
                            <img src={logo} alt="logo" />
                        </Link>
>>>>>>> origin/feature/voucher-crud
                    </div>

                    <div className="mx-4">
                        <Link to="/notifications" className="flex flex-col items-center">
                            <GoBell className="nav-icons" />
                        </Link>
                        <span>Thông báo</span>
                    </div>

<<<<<<< HEAD
                    <div>
                        <Link to="/cart" className="flex flex-col items-center">
                            <FiShoppingCart className="nav-icons" />
                        </Link>
                        <span>Giỏ hàng</span>
=======
                    <div className="nav-right">
                        <div>
                            <a href="#" className="flex flex-col items-center"><BsGrid className="nav-icons" /></a>
                            <span>Danh mục</span>
                        </div>

                        <div className="mx-4">
                            <Link to="/vouchers" className="flex flex-col items-center"><RiCoupon3Line className="nav-icons" /></Link>
                            <span>Voucher</span>
                        </div>

                        <div className="mx-4">
                            <a href="#" className="flex flex-col items-center"><GoBell className="nav-icons" /></a>
                            <span>Thông báo</span>
                        </div>

                        <div>
                            <a href="#" className="flex flex-col items-center"><FiShoppingCart className="nav-icons" /></a>
                            <span>Giỏ hàng</span>
                        </div>

                        <div className="mx-4">
                            <a href="#" className="flex flex-col items-center"><CiUser className="nav-icons" /></a>
                            <span>Tài khoản</span>
                        </div>
>>>>>>> origin/feature/voucher-crud
                    </div>

                    <div className="mx-4">
                        <Link to="/account" className="flex flex-col items-center">
                            <CiUser className="nav-icons" />
                        </Link>
                        <span>Tài khoản</span>
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default Header;
