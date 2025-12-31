import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiTag } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './VoucherManagement.css';

const API_URL = 'http://localhost:8080/api/vouchers';

const VoucherManagement = () => {
    const navigate = useNavigate();
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingVoucher, setEditingVoucher] = useState(null);
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        description: '',
        discountType: 'PERCENTAGE',
        discountValue: 0,
        minOrderValue: 0,
        maxDiscount: 0,
        quantity: null,
        startDate: '',
        endDate: '',
        status: 'ACTIVE'
    });

    // Check authentication
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert('Vui lòng đăng nhập để truy cập trang này');
            navigate('/login');
            return;
        }
    }, [navigate]);

    // Fetch all vouchers
    useEffect(() => {
        fetchVouchers();
    }, []);

    const fetchVouchers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            console.log('Fetching vouchers from:', API_URL);
            const response = await fetch(API_URL, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('Response status:', response.status);
            
            if (response.status === 403) {
                alert('Bạn không có quyền truy cập. Vui lòng đăng nhập với tài khoản Admin.');
                navigate('/login');
                return;
            }
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Vouchers received:', data);
            setVouchers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching vouchers:', error);
            setVouchers([]);
            alert('Không thể tải danh sách voucher: ' + error.message + '\n\nĐảm bảo backend đang chạy ở port 8080');
        } finally {
            setLoading(false);
        }
    };

    // Search vouchers
    const handleSearch = async () => {
        if (!searchKeyword.trim()) {
            fetchVouchers();
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_URL}/search?keyword=${encodeURIComponent(searchKeyword)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Không thể tìm kiếm voucher');
            }
            
            const data = await response.json();
            setVouchers(Array.isArray(data) ? data : []);
            toast.success(`Tìm thấy ${data.length} voucher`);
        } catch (error) {
            console.error('Error searching vouchers:', error);
            toast.error('Không thể tìm kiếm voucher: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Create voucher
    const handleCreate = async (e) => {
        e.preventDefault();
        
        // Validation
        if (formData.discountType === 'PERCENTAGE') {
            if (formData.discountValue <= 0 || formData.discountValue > 100) {
                toast.error('Giảm giá theo phần trăm phải từ 0.01% đến 100%');
                return;
            }
        } else {
            if (formData.discountValue <= 0) {
                toast.error('Giá trị giảm giá phải lớn hơn 0');
                return;
            }
        }
        
        if (formData.startDate && formData.endDate) {
            if (new Date(formData.endDate) <= new Date(formData.startDate)) {
                toast.error('Ngày kết thúc phải sau ngày bắt đầu');
                return;
            }
        }
        
        if (formData.minOrderValue < 0) {
            toast.error('Đơn hàng tối thiểu không được âm');
            return;
        }
        
        if (formData.maxDiscount < 0) {
            toast.error('Giảm giá tối đa không được âm');
            return;
        }
        
        if (formData.quantity !== null && formData.quantity < 0) {
            toast.error('Số lượng không được âm');
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData),
            });

            if (response.status === 403) {
                toast.error('Bạn không có quyền thực hiện thao tác này');
                return;
            }

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error || 'Không thể tạo voucher');
            }

            toast.success('Tạo voucher thành công!');
            setShowModal(false);
            resetForm();
            fetchVouchers();
        } catch (error) {
            console.error('Error creating voucher:', error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Update voucher
    const handleUpdate = async (e) => {
        e.preventDefault();
        
        // Validation tương tự như handleCreate
        if (formData.discountType === 'PERCENTAGE') {
            if (formData.discountValue <= 0 || formData.discountValue > 100) {
                toast.error('Giảm giá theo phần trăm phải từ 0.01% đến 100%');
                return;
            }
        } else {
            if (formData.discountValue <= 0) {
                toast.error('Giá trị giảm giá phải lớn hơn 0');
                return;
            }
        }
        
        if (formData.startDate && formData.endDate) {
            if (new Date(formData.endDate) <= new Date(formData.startDate)) {
                toast.error('Ngày kết thúc phải sau ngày bắt đầu');
                return;
            }
        }
        
        if (formData.minOrderValue < 0) {
            toast.error('Đơn hàng tối thiểu không được âm');
            return;
        }
        
        if (formData.maxDiscount < 0) {
            toast.error('Giảm giá tối đa không được âm');
            return;
        }
        
        if (formData.quantity !== null && formData.quantity < 0) {
            toast.error('Số lượng không được âm');
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_URL}/${editingVoucher.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData),
            });

            if (response.status === 403) {
                toast.error('Bạn không có quyền thực hiện thao tác này');
                return;
            }

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error || 'Không thể cập nhật voucher');
            }

            toast.success('Cập nhật voucher thành công!');
            setShowModal(false);
            setEditingVoucher(null);
            resetForm();
            fetchVouchers();
        } catch (error) {
            console.error('Error updating voucher:', error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Delete voucher
    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa voucher này?\n\nLưu ý: Voucher đang hoạt động hoặc đang được sử dụng trong đơn hàng không thể xóa.')) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 403) {
                toast.error('Bạn không có quyền thực hiện thao tác này');
                return;
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Không thể xóa voucher');
            }

            toast.success('Xóa voucher thành công!');
            fetchVouchers();
        } catch (error) {
            console.error('Error deleting voucher:', error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Open modal for create
    const openCreateModal = () => {
        resetForm();
        setEditingVoucher(null);
        setShowModal(true);
    };

    // Open modal for edit
    const openEditModal = (voucher) => {
        setEditingVoucher(voucher);
        setFormData({
            code: voucher.code,
            name: voucher.name,
            description: voucher.description || '',
            discountType: voucher.discountType,
            discountValue: voucher.discountValue,
            minOrderValue: voucher.minOrderValue || 0,
            maxDiscount: voucher.maxDiscount || 0,
            quantity: voucher.quantity,
            startDate: voucher.startDate ? voucher.startDate.substring(0, 16) : '',
            endDate: voucher.endDate ? voucher.endDate.substring(0, 16) : '',
            status: voucher.status
        });
        setShowModal(true);
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            code: '',
            name: '',
            description: '',
            discountType: 'PERCENTAGE',
            discountValue: 0,
            minOrderValue: 0,
            maxDiscount: 0,
            quantity: null,
            startDate: '',
            endDate: '',
            status: 'ACTIVE'
        });
    };

    // Handle form input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'Không giới hạn';
        return new Date(dateString).toLocaleString('vi-VN');
    };

    // Get status badge class
    const getStatusBadge = (status) => {
        const badges = {
            'ACTIVE': 'badge-active',
            'INACTIVE': 'badge-inactive',
            'EXPIRED': 'badge-expired'
        };
        return badges[status] || 'badge-default';
    };

    // Get status text
    const getStatusText = (status) => {
        const texts = {
            'ACTIVE': 'Hoạt động',
            'INACTIVE': 'Tạm ngưng',
            'EXPIRED': 'Hết hạn'
        };
        return texts[status] || status;
    };

    return (
        <div className="voucher-container">
            <div className="voucher-header">
                <h1><FiTag /> Quản lý Voucher</h1>
                <button className="btn-create" onClick={openCreateModal}>
                    <FiPlus /> Tạo Voucher Mới
                </button>
            </div>

            {/* Search Bar */}
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Tìm kiếm theo mã hoặc tên voucher..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button onClick={handleSearch}>
                    <FiSearch /> Tìm kiếm
                </button>
            </div>

            {/* Voucher Table */}
            {loading ? (
                <div className="loading">Đang tải...</div>
            ) : (
                <div className="table-container">
                    <table className="voucher-table">
                        <thead>
                            <tr>
                                <th>Mã</th>
                                <th>Tên</th>
                                <th>Loại giảm</th>
                                <th>Giá trị</th>
                                <th>Đơn tối thiểu</th>
                                <th>Số lượng</th>
                                <th>Đã dùng</th>
                                <th>Thời gian</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vouchers.length === 0 ? (
                                <tr>
                                    <td colSpan="10" className="text-center">
                                        Không có voucher nào
                                    </td>
                                </tr>
                            ) : (
                                vouchers.map(voucher => (
                                    <tr key={voucher.id}>
                                        <td><strong>{voucher.code}</strong></td>
                                        <td>{voucher.name}</td>
                                        <td>
                                            {voucher.discountType === 'PERCENTAGE' ? 'Phần trăm' : 'Số tiền'}
                                        </td>
                                        <td className="highlight">
                                            {voucher.discountType === 'PERCENTAGE' 
                                                ? `${voucher.discountValue}%` 
                                                : formatCurrency(voucher.discountValue)}
                                        </td>
                                        <td>{formatCurrency(voucher.minOrderValue || 0)}</td>
                                        <td>{voucher.quantity || 'Không giới hạn'}</td>
                                        <td>{voucher.usedCount}</td>
                                        <td>
                                            <div className="date-range">
                                                <small>Từ: {formatDate(voucher.startDate)}</small>
                                                <small>Đến: {formatDate(voucher.endDate)}</small>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${getStatusBadge(voucher.status)}`}>
                                                {getStatusText(voucher.status)}
                                            </span>
                                        </td>
                                        <td className="actions">
                                            <button
                                                className="btn-edit"
                                                onClick={() => openEditModal(voucher)}
                                                title="Sửa"
                                            >
                                                <FiEdit2 />
                                            </button>
                                            <button
                                                className="btn-delete"
                                                onClick={() => handleDelete(voucher.id)}
                                                title="Xóa"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>{editingVoucher ? 'Cập nhật Voucher' : 'Tạo Voucher Mới'}</h2>
                        
                        <form onSubmit={editingVoucher ? handleUpdate : handleCreate}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Mã voucher *</label>
                                    <input
                                        type="text"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="VD: SUMMER2024"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Tên voucher *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="VD: Giảm giá mùa hè"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Mô tả</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="3"
                                    placeholder="Mô tả chi tiết về voucher..."
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Loại giảm giá *</label>
                                    <select
                                        name="discountType"
                                        value={formData.discountType}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="PERCENTAGE">Phần trăm (%)</option>
                                        <option value="FIXED_AMOUNT">Số tiền cố định</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Giá trị giảm *</label>
                                    <input
                                        type="number"
                                        name="discountValue"
                                        value={formData.discountValue}
                                        onChange={handleInputChange}
                                        required
                                        min="0.01"
                                        max={formData.discountType === 'PERCENTAGE' ? '100' : undefined}
                                        step="0.01"
                                        placeholder={formData.discountType === 'PERCENTAGE' ? 'VD: 10 (tối đa 100)' : 'VD: 50000'}
                                    />
                                    {formData.discountType === 'PERCENTAGE' && (
                                        <small style={{color: '#64748b'}}>Lưu ý: Giảm giá từ 0.01% đến 100%</small>
                                    )}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Giá trị đơn hàng tối thiểu</label>
                                    <input
                                        type="number"
                                        name="minOrderValue"
                                        value={formData.minOrderValue}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="1000"
                                        placeholder="0 (áp dụng cho tất cả)"
                                    />
                                    <small style={{color: '#64748b'}}>Đơn hàng tối thiểu để áp dụng voucher</small>
                                </div>

                                <div className="form-group">
                                    <label>Giảm giá tối đa</label>
                                    <input
                                        type="number"
                                        name="maxDiscount"
                                        value={formData.maxDiscount}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="1000"
                                        placeholder="0 (không giới hạn)"
                                    />
                                    <small style={{color: '#64748b'}}>Giới hạn số tiền giảm tối đa (cho voucher %)</small>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Số lượng</label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        value={formData.quantity || ''}
                                        onChange={handleInputChange}
                                        min="1"
                                        placeholder="Để trống = không giới hạn"
                                    />
                                    <small style={{color: '#64748b'}}>Số lần voucher có thể được sử dụng</small>
                                </div>

                                <div className="form-group">
                                    <label>Trạng thái *</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="ACTIVE">Hoạt động</option>
                                        <option value="INACTIVE">Tạm ngưng</option>
                                        <option value="EXPIRED">Hết hạn</option>
                                    </select>
                                    <small style={{color: '#64748b'}}>Chỉ voucher ACTIVE mới được áp dụng</small>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Ngày bắt đầu</label>
                                    <input
                                        type="datetime-local"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleInputChange}
                                    />
                                    <small style={{color: '#64748b'}}>Để trống = có hiệu lực ngay</small>
                                </div>

                                <div className="form-group">
                                    <label>Ngày kết thúc</label>
                                    <input
                                        type="datetime-local"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleInputChange}
                                    />
                                    <small style={{color: '#64748b'}}>Để trống = không giới hạn</small>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingVoucher(null);
                                        resetForm();
                                    }}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="btn-submit"
                                    disabled={loading}
                                >
                                    {loading ? 'Đang xử lý...' : (editingVoucher ? 'Cập nhật' : 'Tạo mới')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VoucherManagement;
