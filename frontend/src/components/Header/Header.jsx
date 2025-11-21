import React from "react"
import bannerHeader from '../../assets/banner-header.png';
import logo from '../../assets/logo.png';
import "./Header.css"
import { BsGrid } from "react-icons/bs";
import { CiSearch } from "react-icons/ci";
import { FiShoppingCart } from "react-icons/fi";
import { GoBell } from "react-icons/go";
import { CiUser } from "react-icons/ci";

const Header = () => {
    return (
        <>
            <div className="bg-[var(--components-color)]">
                <header>
                    <img src={bannerHeader} alt="banner" />
                </header>

                <nav>
                    <div className="nav-left">
                        <img src={logo} alt="logo" />
                    </div>

                    <div className="nav-search">
                        <input type="text" placeholder="Tìm kiếm..." className="input-search"/>
                        <button><CiSearch className="nav-icons" /></button>
                    </div>

                    <div className="nav-right">
                        <div>
                            <a href="#" className="flex flex-col items-center"><BsGrid className="nav-icons" /></a>
                            <span>Danh mục</span>
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
                    </div>
                </nav>
            </div>
        </>
    )
}

export default Header