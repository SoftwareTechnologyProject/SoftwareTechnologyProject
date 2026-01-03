import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient.js";
import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";

// Import icons giống BookAdmin
import {
  IoReceiptOutline, IoCalendarOutline, IoPersonOutline,
  IoCheckmark, IoClose, IoEyeOutline, IoTimeOutline, IoCubeOutline,
  IoChevronBack, IoChevronForward, IoPlaySkipBack, IoPlaySkipForward
} from "react-icons/io5";

import "./OrderAdmin.css";

const API_URL = "http://localhost:8080/api/orders";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Lấy ngày hiện tại
const getCurrentDate = () => {
  const date = new Date();
  const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  return `${days[date.getDay()]}, ${date.getDate()} tháng ${date.getMonth() + 1}, ${date.getFullYear()}`;
};

// Skeleton Loader cho Table (Copy logic từ BookAdmin)
const SkeletonRow = () => (
  <tr className="animate-pulse" style={{borderBottom:'none'}}>
    <td colSpan="6" style={{padding:'1rem 0'}}>
      <div style={{background:'white', borderRadius:'12px', padding:'1rem', display:'flex', alignItems:'center', boxShadow:'0 2px 4px rgba(0,0,0,0.02)'}}>
        <div style={{width:'40px', height:'56px', background:'#f1f5f9', borderRadius:'4px', marginRight:'1rem'}}></div>
        <div style={{flex:1}}>
          <div style={{height:'16px', background:'#f1f5f9', borderRadius:'4px', width:'40%', marginBottom:'8px'}}></div>
          <div style={{height:'12px', background:'#f1f5f9', borderRadius:'4px', width:'25%'}}></div>
        </div>
      </div>
    </td>
  </tr>
);

