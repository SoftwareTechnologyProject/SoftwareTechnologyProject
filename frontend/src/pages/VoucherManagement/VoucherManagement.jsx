import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiTag } from 'react-icons/fi';
import './VoucherManagement.css';

const API_URL = 'http://localhost:8081/vouchers';

const VoucherManagement = () => {
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

    // Fetch all vouchers
    useEffect(() => {
        fetchVouchers();
    }, []);

    const fetchVouchers = async () => {
        setLoading(true);
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setVouchers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching vouchers:', error);
            setVouchers([]);
            alert('Không thể tải danh sách voucher: ' + error.message);
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
            const response = await fetch(`${API_URL}/search?keyword=${searchKeyword}`);
            const data = await response.json();
            setVouchers(data);
        } catch (error) {
            console.error('Error searching vouchers:', error);
            alert('Không thể tìm kiếm voucher');
        } finally {
            setLoading(false);
        }
    };

    // Create voucher
    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Không thể tạo voucher');
            }

            alert('Tạo voucher thành công!');
            setShowModal(false);
            resetForm();
            fetchVouchers();
        } catch (error) {
            console.error('Error creating voucher:', error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Update voucher
    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/${editingVoucher.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Không thể cập nhật voucher');
            }

            alert('Cập nhật voucher thành công!');
            setShowModal(false);
            setEditingVoucher(null);
            resetForm();
            fetchVouchers();
        } catch (error) {
            console.error('Error updating voucher:', error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Delete voucher
    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa voucher này?')) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Không thể xóa voucher');
            }

            alert('Xóa voucher thành công!');
            fetchVouchers();
        } catch (error) {
            console.error('Error deleting voucher:', error);
            alert(error.message);
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
                                        min="0"
                                        step="0.01"
                                        placeholder={formData.discountType === 'PERCENTAGE' ? 'VD: 10' : 'VD: 50000'}
                                    />
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
                                        placeholder="0"
                                    />
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
                                        min="0"
                                        placeholder="Để trống = không giới hạn"
                                    />
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
                                </div>

                                <div className="form-group">
                                    <label>Ngày kết thúc</label>
                                    <input
                                        type="datetime-local"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleInputChange}
                                    />
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
