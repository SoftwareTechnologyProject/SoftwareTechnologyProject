import { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";

// Sử dụng bộ icon IO5
import {
  IoAdd, IoSearch, IoClose, IoTrash, IoCreate,
  IoCloudUpload, IoBookOutline,
  IoChevronBack, IoChevronForward,
  IoPlaySkipBack, IoPlaySkipForward, 
  IoCubeOutline, IoPricetagsOutline,
  IoLibrary, IoStatsChart, IoAlertCircle,
  IoArrowForward // Icon cho nút Go
} from "react-icons/io5";

import "./BookAdmin.css";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export default function BookAdmin() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("title");

  // State phân trang
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [jumpPage, setJumpPage] = useState(""); // State cho ô nhập trang

  const [showDrawer, setShowDrawer] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [modalMode, setModalMode] = useState("create");
  const [selectedBook, setSelectedBook] = useState(null);

  // State tìm kiếm tác giả
  const [authorSearch, setAuthorSearch] = useState(""); 
  const [showAuthorDropdown, setShowAuthorDropdown] = useState(false);

  const [formData, setFormData] = useState({
    title: "", description: "", publisherYear: new Date().getFullYear(),
    publisherId: "", authorIds: [], categoryIds: [],
    variants: []
  });

  const [publishers, setPublishers] = useState([]);
  const [authors, setAuthors] = useState([]);

  // Fetch dữ liệu
  const fetchBooks = async () => {
    try {
      setLoading(true);
      let url = `/books?page=${page}&size=7&sortBy=id`;
      if (searchTerm) url = `/books/search?${searchType}=${searchTerm}&page=${page}&size=7`;

      const response = await axiosClient.get(url);
      if (response.data.content) {
        setBooks(response.data.content);
        setTotalPages(response.data.totalPages || 1);
      } else {
        setBooks([]); setTotalPages(0);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách sách");
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [pubRes, authRes] = await Promise.all([
        axiosClient.get("/publishers"),
        axiosClient.get("/authors")
      ]);
      setPublishers(pubRes.data || []);
      setAuthors(authRes.data || []);
    } catch (error) { console.error("Metadata error", error); }
  };

  useEffect(() => { fetchBooks(); }, [page]);
  useEffect(() => { fetchMetadata(); }, []);

  // --- XỬ LÝ FORM ---
  const handleCreate = () => {
    setModalMode("create"); setActiveTab("general");
    setAuthorSearch(""); setShowAuthorDropdown(false);
    setFormData({
      title: "", description: "", publisherYear: new Date().getFullYear(),
      publisherId: "", authorIds: [], categoryIds: [],
      variants: [{ price: 0, quantity: 0, sold: 0, status: "AVAILABLE", isbn: "", imageUrls: [] }]
    });
    setShowDrawer(true);
  };

  const handleEdit = (book) => {
    setModalMode("edit"); setActiveTab("general"); setSelectedBook(book);
    setAuthorSearch(""); setShowAuthorDropdown(false);

    const mappedVariants = (book.variants || []).map(v => ({
      id: v.id, price: v.price || 0, quantity: v.quantity || 0, sold: v.sold || 0,
      status: v.status || "AVAILABLE", isbn: v.isbn || "", imageUrls: v.imageUrls || []
    }));

    setFormData({
      title: book.title,
      description: book.description || "",
      publisherYear: book.publisherYear || new Date().getFullYear(),
      publisherId: book.publisherId || "",
      authorIds: book.authorIds || (book.authors ? book.authors.map(a => a.id) : []),
      categoryIds: book.categoryIds || [],
      variants: mappedVariants.length > 0 ? mappedVariants : [{ price: 0, quantity: 0, status: "AVAILABLE", imageUrls: [] }]
    });
    setShowDrawer(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === "create") {
        await axiosClient.post("/books", formData);
        toast.success("Thêm sách mới thành công!");
      } else {
        await axiosClient.put(`/books/${selectedBook.id}`, formData);
        toast.success("Cập nhật sách thành công!");
      }
      setShowDrawer(false);
      fetchBooks();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi lưu dữ liệu");
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Xóa sách này?',
      text: "Hành động này không thể hoàn tác!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Xóa ngay',
      cancelButtonText: 'Hủy'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosClient.delete(`/books/${id}`);
          Swal.fire('Đã xóa!', '', 'success');
          fetchBooks();
        } catch (e) { toast.error("Không thể xóa sách này."); }
      }
    })
  };

  // --- LOGIC XỬ LÝ BIẾN THỂ & UPLOAD ẢNH ---
  const updateVariant = (idx, field, val) => {
    const newVars = [...formData.variants];
    newVars[idx][field] = val;
    setFormData({ ...formData, variants: newVars });
  };

  const handleFileUpload = async (e, variantIndex) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    // Giả lập preview ảnh
    const newImageUrls = files.map(file => URL.createObjectURL(file));
    const currentVariant = formData.variants[variantIndex];
    const updatedImages = [...(currentVariant.imageUrls || []), ...newImageUrls];
    updateVariant(variantIndex, 'imageUrls', updatedImages);
    e.target.value = null;
    toast.success(`Đã thêm ${files.length} ảnh mới`);
  };

  // --- LOGIC PHÂN TRANG (Render số trang) ---
  const renderPageNumbers = () => {
    const pageNumbers = [];
    let startPage = Math.max(0, page - 2);
    let endPage = Math.min(totalPages - 1, page + 2);

    if (endPage - startPage < 4) {
      if (startPage === 0) endPage = Math.min(totalPages - 1, 4);
      else if (endPage === totalPages - 1) startPage = Math.max(0, totalPages - 5);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button key={i} className={`page-btn ${page === i ? 'active' : ''}`} onClick={() => setPage(i)}>{i + 1}</button>
      );
    }
    return pageNumbers;
  };

  // Logic xử lý nhảy trang
  const handleJumpPage = () => {
    const p = parseInt(jumpPage);
    if (p >= 1 && p <= totalPages) {
      setPage(p - 1);
      setJumpPage("");
    } else {
      toast.error(`Trang không hợp lệ! (1 - ${totalPages})`);
    }
  };

  // Tính toán thống kê Header
  const totalStock = books.reduce((acc, b) => acc + (b.variants?.reduce((vAcc, v) => vAcc + v.quantity, 0) || 0), 0);
  const lowStockCount = books.filter(b => b.variants?.some(v => v.quantity < 5)).length;

  return (
    <div className="book-admin-page">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="admin-header-card">
        <IoLibrary className="header-bg-decoration" />
        <div className="header-content">
          <h1 className="header-title">Quản Lý Sách Elite</h1>
          <div className="header-stats-row">
            <div className="stat-item"><IoLibrary color="var(--primary)" /> <span>Đầu sách: <strong>{books.length}</strong></span></div>
            <div className="stat-item"><IoStatsChart color="#10b981" /> <span>Tồn kho: <strong>{totalStock}</strong></span></div>
            <div className="stat-item"><IoAlertCircle color="#f59e0b" /> <span>Sắp hết: <strong>{lowStockCount}</strong></span></div>
          </div>
        </div>
        <button className="btn-create-glow" onClick={handleCreate}><IoAdd size={24} /> <span>Thêm Sách Mới</span></button>
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <select className="search-select" value={searchType} onChange={(e) => setSearchType(e.target.value)}>
          <option value="title">Tên sách</option>
          <option value="author">Tác giả</option>
        </select>
        <div style={{ position: 'relative', flex: 1 }}>
          <input className="search-input" placeholder="Tìm kiếm sách, tác giả, ISBN..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchBooks()} />
        </div>
        <button className="btn-search" onClick={() => { setPage(0); fetchBooks(); }}><IoSearch size={20} /></button>
      </div>

      {/* Table */}
      <div className="books-table-container">
        {loading ? <div className="loading-container"><div className="spinner"></div><span>Đang tải dữ liệu...</span></div> : books.length > 0 ? (
          <table className="books-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>#ID</th>
                <th style={{ width: '40%' }}>Thông tin sách</th>
                <th>Nhà Xuất Bản</th>
                <th>Giá & Kho</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => {
                const prices = book.variants?.map(v => v.price) || [];
                const priceDisplay = prices.length ? (Math.min(...prices) === Math.max(...prices) ? formatCurrency(Math.min(...prices)) : `${formatCurrency(Math.min(...prices))} - ${formatCurrency(Math.max(...prices))}`) : '0 đ';

                return (
                  <tr key={book.id}>
                    <td style={{ fontWeight: '700', color: 'var(--text-secondary)' }}>#{book.id}</td>
                    <td className="book-title">
                      <strong>{book.title}</strong>
                      <div className="book-meta"><IoBookOutline /> {book.authorNames?.join(", ") || "Chưa có tác giả"}</div>
                    </td>
                    <td><div style={{ fontWeight: 600 }}>{book.publisherName}</div><small style={{ color: 'var(--text-secondary)' }}>Năm: {book.publisherYear}</small></td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4 }}><IoPricetagsOutline size={14} /> {priceDisplay}</div>
                      <small style={{ color: 'var(--text-secondary)' }}>{book.variants?.length || 0} phiên bản</small>
                    </td>
                    <td>
                      {book.variants && book.variants.length > 0 ? (
                        <span className={`status-badge ${book.variants[0].status.toLowerCase()}`}>{book.variants[0].status === 'AVAILABLE' ? 'Sẵn hàng' : 'Hết hàng'}</span>
                      ) : <span className="status-badge">---</span>}
                    </td>
                    <td>
                      <div className="actions">
                        <button className="btn-icon btn-edit" onClick={() => handleEdit(book)} title="Sửa"><IoCreate size={20} /></button>
                        <button className="btn-icon btn-delete" onClick={() => handleDelete(book.id)} title="Xóa"><IoTrash size={20} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="empty-state"><IoCubeOutline size={64} style={{ color: '#cbd5e1', marginBottom: '1rem' }} /><div>Không tìm thấy dữ liệu</div></div>
        )}
      </div>

      {/* --- PAGINATION (Cập nhật 3 cột: Thông tin - Nút - Ô nhập) --- */}
      {!loading && totalPages > 0 && (
        <div className="pagination-wrapper">
          {/* CỘT TRÁI: Thông tin trang */}
          <div className="pagination-info">
            Trang <strong>{page + 1}</strong> / {totalPages}
          </div>

          {/* CỘT GIỮA: Các nút điều hướng */}
          <div className="pagination-controls">
            <button className="page-btn" disabled={page === 0} onClick={() => setPage(0)} title="Trang đầu"><IoPlaySkipBack /></button>
            <button className="page-btn" disabled={page === 0} onClick={() => setPage(p => p - 1)} title="Trang trước"><IoChevronBack /></button>
            
            {renderPageNumbers()}
            
            <button className="page-btn" disabled={page === totalPages - 1} onClick={() => setPage(p => p + 1)} title="Trang sau"><IoChevronForward /></button>
            <button className="page-btn" disabled={page === totalPages - 1} onClick={() => setPage(totalPages - 1)} title="Trang cuối"><IoPlaySkipForward /></button>
          </div>

          {/* CỘT PHẢI: Ô nhập số trang */}
          <div className="pagination-jump">
            <span>Đến trang:</span>
            <input 
              className="page-input" 
              type="number" 
              min="1" 
              max={totalPages}
              value={jumpPage}
              onChange={(e) => setJumpPage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJumpPage()}
            />
          </div>
        </div>
      )}

      {/* Drawer */}
      <div className={`drawer-overlay ${showDrawer ? 'open' : ''}`} onClick={() => setShowDrawer(false)}>
        <div className="drawer-panel" onClick={e => e.stopPropagation()}>
          <div className="drawer-header">
            <h2>{modalMode === 'create' ? 'Thêm Sách Mới' : 'Cập Nhật Sách'}</h2>
            <button className="btn-icon" onClick={() => setShowDrawer(false)} style={{ width: 36, height: 36, background: '#f1f5f9' }}><IoClose size={20} /></button>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="drawer-body">
              <div className="form-tabs">
                <button type="button" className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>Thông tin chung</button>
                <button type="button" className={`tab-btn ${activeTab === 'variants' ? 'active' : ''}`} onClick={() => setActiveTab('variants')}>Phiên bản ({formData.variants.length})</button>
              </div>

              {activeTab === 'general' && (
                <div className="tab-content fade-in">
                  <div className="form-group"><label>Tên sách</label><input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} /></div>
                  <div className="form-group"><label>Mô tả ngắn</label><textarea rows="4" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} /></div>
                  <div style={{display:'flex', gap:'1rem'}}>
                    <div className="form-group" style={{flex:1}}><label>Năm XB</label><input type="number" value={formData.publisherYear} onChange={e => setFormData({ ...formData, publisherYear: e.target.value })} /></div>
                    <div className="form-group" style={{flex:1}}><label>Nhà XB</label><select value={formData.publisherId} onChange={e => setFormData({ ...formData, publisherId: e.target.value })}>{publishers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                  </div>
                  {/* Combobox Author */}
                  <div className="form-group">
                     <label>Tác giả</label>
                     <div className="combobox-wrapper">
                       <div className="combobox-input-wrapper">
                         <IoSearch className="combobox-icon"/>
                         <input className="combobox-input" placeholder="Tìm tác giả..." value={authorSearch} onChange={e=>{setAuthorSearch(e.target.value);setShowAuthorDropdown(true)}} onFocus={()=>setShowAuthorDropdown(true)}/>
                       </div>
                       {showAuthorDropdown && <div className="combobox-dropdown show">
                          {authors.filter(a=>a.name.toLowerCase().includes(authorSearch.toLowerCase()) && !formData.authorIds.includes(a.id)).map(a=>(
                            <div key={a.id} className="combobox-item" onClick={()=>{setFormData({...formData, authorIds:[...formData.authorIds, a.id]}); setAuthorSearch(""); setShowAuthorDropdown(false);}}>
                               {a.name}
                            </div>
                          ))}
                       </div>}
                     </div>
                     <div className="selected-tags-wrapper">
                        {formData.authorIds.map(id => {
                           const a = authors.find(au=>au.id===id);
                           return a ? <span key={id} className="tag-badge">{a.name} <button type="button" className="tag-remove-btn" onClick={()=>setFormData({...formData, authorIds:formData.authorIds.filter(i=>i!==id)})}><IoClose/></button></span> : null;
                        })}
                     </div>
                     {showAuthorDropdown && <div style={{position:'fixed',inset:0,zIndex:40}} onClick={()=>setShowAuthorDropdown(false)}></div>}
                  </div>
                </div>
              )}

              {activeTab === 'variants' && (
                <div className="tab-content fade-in">
                  {formData.variants.map((v, idx) => (
                    <div key={idx} className="variant-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h4 style={{ margin: 0, color: 'var(--primary)' }}>Phiên bản #{idx + 1}</h4>
                        {idx > 0 && <button type="button" style={{color:'var(--red-delete)', background:'none', border:'none', cursor:'pointer', fontWeight:600}} onClick={() => {
                          const nv = [...formData.variants]; nv.splice(idx, 1); setFormData({ ...formData, variants: nv });
                        }}>Xóa bỏ</button>}
                      </div>
                      
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <div className="form-group" style={{ flex: 1 }}><label>Giá bán</label><input type="number" value={v.price} onChange={e => updateVariant(idx, 'price', e.target.value)} /></div>
                        <div className="form-group" style={{ flex: 1 }}><label>Kho</label><input type="number" value={v.quantity} onChange={e => updateVariant(idx, 'quantity', e.target.value)} /></div>
                      </div>

                      {/* --- KHU VỰC UPLOAD FILE --- */}
                      <div className="variant-images-section" style={{marginTop:'1rem'}}>
                        <label style={{fontWeight:600, marginBottom:'0.5rem', display:'block'}}>Hình ảnh minh họa</label>
                        <input type="file" id={`file-upload-${idx}`} multiple accept="image/*" style={{display:'none'}} onChange={(e) => handleFileUpload(e, idx)} />
                        <label htmlFor={`file-upload-${idx}`} className="upload-zone">
                          <IoCloudUpload size={40} className="upload-icon-large" />
                          <div><div className="upload-text">Nhấn để tải ảnh lên</div><div className="upload-subtext">Hỗ trợ JPG, PNG (Tối đa 5MB)</div></div>
                        </label>
                        <div className="img-preview-list">
                          {v.imageUrls && v.imageUrls.map((url, imgIdx) => (
                            <div key={imgIdx} className="img-preview-item">
                              <img src={url} alt="preview" onError={(e) => e.target.src = "https://placehold.co/100x130?text=Error"} />
                              <button type="button" className="btn-remove-img" onClick={() => {
                                  updateVariant(idx, 'imageUrls', v.imageUrls.filter((_, i) => i !== imgIdx));
                                }}><IoClose size={14} /></button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                  <button type="button" className="btn-secondary" style={{ width: '100%', borderStyle: 'dashed', borderColor: 'var(--primary)', color: 'var(--primary)' }} onClick={() => {
                    setFormData({ ...formData, variants: [...formData.variants, { price: 0, quantity: 0, status: 'AVAILABLE', imageUrls: [] }] })
                  }}><IoAdd size={18} /> Thêm phiên bản khác</button>
                </div>
              )}
            </div>
            <div className="drawer-footer">
              <button type="button" className="btn-secondary" onClick={() => setShowDrawer(false)}>Đóng</button>
              <button type="submit" className="btn-primary">Lưu thông tin</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}