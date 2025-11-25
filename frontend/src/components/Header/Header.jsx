import React from "react";
import bannerHeader from '../../assets/banner/banner-header.png';
import logo from '../../assets/logo/logo.png';
import "./Header.css";
import { BsGrid } from "react-icons/bs";
import { CiSearch } from "react-icons/ci";
import { FiShoppingCart } from "react-icons/fi";
import { GoBell } from "react-icons/go";
import { CiUser } from "react-icons/ci";
import { Link } from "react-router-dom";

const Header = () => {
    return (
        <div className="bg-[var(--components-color)]">
            <header>
                <img src={bannerHeader} alt="banner" />
            </header>

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
                    </div>

                    <div className="mx-4">
                        <Link to="/notifications" className="flex flex-col items-center">
                            <GoBell className="nav-icons" />
                        </Link>
                        <span>Thông báo</span>
                    </div>

                    <div>
                        <Link to="/cart" className="flex flex-col items-center">
                            <FiShoppingCart className="nav-icons" />
                        </Link>
                        <span>Giỏ hàng</span>
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
