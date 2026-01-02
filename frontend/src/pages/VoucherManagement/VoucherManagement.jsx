import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from "sweetalert2";

// Import Icons từ thư viện react-icons/io5
import { 
    IoTicket, IoSearch, IoAdd, 
    IoCreateOutline, IoTrashOutline, 
    IoTimeOutline, IoCheckmarkCircle, IoWarningOutline,
    IoClose, IoPricetag, IoRefresh, IoFlashOutline,
    IoCalendarOutline 
} from "react-icons/io5";

// Import file CSS tương ứng
import './VoucherManagement.css';

const API_URL = 'http://localhost:8080/api/vouchers';

// --- COMPONENT: SKELETON LOADER (Hiệu ứng khi đang tải dữ liệu) ---
const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td colSpan="5">
      <div style={{height: '64px', background: '#f8fafc', borderRadius: '12px', width: '100%', display: 'flex', alignItems: 'center', padding: '0 1rem'}}>
          <div style={{width: '30%', height: '16px', background: '#e2e8f0', borderRadius: '4px'}}></div>
          <div style={{width: '20%', height: '16px', background: '#e2e8f0', borderRadius: '4px', marginLeft: 'auto'}}></div>
      </div>
    </td>
  </tr>
);

const VoucherManagement = () => {
    const navigate = useNavigate();
    
    // --- STATE MANAGEMENT ---
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingVoucher, setEditingVoucher] = useState(null);
    
    // Form State
    const [formData, setFormData] = useState({
        code: '', name: '', description: '',
        discountType: 'PERCENTAGE', discountValue: 0,
        minOrderValue: 0, maxDiscount: 0,
        quantity: '', startDate: '', endDate: '', status: 'ACTIVE'
    });

    // --- EFFECT: LOAD DATA ---
    useEffect(() => {
        fetchVouchers();
    }, []);

    // --- HELPER: LẤY NGÀY HIỆN TẠI ---
    const getCurrentDate = () => {
        const date = new Date();
        const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
        const dayName = days[date.getDay()];
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        // Định dạng: "Thứ Bảy, 3 tháng 1, 2026"
        return `${dayName}, ${day} tháng ${month}, ${year}`;
    };

    // --- API FUNCTIONS ---
    const fetchVouchers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(API_URL, {
                // headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!response.ok) {
                // Nếu API lỗi hoặc chưa chạy, set mảng rỗng để không crash UI
                setVouchers([]); 
            } else {
                const data = await response.json();
                setVouchers(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Lỗi tải dữ liệu:', error);
            // toast.error('Không thể kết nối đến máy chủ'); 
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchKeyword.trim()) { fetchVouchers(); return; }
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_URL}/search?keyword=${encodeURIComponent(searchKeyword)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setVouchers(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            toast.error('Lỗi khi tìm kiếm');
        } finally {
            setLoading(false);
        }
    };

    // --- FORM HANDLERS ---
    const validateForm = () => {
        if (!formData.code.trim()) return "Mã voucher không được để trống";
        if (!formData.name.trim()) return "Tên voucher không được để trống";
        if (formData.discountType === 'PERCENTAGE' && (formData.discountValue <= 0 || formData.discountValue > 100)) 
            return 'Giảm giá % phải từ 0.01 đến 100';
        if (formData.discountType !== 'PERCENTAGE' && formData.discountValue <= 0) 
            return 'Giá trị giảm phải lớn hơn 0';
        if (formData.startDate && formData.endDate && new Date(formData.endDate) <= new Date(formData.startDate)) 
            return 'Ngày kết thúc phải sau ngày bắt đầu';
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const error = validateForm();
        if (error) { toast.error(error); return; }

        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const payload = { ...formData, quantity: formData.quantity === '' ? null : formData.quantity };
            const url = editingVoucher ? `${API_URL}/${editingVoucher.id}` : API_URL;
            const method = editingVoucher ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error('Thao tác thất bại');

            toast.success(editingVoucher ? 'Đã cập nhật voucher!' : 'Tạo mới thành công!');
            setShowModal(false);
            resetForm();
            fetchVouchers();
        } catch (error) {
            toast.error(error.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Xóa Voucher?',
            text: "Hành động này không thể hoàn tác!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d90429',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Xóa ngay',
            cancelButtonText: 'Hủy'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const token = localStorage.getItem('accessToken');
                    const response = await fetch(`${API_URL}/${id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                        Swal.fire('Đã xóa!', 'Voucher đã được xóa.', 'success');
                        fetchVouchers();
                    } else throw new Error();
                } catch (error) {
                    Swal.fire('Lỗi', 'Không thể xóa voucher này.', 'error');
                }
            }
        });
    };

    // --- HELPER FUNCTIONS ---
    const openCreateModal = () => { resetForm(); setEditingVoucher(null); setShowModal(true); };
    
    const openEditModal = (voucher) => {
        setEditingVoucher(voucher);
        setFormData({
            ...voucher,
            quantity: voucher.quantity === null ? '' : voucher.quantity,
            startDate: voucher.startDate ? voucher.startDate.substring(0, 16) : '',
            endDate: voucher.endDate ? voucher.endDate.substring(0, 16) : '',
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            code: '', name: '', description: '',
            discountType: 'PERCENTAGE', discountValue: 0,
            minOrderValue: 0, maxDiscount: 0, quantity: '',
            startDate: '', endDate: '', status: 'ACTIVE'
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    
    const formatDateDisplay = (dateString) => {
        if (!dateString) return 'Vĩnh viễn';
        return new Date(dateString).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit' });
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'ACTIVE': return { class: 'status-active', label: 'Hoạt động', icon: <IoCheckmarkCircle /> };
            case 'INACTIVE': return { class: 'status-inactive', label: 'Tạm ngưng', icon: <IoWarningOutline /> };
            case 'EXPIRED': return { class: 'status-expired', label: 'Hết hạn', icon: <IoTimeOutline /> };
            default: return { class: 'status-inactive', label: status, icon: <IoWarningOutline /> };
        }
    };

    // Thống kê đơn giản
    const stats = {
        total: vouchers.length,
        active: vouchers.filter(v => v.status === 'ACTIVE').length,
        inactive: vouchers.filter(v => v.status !== 'ACTIVE').length
    };

    return (
        <div className="voucher-container">
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
            
            {/* --- HEADER DASHBOARD --- */}
            <div className="admin-header-card">
                {/* [LEFT] Tiêu đề & Ngày tháng */}
                <div className="header-content">
                    <h1 className="header-title">
                        <IoTicket style={{ color: 'var(--primary)' }} /> Quản Lý Voucher
                    </h1>
                    {/* Hiển thị ngày tháng hiện tại */}
                    <div className="header-subtitle" style={{display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem'}}>
                        <IoCalendarOutline /> {getCurrentDate()}
                    </div>
                </div>
                
                {/* [RIGHT] Stats + Nút Tạo Mới */}
                <div className="header-right-section">
                    <div className="header-stats-group">
                        <div className="stat-box blue">
                            <div className="stat-icon-wrapper"><IoPricetag /></div>
                            <div className="stat-info"><span className="stat-label">Tổng</span><span className="stat-value">{stats.total}</span></div>
                        </div>
                        <div className="stat-box green">
                            <div className="stat-icon-wrapper"><IoFlashOutline /></div>
                            <div className="stat-info"><span className="stat-label">Đang chạy</span><span className="stat-value">{stats.active}</span></div>
                        </div>
                        <div className="stat-box red">
                            <div className="stat-icon-wrapper"><IoTimeOutline /></div>
                            <div className="stat-info"><span className="stat-label">Hết hạn</span><span className="stat-value">{stats.inactive}</span></div>
                        </div>
                    </div>

                    <button className="btn-create-header" onClick={openCreateModal}>
                        <IoAdd size={22} /> <span>Tạo Voucher</span>
                    </button>
                </div>
            </div>

            {/* --- TOOLBAR: SEARCH CENTERED --- */}
            <div className="toolbar-wrapper">
                <div className="filters-section">
                    <div className="search-group">
                        <IoSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo mã, tên voucher..."
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="search-input"
                        />
                        <button onClick={fetchVouchers} className="btn-icon-refresh" title="Làm mới">
                            <IoRefresh size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* --- TABLE DATA --- */}
            <div className="table-container">
                <table className="voucher-table">
                    <thead>
                        <tr>
                            <th style={{width: '20%'}}>Mã Voucher</th>
                            <th style={{width: '20%'}}>Giá trị giảm</th>
                            <th style={{width: '30%'}}>Điều kiện & Thời gian</th>
                            <th style={{width: '15%'}}>Trạng thái</th>
                            <th style={{textAlign: 'right'}}>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                             [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                        ) : vouchers.length === 0 ? (
                            <tr><td colSpan="5"><div className="empty-state"><IoTicket size={48} style={{opacity:0.2}}/><p>Chưa có voucher nào</p></div></td></tr>
                        ) : (
                            vouchers.map(voucher => {
                                const statusConfig = getStatusConfig(voucher.status);
                                return (
                                    <tr key={voucher.id}>
                                        <td>
                                            <span className="code-badge">{voucher.code}</span>
                                            <div style={{fontSize: '0.85rem', marginTop: '6px', fontWeight: 600, color:'var(--text-secondary)'}}>
                                                {voucher.name}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="discount-value">
                                                {voucher.discountType === 'PERCENTAGE' 
                                                    ? `${voucher.discountValue}%` 
                                                    : formatCurrency(voucher.discountValue)}
                                            </div>
                                            <div className="discount-type">
                                                {voucher.discountType === 'PERCENTAGE' ? 'Giảm theo %' : 'Giảm trực tiếp'}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{fontSize: '0.85rem', color: 'var(--text-main)', marginBottom:'4px'}}>
                                                Min đơn: <strong>{formatCurrency(voucher.minOrderValue || 0)}</strong>
                                            </div>
                                            <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)', display:'flex', alignItems:'center', gap:'4px'}}>
                                                <IoTimeOutline />
                                                <span>{formatDateDisplay(voucher.endDate)}</span>
                                            </div>
                                            <div style={{fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '4px'}}>
                                                SL: {voucher.quantity || '∞'} • Đã dùng: {voucher.usedCount || 0}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${statusConfig.class}`}>
                                                {statusConfig.icon} {statusConfig.label}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="btn-icon btn-edit" onClick={() => openEditModal(voucher)} title="Sửa">
                                                    <IoCreateOutline size={18} />
                                                </button>
                                                <button className="btn-icon btn-delete" onClick={() => handleDelete(voucher.id)} title="Xóa">
                                                    <IoTrashOutline size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- MODAL FORM --- */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 style={{margin:0, fontSize:'1.4rem'}}>{editingVoucher ? 'Cập nhật Voucher' : 'Tạo Voucher Mới'}</h2>
                            <button className="btn-icon" onClick={() => setShowModal(false)}><IoClose size={22} /></button>
                        </div>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Mã Code <span style={{color:'var(--primary)'}}>*</span></label>
                                    <input type="text" name="code" value={formData.code} onChange={handleInputChange} required placeholder="VD: SALE2024" style={{textTransform:'uppercase', fontWeight:'bold'}} />
                                </div>
                                <div className="form-group">
                                    <label>Tên chương trình <span style={{color:'var(--primary)'}}>*</span></label>
                                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="VD: Siêu Sale Mùa Hè" />
                                </div>

                                <div className="form-group">
                                    <label>Loại giảm giá</label>
                                    <select name="discountType" value={formData.discountType} onChange={handleInputChange}>
                                        <option value="PERCENTAGE">Phần trăm (%)</option>
                                        <option value="FIXED_AMOUNT">Số tiền (VND)</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Giá trị giảm <span style={{color:'var(--primary)'}}>*</span></label>
                                    <input type="number" name="discountValue" value={formData.discountValue} onChange={handleInputChange} required min="0" />
                                </div>

                                <div className="form-group">
                                    <label>Đơn tối thiểu</label>
                                    <input type="number" name="minOrderValue" value={formData.minOrderValue} onChange={handleInputChange} min="0" step="1000" />
                                </div>
                                <div className="form-group">
                                    <label>Giảm tối đa (Nếu là %)</label>
                                    <input type="number" name="maxDiscount" value={formData.maxDiscount} onChange={handleInputChange} min="0" step="1000" disabled={formData.discountType !== 'PERCENTAGE'} style={formData.discountType !== 'PERCENTAGE' ? {opacity: 0.5, background:'#f1f5f9'} : {}} />
                                </div>

                                <div className="form-group">
                                    <label>Số lượng (Trống = ∞)</label>
                                    <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} min="1" placeholder="Vô hạn" />
                                </div>
                                <div className="form-group">
                                    <label>Trạng thái</label>
                                    <select name="status" value={formData.status} onChange={handleInputChange}>
                                        <option value="ACTIVE">Hoạt động</option>
                                        <option value="INACTIVE">Tạm ngưng</option>
                                        <option value="EXPIRED">Hết hạn</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Bắt đầu</label>
                                    <input type="datetime-local" name="startDate" value={formData.startDate} onChange={handleInputChange} />
                                </div>
                                <div className="form-group">
                                    <label>Kết thúc</label>
                                    <input type="datetime-local" name="endDate" value={formData.endDate} onChange={handleInputChange} />
                                </div>

                                <div className="form-group full-width">
                                    <label>Mô tả chi tiết</label>
                                    <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" placeholder="Ghi chú về đợt giảm giá này..." />
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Hủy bỏ</button>
                                <button type="submit" className="btn-submit" disabled={loading}>
                                    {loading ? 'Đang lưu...' : (editingVoucher ? 'Lưu thay đổi' : 'Tạo voucher')}
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