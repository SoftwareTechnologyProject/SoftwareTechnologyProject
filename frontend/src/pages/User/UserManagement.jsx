import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../config/axiosConfig';
import { AppConstants } from '../../util/constant';
import './UserManagement.css';

const UserManagement = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('ALL');

    // Check authentication
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert('Vui lòng đăng nhập để truy cập trang này');
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
            const response = await axios.get('/api/users');
            console.log('Users data:', response.data);
            
            // Xử lý circular reference: chỉ lấy thông tin cần thiết
            const cleanedUsers = Array.isArray(response.data) 
                ? response.data.map(user => ({
                    id: user.id,
                    fullName: user.fullName,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    address: user.address,
                    dateOfBirth: user.dateOfBirth,
                    role: user.role
                }))
                : [];
            
            setUsers(cleanedUsers);
            setError(null);
        } catch (err) {
            setError('Không thể tải danh sách người dùng. Vui lòng thử lại.');
            console.error('Error fetching users:', err);
            setUsers([]); // Reset về array rỗng khi có lỗi
        } finally {
            setLoading(false);
        }
    };

    // Lọc users theo tìm kiếm và role
    const filteredUsers = Array.isArray(users) ? users.filter(user => {
        const matchesSearch = user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.phoneNumber?.includes(searchTerm);
        
        const matchesRole = filterRole === 'ALL' || user.role === filterRole;
        
        return matchesSearch && matchesRole;
    }) : [];

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Bạn có chắc muốn xóa người dùng này?')) {
            try {
                await axios.delete(`/api/users/${userId}`);
                fetchUsers(); // Refresh danh sách
            } catch (err) {
                alert('Không thể xóa người dùng. Vui lòng thử lại.');
                console.error('Error deleting user:', err);
            }
        }
    };

    const getRoleBadgeClass = (role) => {
        switch (role) {
            case 'ADMIN': return 'role-owner';
            case 'STAFF': return 'role-staff';
            case 'USER': return 'role-customer';
            default: return 'role-customer';
        }
    };

    if (loading) {
        return (
            <div className="user-management-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="user-management-container">
                <div className="error-message">
                    <p>{error}</p>
                    <button onClick={fetchUsers} className="retry-btn">Thử lại</button>
                </div>
            </div>
        );
    }

    return (
        <div className="user-management-container">
            <div className="page-header">
                <h1>Quản Lý Khách Hàng</h1>
                <p>Tổng số người dùng: {users.length}</p>
            </div>

            {/* Filters */}
            <div className="filters-section">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                
                <div className="role-filter">
                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="role-select"
                    >
                        <option value="ALL">Tất cả vai trò</option>
                        <option value="USER">Khách hàng</option>
                        <option value="STAFF">Nhân viên</option>
                        <option value="ADMIN">Chủ sở hữu</option>
                    </select>
                </div>

                <button onClick={fetchUsers} className="refresh-btn">
                    Làm mới
                </button>
            </div>

            {/* Users Table */}
            <div className="table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Họ tên</th>
                            <th>Email</th>
                            <th>Số điện thoại</th>
                            <th>Địa chỉ</th>
                            <th>Ngày sinh</th>
                            <th>Vai trò</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map(user => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td className="user-name">
                                        <div className="name-cell">
                                            {user.fullName || 'Chưa cập nhật'}
                                        </div>
                                    </td>
                                    <td>{user.email}</td>
                                    <td>{user.phoneNumber || 'Chưa cập nhật'}</td>
                                    <td className="address-cell" title={user.address}>
                                        {user.address ? (
                                            user.address.length > 30 
                                                ? user.address.substring(0, 30) + '...'
                                                : user.address
                                        ) : 'Chưa cập nhật'}
                                    </td>
                                    <td>
                                        {user.dateOfBirth 
                                            ? new Date(user.dateOfBirth).toLocaleDateString('vi-VN')
                                            : 'Chưa cập nhật'
                                        }
                                    </td>
                                    <td>
                                        <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            {user.role !== 'ADMIN' ? (
                                                <button 
                                                    className="delete-btn"
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    title="Xóa người dùng"
                                                >
                                                    🗑️
                                                </button>
                                            ) : (
                                                <span className="no-action">-</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="no-data">
                                    Không tìm thấy người dùng nào
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Statistics */}
            <div className="statistics-section">
                <div className="stat-card">
                    <h3>Thống kê</h3>
                    <div className="stats-grid">
                        <div className="stat-item">
                            <span className="stat-label">Khách hàng:</span>
                            <span className="stat-value">
                                {users.filter(u => u.role === 'USER').length}
                            </span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Nhân viên:</span>
                            <span className="stat-value">
                                {users.filter(u => u.role === 'STAFF').length}
                            </span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Chủ sở hữu:</span>
                            <span className="stat-value">
                                {users.filter(u => u.role === 'ADMIN').length}
                            </span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Tìm thấy:</span>
                            <span className="stat-value">{filteredUsers.length}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;