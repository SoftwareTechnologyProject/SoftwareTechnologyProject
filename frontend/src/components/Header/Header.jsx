import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { createPortal } from 'react-dom';
import { Link } from "react-router-dom";
import bannerHeader from '../../assets/banner/banner-header.png';
import logo from '../../assets/logo/logo.png';
import "./Header.css";
import { BsGrid } from "react-icons/bs";
import { CiSearch } from "react-icons/ci";
import { FiShoppingCart } from "react-icons/fi";
import { GoBell } from "react-icons/go";
import { CiUser } from "react-icons/ci";
import { RiCoupon3Line } from "react-icons/ri";
import useUserNotifications from "../../hook/useUserNotifications";
import axios from "axios";

const Header = () => {

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(0);

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
        const res = await axios.get(`/api/notifications?page=0&size=6`);
        const list = Array.isArray(res.data) ? res.data : [];
        setNotifications(list);
      } catch (e) {
        console.error("Lỗi load thông báo", e);
      }
    };
    fetchLatest();
  }, []);

  const { pathname } = useLocation();

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
          {/* <div className="relative">
            <div
              onClick={() => setOpen(!open)}
              className="flex flex-col items-center cursor-pointer"
            >
              <BsGrid className="nav-icons" />
              <span>Danh mục</span>
            </div>

            {open && (
              <div
                className="
            absolute left-1/2 -translate-x-1/2 mt-2
            flex flex-col
            bg-white shadow-lg rounded-lg p-2 z-20 w-40
          "
              >
                <Link to="/category/van-hoc" className="p-2 hover:bg-gray-100">Văn học</Link>
                <Link to="/category/khoa-hoc" className="p-2 hover:bg-gray-100">Khoa học</Link>
                <Link to="/category/kinh-te" className="p-2 hover:bg-gray-100">Kinh tế</Link>
                <Link to="/category/thieu-nhi" className="p-2 hover:bg-gray-100">Thiếu nhi</Link>
              </div>
            )}
          </div> */}

          {/*                    <div className="mx-4"> */}
          {/*                         <Link to="/notifications" className="flex flex-col items-center"> */}
          {/*                             <GoBell className="nav-icons" /> */}
          {/*                         </Link> */}
          {/*                         <span>Thông báo</span> */}
          {/*                    </div> */}
          <div className="mx-4 relative account-menu-link">
            <button
              className="flex flex-col items-center"
              onClick={() => setOpen(!open)}
            >
              <GoBell className="nav-icons" />
            </button>
            <span>Thông báo</span>

            {open && (
              <div className="absolute top-full mt-2 w-80 bg-white shadow-xl rounded-lg z-[9999] notification-dropdown">
                {Array.isArray(notifications) && notifications.length > 0 ? (
                  <>
                    {notifications.map((noti, index) => (
                      <div key={index} className={`p-3 border-b last:border-b-0 notification-item ${noti.isRead ? "" : "bg-blue-50"}`}>
                        <a href={noti.url} className="font-medium hover:underline">
                          {noti.content}
                        </a>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(noti.createAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                    <button
                      className="w-full py-2 text-blue-500 hover:underline"
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
                  <div className="p-3 text-center text-gray-400">
                    Không có thông báo nào
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="account-menu-link">
            <Link to="/cart">
              <FiShoppingCart className="nav-icons" />
            </Link>
            <span>Giỏ hàng</span>
          </div>

          <div className="mx-4 account-menu-link">
            <Link to="/admin">
              <CiUser className="nav-icons" />
            </Link>
            <span>Test UI Admin</span>
          </div>

          <div
            className="account-menu-container group"
            onMouseEnter={() => !isLoggedIn && setShowPopup(true)}
            onMouseLeave={() => setShowPopup(false)}
          >
            <Link to="/account/accountInf" className="account-menu-link">
              <CiUser className="nav-icons" />
              <span>Tài Khoản</span>
            </Link>

            {!isLoggedIn && showPopup && (
              <div className="account-popup group-hover:opacity-100 group-hover:visible">

                <Link to="/login" className="account-popup-link login">
                  Đăng nhập
                </Link>

                <Link to="/register" className="account-popup-link register">
                  Đăng ký
                </Link>
              </div>
            )}
          </div>


        </div>
      </nav>
    </div>
  );
};

export default Header;