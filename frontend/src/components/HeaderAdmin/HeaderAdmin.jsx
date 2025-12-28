import { Outlet } from "react-router-dom";
import { MdAdminPanelSettings } from "react-icons/md";
import { IoBookOutline } from "react-icons/io5";
import { TfiReceipt } from "react-icons/tfi";
import { HiOutlineUsers } from "react-icons/hi2";
import { IoTicketSharp } from "react-icons/io5";
import { IoStatsChartOutline } from "react-icons/io5";
import { HiOutlineNewspaper } from "react-icons/hi";
import { BiLogOut } from "react-icons/bi";
import { NavLink, useNavigate } from "react-router-dom";
import "./HeaderAdmin.css";

const HeaderAdmin = () => {
    const navigate = useNavigate();
    const role = localStorage.getItem("role");
    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("role");
        navigate("/login");
    };

    if (role === "ROLE_ADMIN") {
        return (
            <div className="admin-layout">
                {/* Sidebar Navigation */}
                <aside className="admin-sidebar">
                    <div className="sidebar-header">
                        <MdAdminPanelSettings className="sidebar-icon" />
                        <h1 className="sidebar-title">Admin</h1>
                    </div>

                    <nav className="sidebar-nav">
                        <NavLink
                            to="/admin/books"
                            className={({ isActive }) =>
                                `nav-item ${isActive ? "active" : ""}`
                            }
                        >
                            <IoBookOutline className="nav-icon" />
                            <span>Quản Lý Sách</span>
                        </NavLink>

                        {/* <NavLink
                            to="/admin/OrderAdmin"
                            className={({ isActive }) =>
                                `nav-item ${isActive ? "active" : ""}`
                            }
                        >
                            <TfiReceipt className="nav-icon" />
                            <span>Quản Lý Đơn Hàng</span>
                        </NavLink> */}

                        <NavLink
                            to="/admin/customers"
                            className={({ isActive }) =>
                                `nav-item ${isActive ? "active" : ""}`
                            }
                        >
                            <HiOutlineUsers className="nav-icon" />
                            <span>Quản Lý Khách Hàng</span>
                        </NavLink>

                        <NavLink
                            to="/admin/vouchers"
                            className={({ isActive }) =>
                                `nav-item ${isActive ? "active" : ""}`
                            }
                        >
                            <IoTicketSharp className="nav-icon" />
                            <span>Quản Lý Voucher</span>
                        </NavLink>

                        {/* <NavLink
                            to="/admin/blog"
                            className={({ isActive }) =>
                                `nav-item ${isActive ? "active" : ""}`
                            }
                        >
                            <HiOutlineNewspaper className="nav-icon" />
                            <span>Quản Lý Blog</span>
                        </NavLink> */}

                        <NavLink
                            to="/admin/statistics"
                            className={({ isActive }) =>
                                `nav-item ${isActive ? "active" : ""}`
                            }
                        >
                            <IoStatsChartOutline className="nav-icon" />
                            <span>Thống Kê</span>
                        </NavLink>

                        <button onClick={handleLogout} className="nav-item logout-btn">
                            <BiLogOut className="nav-icon" />
                            <span>Đăng Xuất</span>
                        </button>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="admin-content">
                    <Outlet />
                </main>
            </div>
        );
    }
    else {
        return (
            <div className="admin-layout">
                {/* Sidebar Navigation */}
                <aside className="admin-sidebar">
                    <div className="sidebar-header">
                        <MdAdminPanelSettings className="sidebar-icon" />
                        <h1 className="sidebar-title">Admin</h1>
                    </div>

                    <nav className="sidebar-nav">
                        {/* <NavLink
                            to="/admin/books"
                            className={({ isActive }) =>
                                `nav-item ${isActive ? "active" : ""}`
                            }
                        >
                            <IoBookOutline className="nav-icon" />
                            <span>Quản Lý Sách</span>
                        </NavLink> */}

                        <NavLink
                            to="/admin/OrderAdmin"
                            className={({ isActive }) =>
                                `nav-item ${isActive ? "active" : ""}`
                            }
                        >
                            <TfiReceipt className="nav-icon" />
                            <span>Quản Lý Đơn Hàng</span>
                        </NavLink>
{/* 
                        <NavLink
                            to="/admin/customers"
                            className={({ isActive }) =>
                                `nav-item ${isActive ? "active" : ""}`
                            }
                        >
                            <HiOutlineUsers className="nav-icon" />
                            <span>Quản Lý Khách Hàng</span>
                        </NavLink> */}

                        {/* <NavLink
                            to="/admin/vouchers"
                            className={({ isActive }) =>
                                `nav-item ${isActive ? "active" : ""}`
                            }
                        >
                            <IoTicketSharp className="nav-icon" />
                            <span>Quản Lý Voucher</span>
                        </NavLink> */}

                        <NavLink
                            to="/admin/blog"
                            className={({ isActive }) =>
                                `nav-item ${isActive ? "active" : ""}`
                            }
                        >
                            <HiOutlineNewspaper className="nav-icon" />
                            <span>Quản Lý Blog</span>
                        </NavLink>

                        {/* <NavLink
                            to="/admin/statistics"
                            className={({ isActive }) =>
                                `nav-item ${isActive ? "active" : ""}`
                            }
                        >
                            <IoStatsChartOutline className="nav-icon" />
                            <span>Thống Kê</span>
                        </NavLink> */}

                        <button onClick={handleLogout} className="nav-item logout-btn">
                            <BiLogOut className="nav-icon" />
                            <span>Đăng Xuất</span>
                        </button>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="admin-content">
                    <Outlet />
                </main>
            </div>
        );
    }
};

export default HeaderAdmin;