export default function OrderAdmin() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("ALL");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const SHIPPING_FEE = 32000;

  const token = localStorage.getItem("accessToken");

  const tabs = [
    { key: "ALL", label: "Tất cả" },
    { key: "PENDING", label: "Chờ xử lý" },
    { key: "DELIVERY", label: "Đang giao" },
    { key: "SUCCESS", label: "Hoàn tất" },
    { key: "CANCELLED", label: "Đã hủy" },
  ];

  useEffect(() => {
    if (!token) {
      toast.error("Vui lòng đăng nhập");
      navigate("/login");
    } else {
      fetchOrders();
    }
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Lỗi server");

      const data = await res.json();
      const sortedData = Array.isArray(data) ? data.sort((a,b) => b.id - a.id) : [];
      setOrders(sortedData);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải đơn hàng.");
    } finally {
      setLoading(false);
    }
  };

  // Filter
  const filteredOrders = activeTab === "ALL"
    ? orders
    : orders.filter((o) => o.status?.toUpperCase() === activeTab);

  // Pagination Logic
  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => { setCurrentPage(1); }, [activeTab]);

  // Handle Status Updates
  const updateStatus = async (orderId, newStatus, successMsg) => {
    try {
      const res = await fetch(`${API_URL}/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Lỗi cập nhật");

      toast.success(successMsg);
      fetchOrders();
    } catch (err) {
      toast.error("Có lỗi xảy ra");
    }
  };

  const handleCancel = (id) => {
    Swal.fire({
      title: 'Hủy đơn hàng?', text: "Hành động này không thể hoàn tác!", icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#64748b',
      confirmButtonText: 'Hủy đơn', cancelButtonText: 'Quay lại'
    }).then((result) => {
      if (result.isConfirmed) {
        updateStatus(id, "CANCELLED", "Đã hủy đơn hàng");
      }
    });
  };

  // Helper render badge
  const renderBadge = (status) => {
    const map = {
      'PENDING': { class: 'pending', text: 'Chờ xử lý' },
      'DELIVERY': { class: 'delivery', text: 'Đang giao' },
      'SUCCESS': { class: 'success', text: 'Hoàn tất' },
      'CANCELLED': { class: 'cancelled', text: 'Đã hủy' }
    };
    const s = map[status] || { class: 'pending', text: status };
    return <span className={`status-badge ${s.class}`}>{s.text}</span>;
  };

  // Helper render pagination (giống BookAdmin)
  const renderPageNumbers = () => {
    const pageNumbers = [];
    const page = currentPage - 1; // Logic của BookAdmin dùng index 0, ở đây dùng 1 nên trừ đi
    const total = totalPages;
    
    let start = Math.max(0, page - 2), end = Math.min(total - 1, page + 2);
    if (end - start < 4) { if (start === 0) end = Math.min(total - 1, 4); else start = Math.max(0, total - 5); }
    
    for (let i = start; i <= end; i++) {
      pageNumbers.push(
        <button key={i} className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`} onClick={() => setCurrentPage(i + 1)}>
          {i + 1}
        </button>
      );
    }
    return pageNumbers;
  };

  return (
    <div className="order-admin-page">
      <Toaster position="top-center" />

      {/* --- HEADER --- */}
      <div className="admin-header-card">
        <div className="header-content">
          <h1 className="header-title">Quản Lý Đơn Hàng</h1>
          <div className="header-subtitle">
            <IoCalendarOutline /> {getCurrentDate()}
          </div>
        </div>

        <div className="header-stats-group">
           <div className="stat-box blue">
              <div className="stat-icon-wrapper"><IoReceiptOutline /></div>
              <div className="stat-info"><span className="stat-label">Tổng đơn</span><span className="stat-value">{orders.length}</span></div>
           </div>
           <div className="stat-box orange">
              <div className="stat-icon-wrapper"><IoTimeOutline /></div>
              <div className="stat-info"><span className="stat-label">Chờ xử lý</span><span className="stat-value">{orders.filter(o => o.status === 'PENDING').length}</span></div>
           </div>
        </div>
      </div>

      {/* --- TABS --- */}
      <div className="filter-container">
        <div className="status-tabs">
          {tabs.map((t) => {
            const count = orders.filter(o => t.key === "ALL" || o.status?.toUpperCase() === t.key).length;
            return (
              <button
                key={t.key}
                className={`tab-pill ${activeTab === t.key ? "active" : ""}`}
                onClick={() => setActiveTab(t.key)}
              >
                {t.label} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* --- TABLE --- */}
      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th style={{width: '10%'}}>Mã Đơn</th>
              <th style={{width: '25%'}}>Khách hàng</th>
              <th style={{width: '30%'}}>Sản phẩm</th>
              <th style={{width: '15%'}}>Tổng tiền</th>
              <th style={{width: '10%'}}>Trạng thái</th>
              <th style={{textAlign: 'right'}}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? [...Array(5)].map((_, i) => <SkeletonRow key={i} />) : paginatedOrders.length > 0 ? (
              paginatedOrders.map((order) => {
                const firstItem = order.orderDetails?.[0];
                const qty = order.orderDetails?.reduce((sum, item) => sum + item.quantity, 0) || 0;
                const total = Number(order?.totalAmount || 0) + SHIPPING_FEE;

                return (
                  <tr key={order.id}>
                    <td>
                      <div className="order-id-cell">#<span onClick={() => navigate(`/admin/order/${order.id}`)}>{order.id}</span></div>
                      <div style={{fontSize:'0.75rem', color:'var(--text-light)', marginTop:'4px'}}>
                        {new Date(order.orderDate).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td>
                      <div className="user-info"><IoPersonOutline /> {order.userFullName || "Khách vãng lai"}</div>
                      <div style={{fontSize:'0.85rem', color:'var(--text-secondary)', marginTop:'2px'}}>{order.userPhone || "---"}</div>
                    </td>
                    <td>
                      <div className="item-preview">
                         <img 
                           src={firstItem?.imageUrl || "https://placehold.co/40x56?text=..."} 
                           alt="" className="item-img"
                           onError={(e) => e.target.src = "https://placehold.co/40x56?text=Err"}
                         />
                         <div>
                            <div style={{fontWeight:600, fontSize:'0.95rem', color:'var(--text-main)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>{firstItem?.bookTitle || "Sản phẩm"}</div>
                            <div style={{fontSize:'0.8rem', color:'var(--text-secondary)'}}>
                              {qty > 1 ? `và ${qty - 1} sản phẩm khác` : `x${qty}`}
                            </div>
                         </div>
                      </div>
                    </td>
                    <td>
                      <div className="price-main">{formatCurrency(total)}</div>
                      <div className="price-sub">Ship: {formatCurrency(SHIPPING_FEE)}</div>
                    </td>
                    <td>
                      {renderBadge(order.status)}
                    </td>
                    <td>
                      <div className="actions">
                        {order.status === 'PENDING' && (
                          <>
                            <button className="btn-icon btn-check" title="Duyệt đơn" onClick={() => updateStatus(order.id, 'DELIVERY', 'Đã duyệt đơn hàng')}>
                              <IoCheckmark size={18} />
                            </button>
                            <button className="btn-icon btn-cancel" title="Hủy đơn" onClick={() => handleCancel(order.id)}>
                              <IoClose size={18} />
                            </button>
                          </>
                        )}
                        
                        {order.status === 'DELIVERY' && (
                           <button className="btn-icon btn-done" title="Hoàn thành" onClick={() => updateStatus(order.id, 'SUCCESS', 'Đơn hàng hoàn tất')}>
                              <IoCheckmark size={18} />
                           </button>
                        )}

                        <button className="btn-icon btn-view" title="Xem chi tiết" onClick={() => navigate(`/admin/order/${order.id}`)}>
                          <IoEyeOutline size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr><td colSpan="6"><div style={{textAlign:'center', padding:'3rem', color:'#cbd5e1'}}><IoCubeOutline size={64}/><p>Không tìm thấy đơn hàng nào</p></div></td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- PAGINATION --- */}
      {!loading && totalPages > 0 && (
        <div className="pagination-wrapper">
          <div style={{fontSize:'0.9rem', color:'var(--text-secondary)'}}>Trang <strong>{currentPage}</strong> / {totalPages}</div>
          <div style={{display:'flex', gap:'5px'}}>
            <button className="page-btn" disabled={currentPage===1} onClick={()=>setCurrentPage(1)} title="Trang đầu"><IoPlaySkipBack/></button>
            <button className="page-btn" disabled={currentPage===1} onClick={()=>setCurrentPage(c=>c-1)} title="Trang trước"><IoChevronBack/></button>
            
            {renderPageNumbers()}
            
            <button className="page-btn" disabled={currentPage===totalPages} onClick={()=>setCurrentPage(c=>c+1)} title="Trang sau"><IoChevronForward/></button>
            <button className="page-btn" disabled={currentPage===totalPages} onClick={()=>setCurrentPage(totalPages)} title="Trang cuối"><IoPlaySkipForward/></button>
          </div>
          <div style={{width:'50px'}}></div> 
        </div>
      )}
    </div>
  );
}