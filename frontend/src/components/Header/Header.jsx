import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import bannerHeader from '../../assets/banner/banner-header.png';
import logo from '../../assets/logo/logo.png';
import "./Header.css";
import { BsGrid } from "react-icons/bs";
import { CiSearch } from "react-icons/ci";
import { FiShoppingCart } from "react-icons/fi";
import { GoBell } from "react-icons/go";
import { CiUser } from "react-icons/ci";
import { HiOutlineNewspaper } from "react-icons/hi";
import useUserNotifications from "../../hook/useUserNotifications";
import axios from "../../config/axiosConfig";


const Header = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [openNotification, setOpenNotification] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(0);

  const isLoggedIn = Boolean(localStorage.getItem("accessToken"));

  // Callback để nhận notification mới từ WebSocket
  const handleNewNotification = useCallback((newNoti) => {
    setNotifications(prev => [newNoti, ...prev]);
  }, []);

  // Hook WebSocket
  useUserNotifications(handleNewNotification);

  // Load notifications từ API khi component mount
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

  // Đóng notification dropdown khi click outside
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
  const categoryMap = {
    "agriculture": "Sách Nông - Lâm - Ngư Nghiệp",           
    "manga": "Truyện Tranh, Manga, Comic",                  
    "magazines": "Tạp Chí - Catalogue",                     
    "cooking": "Ingredients, Methods & Appliances",          
    "desserts": "Baking - Desserts",                        
    "magazines-alt": "Magazines",                            
    "beverages-wine": "Beverages & Wine",                     
    "drinks": "Drinks & Beverages",                           
    "travel": "Discovery & Exploration",                    
    "vietnam": "Vietnam",                                     
    "vegetarian": "Vegetarian & Vegan",                      
    "anthropology": "Anthropology",                          
    "europe": "Europe",                                      
    "guidebook": "Guidebook series",                          
    "diet": "Diets - Weight Loss - Nutrition",                
    "cooking-education": "Cooking Education & Reference",     
    "asia": "Asia"                                           
  };

  const [formData, setFormData] = useState({ userName: '' });

  // 🟢 LẤY USER TỪ BACKEND /me
  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const { data: user } = await axios.get("/users/me");

      setFormData({
        userName: user.fullName || "",
      });

    } catch (err) {
      console.error("Lỗi lấy thông tin user:", err);
    }
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

        <div className="nav-search">
          <input type="text" placeholder="Tìm kiếm..." className="input-search" />
          <button><CiSearch className="w-5 h-5 cursor-pointer" /></button>
        </div>

        <div className="nav-right">
          {/* Danh mục */}
          <div className="category-container">
            <div className="flex flex-col items-center cursor-pointer account-menu-link">
              <BsGrid className="nav-icons" />
              <Link to={`/category`}>Danh mục</Link>
            </div>

            <div className="category-dropdown">
              {Object.entries(categoryMap).map(([slug, name]) => (
                <Link
                  key={slug}
                  to={`/${slug}`}
                  className="category-item"
                >
                  {name}
                </Link>
              ))}
            </div>
          </div>


          {/* Thông báo - Click để hiển thị */}
          <div className="notification-container mx-4">
            <button
              className="flex flex-col items-center cursor-pointer account-menu-link"
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

          {/* Blog */}
          <div className="account-menu-link">
            <Link to="/blog">
              <HiOutlineNewspaper className="nav-icons" />
            </Link>
            <span>Blog</span>
          </div>

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