import React, { useState, useEffect, useCallback } from "react";
import { useLocation, Link, NavLink, useNavigate } from "react-router-dom";
import bannerHeader from '../../assets/banner/banner-header.png';
import logo from '../../assets/logo/logo.png';
import "./Header.css";
import { BsGrid } from "react-icons/bs";
import { CiSearch } from "react-icons/ci";
import { FiShoppingCart } from "react-icons/fi";
import { GoBell } from "react-icons/go";
import { CiUser } from "react-icons/ci";
import { TfiReceipt } from "react-icons/tfi";
import { IoTicketSharp } from "react-icons/io5";
import { CiStar } from "react-icons/ci";
import {
  FaLeaf,
  FaBook,
  FaNewspaper,
  FaUtensils,
  FaCookie,
  FaWineGlass,
  FaCoffee,
  FaGlobeAsia,
  FaMapMarkedAlt,
  FaSeedling,
  FaUsers,
  FaMapSigns,
  FaAppleAlt,
  FaGraduationCap
} from 'react-icons/fa';

import useUserNotifications from "../../hook/useUserNotifications";
import axios from "../../config/axiosConfig";

const Header = () => {
  const [openNotification, setOpenNotification] = useState(false);
  const [openCategory, setOpenCategory] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(0);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    userName: '',
    keyWord: ''
  });

  const isLoggedIn = Boolean(localStorage.getItem("accessToken"));

  const handleNewNotification = useCallback((newNoti) => {
    setNotifications(prev => [newNoti, ...prev]);
  }, []);

  useUserNotifications(handleNewNotification);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/notifications?page=0&size=6`);
        const list = Array.isArray(res.data) ? res.data : [];
        setNotifications(list);
      } catch (e) {
        console.error("Lỗi load thông báo", e);
      }
    };
    fetchLatest();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openNotification && !event.target.closest('.notification-container')) {
        setOpenNotification(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openNotification]);

  const { pathname } = useLocation();

  const categoryMap = [
    {
      slug: "agriculture",
      name: "Sách Nông - Lâm - Ngư Nghiệp",
      icon: <FaLeaf />,
      color: "from-green-400 to-emerald-500"
    },
    {
      slug: "manga",
      name: "Truyện Tranh, Manga, Comic",
      icon: <FaBook />,
      color: "from-purple-400 to-pink-500"
    },
    {
      slug: "magazines",
      name: "Tạp Chí - Catalogue",
      icon: <FaNewspaper />,
      color: "from-blue-400 to-cyan-500"
    },
    {
      slug: "cooking",
      name: "Ingredients, Methods & Appliances",
      icon: <FaUtensils />,
      color: "from-orange-400 to-red-500"
    },
    {
      slug: "desserts",
      name: "Baking - Desserts",
      icon: <FaCookie />,
      color: "from-pink-400 to-rose-500"
    },
    {
      slug: "magazines-alt",
      name: "Magazines",
      icon: <FaNewspaper />,
      color: "from-indigo-400 to-blue-500"
    },
    {
      slug: "beverages-wine",
      name: "Beverages & Wine",
      icon: <FaWineGlass />,
      color: "from-red-400 to-pink-500"
    },
    {
      slug: "drinks",
      name: "Drinks & Beverages",
      icon: <FaCoffee />,
      color: "from-amber-400 to-orange-500"
    },
    {
      slug: "travel",
      name: "Discovery & Exploration",
      icon: <FaGlobeAsia />,
      color: "from-teal-400 to-cyan-500"
    },
    {
      slug: "vietnam",
      name: "Vietnam",
      icon: <FaMapMarkedAlt />,
      color: "from-red-500 to-yellow-500"
    },
    {
      slug: "vegetarian",
      name: "Vegetarian & Vegan",
      icon: <FaSeedling />,
      color: "from-green-500 to-lime-500"
    },
    {
      slug: "anthropology",
      name: "Anthropology",
      icon: <FaUsers />,
      color: "from-violet-400 to-purple-500"
    },
    {
      slug: "europe",
      name: "Europe",
      icon: <FaMapSigns />,
      color: "from-blue-500 to-indigo-500"
    },
    {
      slug: "guidebook",
      name: "Guidebook series",
      icon: <FaBook />,
      color: "from-cyan-400 to-blue-500"
    },
    {
      slug: "diet",
      name: "Diets - Weight Loss - Nutrition",
      icon: <FaAppleAlt />,
      color: "from-lime-400 to-green-500"
    },
    {
      slug: "cooking-education",
      name: "Cooking Education & Reference",
      icon: <FaGraduationCap />,
      color: "from-yellow-400 to-orange-500"
    },
    {
      slug: "asia",
      name: "Asia",
      icon: <FaGlobeAsia />,
      color: "from-rose-400 to-red-500"
    }
  ];

  useEffect(() => {
    if (isLoggedIn) {
      fetchUserInfo();
    }
  }, [isLoggedIn]);

  const fetchUserInfo = async () => {
    try {
      const { data: user } = await axios.get("users/me");
      setFormData({
        userName: user.fullName || "",
      });
    } catch (err) {
      console.error("Lỗi lấy thông tin user:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setFormData({ userName: '' });
    navigate("/login");
  };

  const [keyword, setKeyword] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();

    navigate(`/search?keyword=${encodeURIComponent(keyword)}&page=0`);
  };

  if (pathname.startsWith("/admin")) return null;

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

        <form className="nav-search">
          <input type="text" value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm kiếm..." className="input-search" />
          <button onClick={handleSearch}><CiSearch className="w-5 h-5 cursor-pointer" /></button>
        </form>

        <div className="nav-right">
          {/* Danh mục */}
          <div
            className="category-dropdown-container"
            onMouseEnter={() => setOpenCategory(true)}
            onMouseLeave={() => setOpenCategory(false)}
          >
            <button
              onClick={() => setOpenCategory(!openCategory)}
              className="category-button"
            >
              <BsGrid className="w-7 h-7" />
              <span>Danh mục</span>
            </button>

            {/* Dropdown Menu */}
            <div className={`category-dropdown-menu ${openCategory ? 'category-dropdown-open' : ''}`}>
              <div className="category-grid">
                {categoryMap.map(({ slug, name, icon, color }) => (
                  <Link
                    key={slug}
                    to={`/${slug}`}
                    onClick={() => setOpenCategory(false)}
                    className="category-item group"
                  >
                    <div className="category-item-overlay"></div>

                    <div className={`category-item-icon bg-gradient-to-br`}>
                      <span className="category-item-icon-inner">
                        {icon}
                      </span>
                    </div>

                    <div className="category-item-content">
                      <h3 className="category-item-title">
                        {name}
                      </h3>
                      <svg
                        className="category-item-arrow"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>

              {/* View All Button */}
              <div className="category-footer">
                <Link
                  to="/category"
                  onClick={() => setOpenCategory(false)}
                  className="category-view-all"
                >
                  <span>Xem tất cả sản phẩm</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Thông báo */}
          <div className="notification-container mx-4">
            <button
              className="account-menu-link"
              onClick={() => setOpenNotification(!openNotification)}
            >
              <GoBell className="nav-icons" />
              <span>Thông báo</span>
            </button>

            {openNotification && (
              <div className="notification-dropdown">
                {Array.isArray(notifications) && notifications.length > 0 ? (
                  <>
                    {notifications.map((noti, index) => (
                      <div
                        key={index}
                        className={`notification-item ${noti.isRead ? "" : "notification-unread"}`}
                      >
                        <a href={noti.url} className="notification-link">
                          {noti.content}
                        </a>
                        <div className="notification-time">
                          {new Date(noti.createAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                    <button
                      className="notification-more-btn"
                      onClick={async () => {
                        const next = page + 1;
                        const res = await axios.get(`/api/notifications?page=${next}&size=6`);
                        const list = Array.isArray(res.data) ? res.data : [];
                        setNotifications(prev => [...prev, ...list]);
                        setPage(next);
                      }}
                    >
                      Xem thêm
                    </button>
                  </>
                ) : (
                  <div className="notification-empty">
                    Không có thông báo nào
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Giỏ hàng */}
          <div className="account-menu-link">
            <Link to="/cart">
              <FiShoppingCart className="nav-icons" />
            </Link>
            <span>Giỏ hàng</span>
          </div>

          {/* Tài khoản */}
          <div className="account-menu-container group">
            <Link to="/account/accountInf" className="account-menu-link">
              <CiUser className="nav-icons" />
              <span>Tài Khoản</span>
            </Link>

            {!isLoggedIn && (
              <div className="account-popup">
                <Link to="/login" className="account-popup-link login">
                  Đăng nhập
                </Link>
                <Link to="/register" className="account-popup-link register">
                  Đăng ký
                </Link>
              </div>
            )}

            {isLoggedIn && (
              <div className="account-logged-popup">
                {/* Header với avatar và tên */}
                <NavLink to="/account/accountInf" className="account-logged-header">
                  <div className="account-logged-avatar">
                    <span className="account-logged-avatar-text">
                      {formData.userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="account-logged-info">
                    <h3 className="account-logged-name">
                      {formData.userName}
                    </h3>
                    <p className="account-logged-subtitle">
                      Thành viên EliteBooks
                    </p>
                  </div>
                  <svg className="account-logged-arrow" viewBox="0 0 20 20" fill="none">
                    <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </NavLink>

                {/* Divider */}
                <div className="account-logged-divider"></div>

                {/* Menu items */}
                <div className="account-logged-menu">
                  <NavLink to="/orders" className="account-logged-menu-item">
                    <TfiReceipt className="w-5 h-5 flex-shrink-0" />
                    <span className="flex-1 truncate">Đơn hàng của tôi</span>
                  </NavLink>

                  <NavLink to="/vouchers" className="account-logged-menu-item">
                    <IoTicketSharp className="w-5 h-5 flex-shrink-0" />
                    <span className="flex-1 truncate">Ví Voucher</span>
                  </NavLink>

                  <NavLink to="/reviews" className="account-logged-menu-item">
                    <CiStar className="w-5 h-5 flex-shrink-0" />
                    <span className="flex-1 truncate">Nhận xét của tôi</span>
                  </NavLink>

                  <button onClick={handleLogout} className="account-logged-logout">
                    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 20 20" fill="none">
                      <path d="M13 14L17 10M17 10L13 6M17 10H7M7 17H4C3.44772 17 3 16.5523 3 16V4C3 3.44772 3.44772 3 4 3H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="flex-1 truncate text-left">Thoát tài khoản</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Header;