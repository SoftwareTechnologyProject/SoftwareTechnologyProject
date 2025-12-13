import { Outlet } from "react-router-dom";
import axios from "../../config/axiosConfig";
import React, { useState, useEffect } from "react";

import "../../pages/HomePage/HomePage.css";
import "../../components/AccountLayout/AccountLayout.css"
import { PiCrownSimpleFill } from "react-icons/pi";
import { CiUser } from "react-icons/ci";
import { TfiReceipt } from "react-icons/tfi";
import { IoTicketSharp } from "react-icons/io5";
import { GoBell } from "react-icons/go";
import { CiStar } from "react-icons/ci";
import { NavLink } from "react-router-dom";

const AccountLayout = () => {

    const [formData, setFormData] = useState({ userName:''});

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
                            < PiCrownSimpleFill className="w-30 h-30 p-5 rounded-full text-gray-400 border-8 mx-auto" />
                            <div className="content">
                                <h1> {formData.userName} </h1>
                                <h2 className="bg-gray-400 rounded-full">Thành Viên ...</h2>
                                <h2>Mua Thêm ... đơn để nâng hạng ....</h2>
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
                                to="/notification"
                                className={({ isActive }) =>
                                    `nav-link ${isActive ? "active" : ""}`
                                }
                            >
                                <GoBell className="w-7 h-7" />
                                <span>Thông báo</span>
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