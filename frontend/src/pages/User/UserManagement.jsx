import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axiosClient';
// import { AppConstants } from '../../util/constant'; 
import { toast } from 'react-toastify';

// Import Icons
import { 
    IoSearch, IoReload, IoFilter,
    IoCreateOutline, IoTrashOutline, 
    IoPerson, IoShieldCheckmark, IoKeyOutline,
    IoCheckmarkCircle, IoLockClosed, IoCloseCircle 
} from "react-icons/io5";

import './UserManagement.css';

const UserManagement = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('ALL');
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // Check authentication
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            toast.warn('Vui lòng đăng nhập để truy cập trang này'); 
            navigate('/login');
            return;
        }
    }, [navigate]);

    // Lấy dữ liệu users từ API
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/users');
            console.log('Users data:', response.data);
            
            const cleanedUsers = Array.isArray(response.data) 
                ? response.data.map(user => ({
                    id: user.id,
                    fullName: user.fullName,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    address: user.address,
                    dateOfBirth: user.dateOfBirth,
                    role: user.role,
                    accountStatus: user.account?.status || 'ACTIVE'
                }))
                : [];
            
            setUsers(cleanedUsers);
            setError(null);
        } catch (err) {
            setError('Không thể tải danh sách người dùng. Vui lòng thử lại.');
            console.error('Error fetching users:', err);
            setUsers([]); 
        } finally {
            setLoading(false);
        }
    };

    // Filter Logic
    const filteredUsers = Array.isArray(users) ? users.filter(user => {
        const matchesSearch = user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.phoneNumber?.includes(searchTerm);
        const matchesRole = filterRole === 'ALL' || user.role === filterRole;
        return matchesSearch && matchesRole;
    }) : [];

    // Handlers
    const handleDeleteUser = async (userId) => {
        if (window.confirm('Bạn có chắc muốn vô hiệu hóa người dùng này? Tài khoản sẽ chuyển sang trạng thái DELETED.')) {
            try {
                const response = await axios.delete(`/users/${userId}`);
                toast.success(response.data || 'Đã vô hiệu hóa tài khoản thành công');
                fetchUsers();
            } catch (err) {
                const errorMsg = err.response?.data?.message || err.response?.data || 'Không thể xóa người dùng.';
                toast.error(errorMsg);
            }
        }
    };
    
    const handleUpdateStatus = async (status) => {
        if (!selectedUser) return;
        try {
            const response = await axios.patch(
                `/users/${selectedUser.id}/status?status=${status}`
            );
            toast.success(response.data || `Đã cập nhật trạng thái thành ${status}`);
            setShowStatusModal(false);
            setSelectedUser(null);
            fetchUsers();
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.response?.data || 'Không thể cập nhật trạng thái.';
            toast.error(errorMsg);
        }
    };
    
    const openStatusModal = (user) => {
        setSelectedUser(user);
        setShowStatusModal(true);
    };

    // Helpers for UI
    const getRoleConfig = (role) => {
        switch (role) {
            case 'ADMIN': return { class: 'role-admin', icon: <IoKeyOutline />, label: 'Chủ sở hữu' };
            case 'STAFF': return { class: 'role-staff', icon: <IoShieldCheckmark />, label: 'Nhân viên' };
            default: return { class: 'role-customer', icon: <IoPerson />, label: 'Khách hàng' };
        }
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'ACTIVE': return { class: 'status-active', label: 'Hoạt động' };
            case 'LOCKED': return { class: 'status-locked', label: 'Tạm khóa' };
            case 'DELETED': return { class: 'status-deleted', label: 'Vô hiệu' };
            default: return { class: 'status-active', label: 'Hoạt động' };
        }
    };

    const getTodayString = () => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date().toLocaleDateString('vi-VN', options);
    };

    // Statistics Calculation
    const stats = {
        total: users.length,
        staff: users.filter(u => u.role === 'STAFF' || u.role === 'ADMIN').length,
        customers: users.filter(u => u.role === 'USER').length
    };

    if (loading) return <div className="user-management-container"><div className="loading-spinner">Đang tải dữ liệu...</div></div>;
    if (error) return <div className="user-management-container"><div className="error-message">{error} <button onClick={fetchUsers} className="refresh-btn" style={{margin:'10px auto', borderRadius:'8px', width:'auto', padding:'0 20px'}}>Thử lại</button></div></div>;

    return (
        <div className="user-management-container">
            {/* --- HEADER DASHBOARD --- */}
            <div className="admin-header-card">
                <div className="header-content">
                    <h1 className="header-title">Quản Lý Khách Hàng</h1>
                    <div className="header-subtitle">
                        <span style={{width:'8px', height:'8px', background:'var(--status-active-text)', borderRadius:'50%', display:'inline-block'}}></span>
                        {getTodayString()}
                    </div>
                </div>

                <div className="header-stats-group">
                    <div className="stat-box purple">
                        <div className="stat-icon-wrapper"><IoPerson /></div>
                        <div className="stat-info"><span className="stat-label">Tổng Users</span><span className="stat-value">{stats.total}</span></div>
                    </div>
                    <div className="stat-box orange">
                        <div className="stat-icon-wrapper"><IoShieldCheckmark /></div>
                        <div className="stat-info"><span className="stat-label">Nhân sự</span><span className="stat-value">{stats.staff}</span></div>
                    </div>
                     <div className="stat-box blue">
                        <div className="stat-icon-wrapper"><IoCheckmarkCircle /></div>
                        <div className="stat-info"><span className="stat-label">Khách hàng</span><span className="stat-value">{stats.customers}</span></div>
                    </div>
                </div>
            </div>

            {/* --- UNIFIED TOOLBAR --- */}
            <div className="filters-section">
                {/* Filter Group */}
                <div className="filter-group">
                    <IoFilter className="filter-icon" />
                    <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="role-select">
                        <option value="ALL">Tất cả vai trò</option>
                        <option value="USER">Khách hàng</option>
                        <option value="STAFF">Nhân viên</option>
                        <option value="ADMIN">Quản trị viên</option>
                    </select>
                </div>

                {/* Search Group */}
                <div className="search-group">
                    <IoSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>

                {/* Refresh Button */}
                <button onClick={fetchUsers} className="btn-refresh" title="Làm mới dữ liệu">
                    <IoReload />
                </button>
            </div>

            {/* --- TABLE --- */}
            <div className="table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th style={{width: '30%'}}>Thành viên</th>
                            <th style={{width: '20%'}}>Liên hệ</th>
                            <th style={{width: '20%'}}>Thông tin khác</th>
                            <th style={{width: '15%'}}>Vai trò & Trạng thái</th>
                            <th style={{textAlign: 'right'}}>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map(user => {
                                const roleConf = getRoleConfig(user.role);
                                const statusConf = getStatusConfig(user.accountStatus);
                                const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random&color=fff&size=128`;

                                return (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="user-profile">
                                                <img src={avatarUrl} alt="avatar" className="user-avatar" />
                                                <div className="user-info-text">
                                                    <strong>{user.fullName || 'Chưa đặt tên'}</strong>
                                                    <small>ID: #{user.id}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{fontWeight:500, fontSize:'0.9rem'}}>{user.email}</div>
                                            <div style={{fontSize:'0.8rem', color:'var(--text-secondary)'}}>{user.phoneNumber || '---'}</div>
                                        </td>
                                        <td>
                                            <div style={{fontSize:'0.85rem', color:'var(--text-main)'}}>
                                                {user.address ? (user.address.length > 25 ? user.address.substring(0,25)+'...' : user.address) : 'Chưa có địa chỉ'}
                                            </div>
                                            <div style={{fontSize:'0.8rem', color:'var(--text-light)'}}>
                                                NS: {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('vi-VN') : '--/--/----'}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{display:'flex', flexDirection:'column', gap:'6px', alignItems:'flex-start'}}>
                                                <span className={`role-badge ${roleConf.class}`}>
                                                    {roleConf.icon} {roleConf.label}
                                                </span>
                                                <span className={`status-badge ${statusConf.class}`}>
                                                    {statusConf.label}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                {user.role !== 'ADMIN' ? (
                                                    <>
                                                        <button className="btn-icon btn-edit" onClick={() => openStatusModal(user)} title="Cập nhật trạng thái">
                                                            <IoCreateOutline size={18} />
                                                        </button>
                                                        <button className="btn-icon btn-delete" onClick={() => handleDeleteUser(user.id)} title="Vô hiệu hóa">
                                                            <IoTrashOutline size={18} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <span style={{fontSize:'0.8rem', color:'#cbd5e1', fontStyle:'italic'}}>Locked</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr><td colSpan="5" style={{textAlign:'center', padding:'3rem', color:'var(--text-light)'}}>Không tìm thấy kết quả phù hợp</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- MODAL --- */}
            {showStatusModal && selectedUser && (
                <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Cập nhật trạng thái</h3>
                        <p>Đang chỉnh sửa: <strong>{selectedUser.fullName}</strong></p>
                        
                        <div className="status-buttons">
                            <button 
                                className={`status-btn active-btn ${selectedUser.accountStatus === 'ACTIVE' ? 'selected' : ''}`}
                                onClick={() => handleUpdateStatus('ACTIVE')}
                                disabled={selectedUser.accountStatus === 'ACTIVE'}
                            >
                                <span><IoCheckmarkCircle style={{marginRight:8}}/> Hoạt động (ACTIVE)</span>
                            </button>
                            
                            <button 
                                className={`status-btn locked-btn ${selectedUser.accountStatus === 'LOCKED' ? 'selected' : ''}`}
                                onClick={() => handleUpdateStatus('LOCKED')}
                                disabled={selectedUser.accountStatus === 'LOCKED'}
                            >
                                <span><IoLockClosed style={{marginRight:8}}/> Khóa tạm thời (LOCKED)</span>
                            </button>
                            
                            <button 
                                className={`status-btn deleted-btn ${selectedUser.accountStatus === 'DELETED' ? 'selected' : ''}`}
                                onClick={() => handleUpdateStatus('DELETED')}
                                disabled={selectedUser.accountStatus === 'DELETED'}
                            >
                                <span><IoCloseCircle style={{marginRight:8}}/> Vô hiệu hóa (DELETED)</span>
                            </button>
                        </div>
                        
                        <button className="close-modal-btn" onClick={() => setShowStatusModal(false)}>
                            Đóng cửa sổ
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;