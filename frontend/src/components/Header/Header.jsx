import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";

import bannerHeader from "../../assets/banner/banner-header.png";
import logo from "../../assets/logo/logo.png";
import "./Header.css";

import { BsGrid } from "react-icons/bs";
import { CiSearch } from "react-icons/ci";
import { FiShoppingCart } from "react-icons/fi";
import { CiUser } from "react-icons/ci";

import NotificationBell from "../notification/NotificationBell";
import axios from "../../config/axiosConfig";

const Header = () => {
  const { pathname } = useLocation();

  const [showPopup, setShowPopup] = useState(false);
  const [formData, setFormData] = useState({ userName: "" });


  const isLoggedIn = Boolean(localStorage.getItem("accessToken"));

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const { data: user } = await axios.get("/users/me");
      setFormData({ userName: user.fullName || "" });
    } catch (err) {
      console.error("Lỗi lấy thông tin user:", err);
    }
  };

  if (pathname.startsWith("/admin")) return null;

  const categoryMap = {
    agriculture: "Sách Nông - Lâm - Ngư Nghiệp",
    manga: "Truyện Tranh, Manga, Comic",
    magazines: "Tạp Chí - Catalogue",
    cooking: "Ingredients, Methods & Appliances",
    desserts: "Baking - Desserts",
    "magazines-alt": "Magazines",
    "beverages-wine": "Beverages & Wine",
    drinks: "Drinks & Beverages",
    travel: "Discovery & Exploration",
    vietnam: "Vietnam",
    vegetarian: "Vegetarian & Vegan",
    anthropology: "Anthropology",
    europe: "Europe",
    guidebook: "Guidebook series",
    diet: "Diets - Weight Loss - Nutrition",
    "cooking-education": "Cooking Education & Reference",
    asia: "Asia",
  };

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
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="input-search"
          />
          <button>
            <CiSearch className="w-5 h-5 cursor-pointer" />
          </button>
        </div>

        <div className="nav-right">
          {/* Danh mục */}
          <div className="category-container">
            <div className="flex flex-col items-center cursor-pointer account-menu-link">
              <BsGrid className="nav-icons" />
              <Link to="/category">Danh mục</Link>
            </div>

            <div className="category-dropdown">
              {Object.entries(categoryMap).map(([slug, name]) => (
                <Link key={slug} to={`/${slug}`} className="category-item">
                  {name}
                </Link>
              ))}
            </div>
          </div>

          {/* 🔔 Notification (đã tách) */}
          <NotificationBell />

          {/* Giỏ hàng */}
          <div className="account-menu-link">
            <Link to="/cart">
              <FiShoppingCart className="nav-icons" />
            </Link>
            <span>Giỏ hàng</span>
          </div>

          {/* Tài khoản */}
          <div
            className="account-menu-container group"
            onMouseEnter={() => setShowPopup(true)}
          >
            <Link to="/account/accountInf" className="account-menu-link">
              <CiUser className="nav-icons" />
              <span>Tài Khoản</span>
            </Link>

            {!isLoggedIn && (
              <div className="account-popup group-hover:opacity-100 group-hover:visible">
                <Link to="/login" className="account-popup-link login">
                  Đăng nhập
                </Link>
                <Link to="/register" className="account-popup-link register">
                  Đăng ký
                </Link>
              </div>
            )}

            {isLoggedIn && (
              <div className="account-popup group-hover:opacity-100 group-hover:visible">
                <h1 className="account-popup-link">
                  Xin Chào !
                  <br />
                  {formData.userName}
                </h1>
              </div>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Header;
