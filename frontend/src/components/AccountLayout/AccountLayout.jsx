import { Outlet } from "react-router-dom";
import axios from "../../config/axiosConfig";
import React, { useState, useEffect } from "react";

import "../../pages/HomePage/HomePage.css";
import "../../components/AccountLayout/AccountLayout.css"
import { CiUser } from "react-icons/ci";
import { TfiReceipt } from "react-icons/tfi";
import { IoTicketSharp } from "react-icons/io5";
import { CiStar } from "react-icons/ci";
import { NavLink } from "react-router-dom";

const AccountLayout = () => {

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

    return (
        <>
            <main>
                <div className="account-container">
                    <div className="account-nav">
                        <div className="top-nav">
                            <div className="account-logged-avatar">
                                <span className="account-logged-avatar-text">
                                    {formData.userName.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="content">
                                <h1> {formData.userName} </h1>
                                <h2 className="w-full h-12 bg-gray-400 rounded relative overflow-hidden mirror-shine mirror-shine">Thành Viên EliteBooks</h2>
                            </div>
                        </div>
                        <div className="main-nav items-center text-center">
                            <NavLink
                                to="/account/accountInf"
                                className={({ isActive }) =>
                                    `nav-link ${isActive ? "active" : ""}`
                                }
                            >
                                <CiUser className="w-7 h-7" />
                                <span>Thông tin tài khoản</span>
                            </NavLink>

                            <NavLink
                                to="/account/order"
                                className={({ isActive }) =>
                                    `nav-link ${isActive ? "active" : ""}`
                                }
                            >
                                <TfiReceipt className="w-7 h-7" />
                                <span>Đơn hàng của tôi</span>
                            </NavLink>

                            <NavLink
                                to="/account/voucher-wallet"
                                className={({ isActive }) =>
                                    `nav-link ${isActive ? "active" : ""}`
                                }
                            >
                                <IoTicketSharp className="w-7 h-7" />
                                <span>Ví Voucher</span>
                            </NavLink>

                            <NavLink
                                to="/review"
                                className={({ isActive }) =>
                                    `nav-link ${isActive ? "active" : ""}`
                                }
                            >
                                <CiStar className="w-7 h-7" />
                                <span>Nhận xét của tôi</span>
                            </NavLink>

                        </div>
                    </div>

                    <Outlet />

                </div>
            </main>
        </>
    )
}

export default AccountLayout;