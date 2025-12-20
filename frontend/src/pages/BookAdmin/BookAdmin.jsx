import { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
// Thư viện thông báo & Alert đẹp
import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";

// Icons
import { 
  IoAdd, IoSearch, IoClose, IoTrash, IoCreate, 
  IoCloudUpload, IoBookOutline, 
  IoChevronBack, IoChevronForward,
  IoPlaySkipBack, IoPlaySkipForward,
  IoCubeOutline 
} from "react-icons/io5";

import "./BookAdmin.css";

// Hàm format tiền tệ (VND)
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export default function BookAdmin() {
  // --- STATE QUẢN LÝ DỮ LIỆU ---
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("title");
  
  // --- STATE PHÂN TRANG ---
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [jumpPage, setJumpPage] = useState(""); 
  
  // --- STATE FORM (DRAWER) ---
  const [showDrawer, setShowDrawer] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [modalMode, setModalMode] = useState("create");
  const [selectedBook, setSelectedBook] = useState(null);
  
  // Dữ liệu Form
  const [formData, setFormData] = useState({
    title: "", description: "", publisherYear: new Date().getFullYear(),
    publisherId: "", authorIds: [], categoryIds: [],
    variants: []
  });
  
  // Dữ liệu danh mục (Dropdown)
  const [publishers, setPublishers] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);

  // --- API CALLS ---
  const fetchBooks = async () => {
    try {
      setLoading(true);
      let url = `/books?page=${page}&size=8&sortBy=id`; 
      if (searchTerm) url = `/books/search?${searchType}=${searchTerm}&page=${page}&size=8`;
      
      const response = await axiosClient.get(url);
      
      // Giả lập delay nhẹ để thấy loading (nếu mạng quá nhanh)
      // await new Promise(r => setTimeout(r, 300));

      if (response.data.content) {
        setBooks(response.data.content);
        setTotalPages(response.data.totalPages || 1);
      } else {
        setBooks([]);
        setTotalPages(0);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách sách");
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [pubRes, authRes, catRes] = await Promise.all([
        axiosClient.get("/publishers"),
        axiosClient.get("/authors"),
        axiosClient.get("/categories")
      ]);
      setPublishers(pubRes.data || []);
      setAuthors(authRes.data || []);
      setCategories(catRes.data || []);
    } catch (error) {
      console.error("Lỗi tải metadata:", error);
    }
  };

  useEffect(() => { fetchBooks(); }, [page]); // Chạy lại khi đổi trang
  useEffect(() => { fetchMetadata(); }, []);  // Chạy 1 lần đầu

  // --- HANDLERS ---

  const handleCreate = () => {
    setModalMode("create");
    setActiveTab("general");
    setFormData({
      title: "", description: "", publisherYear: new Date().getFullYear(),
      publisherId: "", authorIds: [], categoryIds: [],
      variants: [{ price: 0, quantity: 0, sold: 0, status: "AVAILABLE", isbn: "", imageUrls: [] }]
    });
    setShowDrawer(true);
  };

  const handleEdit = (book) => {
    setModalMode("edit");
    setActiveTab("general");
    setSelectedBook(book);

    // Map dữ liệu cũ vào form
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
      categoryIds: book.categoryIds || (book.categories ? book.categories.map(c => c.id) : []),
      variants: mappedVariants.length > 0 ? mappedVariants : [{
        price: 0, quantity: 0, sold: 0, status: "AVAILABLE", isbn: "", imageUrls: []
      }]
    });
    setShowDrawer(true);
  };

  const updateVariant = (idx, field, val) => {
    const newVars = [...formData.variants];
    newVars[idx][field] = val;
    setFormData({...formData, variants: newVars});
  };

  const handleUpload = async (idx, file) => {
     if (!file) return;
     try {
      const fd = new FormData(); fd.append("file", file);
      // Upload lên server
      const res = await axiosClient.post("/books/upload-image", fd, { headers: {"Content-Type": "multipart/form-data"}});
      
      const newVars = [...formData.variants];
      if(!newVars[idx].imageUrls) newVars[idx].imageUrls = [];
      newVars[idx].imageUrls.push(res.data.url); // Giả sử server trả về { url: "..." }
      
      setFormData({...formData, variants: newVars});
      toast.success("Đã tải ảnh lên xong");
    } catch(e) { 
      toast.error("Lỗi upload ảnh"); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate cơ bản
    if (formData.variants.some(v => v.price < 0 || v.quantity < 0)) {
        toast.error("Giá và số lượng không được âm!");
        return;
    }

    try {
      if (modalMode === "create") {
        await axiosClient.post("/books", formData);
        toast.success("Thêm sách mới thành công!");
      } else {
        await axiosClient.put(`/books/${selectedBook.id}`, formData);
        toast.success("Cập nhật sách thành công!");
      }
      setShowDrawer(false);
      fetchBooks(); // Load lại danh sách
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi lưu dữ liệu");
    }
  };

  // Xóa sách với SweetAlert2
  const handleDelete = (id) => {
    Swal.fire({
      title: 'Bạn có chắc chắn?',
      text: "Hành động này sẽ xóa sách vĩnh viễn và không thể hoàn tác!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Vâng, xóa nó!',
      cancelButtonText: 'Hủy bỏ'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosClient.delete(`/books/${id}`);
          Swal.fire('Đã xóa!', 'Sách đã được xóa khỏi hệ thống.', 'success');
          fetchBooks();
        } catch (e) { 
          toast.error("Không thể xóa sách này (có thể do ràng buộc đơn hàng)");
        }
      }
    })
  };

  return (
    <div className="book-admin-page">
      {/* Toast Notification Container */}
      <Toaster position="top-right" reverseOrder={false} />

      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Quản Lý Sách</h1>
          <div style={{color: 'var(--text-secondary)', marginTop: '0.5rem'}}>
            Danh sách tất cả sách trong kho
          </div>
        </div>
        <button className="btn-primary" onClick={handleCreate}>
          <IoAdd size={20} /> Thêm Sách Mới
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <select 
          className="search-select"
          value={searchType} onChange={(e) => setSearchType(e.target.value)}
        >
          <option value="title">Tên sách</option>
          <option value="isbn">ISBN</option>
          <option value="author">Tác giả</option>
        </select>
        <input
          className="search-input"
          placeholder="Nhập từ khóa tìm kiếm..."
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchBooks()}
        />
        <button className="btn-search" onClick={() => {setPage(0); fetchBooks();}}>
          <IoSearch />
        </button>
      </div>

      {/* Table Content */}
      <div className="books-table-container">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <span>Đang tải dữ liệu sách...</span>
          </div>
        ) : books.length > 0 ? (
          <table className="books-table">
            <thead>
              <tr>
                <th style={{width: '60px'}}>#ID</th>
                <th style={{width: '35%'}}>Thông tin sách</th>
                <th>Nhà Xuất Bản</th>
                <th>Giá & Phiên bản</th>
                <th>Trạng thái</th>
                <th style={{textAlign: 'right'}}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => {
                const prices = book.variants?.map(v => v.price) || [];
                const minPrice = prices.length ? Math.min(...prices) : 0;
                const maxPrice = prices.length ? Math.max(...prices) : 0;
                const priceDisplay = minPrice === maxPrice 
                  ? formatCurrency(minPrice) 
                  : `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`;

                return (
                  <tr key={book.id}>
                    <td style={{fontWeight: '600', color:'#94a3b8'}}>#{book.id}</td>
                    <td className="book-title">
                      <strong>{book.title}</strong>
                      <div className="book-meta">
                        <IoBookOutline size={14} />
                        {book.authorNames?.join(", ") || "Chưa cập nhật"}
                      </div>
                    </td>
                    <td>
                      <div style={{fontWeight:500}}>{book.publisherName}</div>
                      <small style={{color: '#94a3b8'}}>Năm: {book.publisherYear}</small>
                    </td>
                    <td>
                      <div style={{fontWeight: 600, color: 'var(--primary)'}}>
                        {priceDisplay}
                      </div>
                      <small style={{color: '#64748b'}}>
                        {book.variants?.length || 0} phiên bản
                      </small>
                    </td>
                    <td>
                       {book.variants && book.variants.length > 0 ? (
                        <span className={`status-badge ${book.variants[0].status.toLowerCase()}`}>
                          {book.variants[0].status === 'AVAILABLE' ? 'Sẵn hàng' : 'Hết hàng'}
                        </span>
                      ) : <span className="status-badge">N/A</span>}
                    </td>
                    <td>
                      <div className="actions">
                        <button className="btn-icon btn-edit" onClick={() => handleEdit(book)} title="Chỉnh sửa">
                          <IoCreate size={18} />
                        </button>
                        <button className="btn-icon btn-delete" onClick={() => handleDelete(book.id)} title="Xóa">
                          <IoTrash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          /* Empty State */
          <div className="empty-state">
            <IoCubeOutline className="empty-icon" />
            <div className="empty-text">
              <h3>Không tìm thấy cuốn sách nào</h3>
              <p>Thử tìm kiếm từ khóa khác hoặc thêm sách mới.</p>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 0 && (
        <div className="pagination-wrapper">
           <div></div>
           <div className="pagination-group">
            <button className="page-btn" disabled={page === 0} onClick={() => setPage(0)}><IoPlaySkipBack size={16} /></button>
            <button className="page-btn" disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))}><IoChevronBack size={16} /></button>
            
            {(() => {
              let start = Math.max(0, page - 2);
              let end = Math.min(totalPages - 1, page + 2);
              if (end - start < 4) {
                if (start === 0) end = Math.min(totalPages - 1, start + 4);
                else if (end === totalPages - 1) start = Math.max(0, end - 4);
              }
              const pageButtons = [];
              for (let i = start; i <= end; i++) {
                pageButtons.push(
                  <button key={i} className={`page-btn ${page === i ? 'active' : ''}`} onClick={() => setPage(i)}>{i + 1}</button>
                );
              }
              return pageButtons;
            })()}

            <button className="page-btn" disabled={page === totalPages - 1} onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}><IoChevronForward size={16} /></button>
            <button className="page-btn" disabled={page === totalPages - 1} onClick={() => setPage(totalPages - 1)}><IoPlaySkipForward size={16} /></button>
          </div>
          <div className="pagination-jump">
            <span>Đi đến trang:</span>
            <input 
              type="number" className="input-jump" min={1} max={totalPages} value={jumpPage} placeholder="..."
              onChange={(e) => setJumpPage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const p = parseInt(jumpPage);
                  if (!isNaN(p) && p >= 1 && p <= totalPages) { setPage(p - 1); setJumpPage(""); } 
                  else { toast.error(`Nhập từ 1 đến ${totalPages}`); }
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Drawer Form */}
      <div className={`drawer-overlay ${showDrawer ? 'open' : ''}`} onClick={() => setShowDrawer(false)}>
         <div className="drawer-panel" onClick={e => e.stopPropagation()}>
           <div className="drawer-header">
            <h2>{modalMode === 'create' ? 'Thêm Sách Mới' : 'Chỉnh Sửa Sách'}</h2>
            <button className="btn-icon" onClick={() => setShowDrawer(false)} style={{background:'transparent'}}>
              <IoClose size={24} />
            </button>
          </div>
           <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', height:'100%'}}>
              <div className="drawer-body">
                <div className="form-tabs">
                  <button type="button" className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>Thông tin chung</button>
                  <button type="button" className={`tab-btn ${activeTab === 'variants' ? 'active' : ''}`} onClick={() => setActiveTab('variants')}>Phiên bản & Giá</button>
                </div>
                
                {/* Tab Thông tin chung */}
                {activeTab === 'general' && (
                  <div className="tab-content">
                    <div className="form-group">
                      <label>Tên sách</label>
                      <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                    </div>
                    <div className="form-group" style={{marginTop:'1rem'}}>
                      <label>Mô tả ngắn</label>
                      <textarea rows="4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                    </div>
                    <div className="form-row" style={{marginTop:'1rem'}}>
                      <div className="form-group">
                        <label>Năm xuất bản</label>
                        <input type="number" value={formData.publisherYear} onChange={e => setFormData({...formData, publisherYear: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label>Nhà xuất bản</label>
                        <select value={formData.publisherId} onChange={e => setFormData({...formData, publisherId: e.target.value})}>
                          <option value="">-- Chọn NXB --</option>
                          {publishers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Tác giả (Giữ Ctrl chọn nhiều)</label>
                      <select multiple className="search-select" style={{width:'100%', border:'1px solid #e2e8f0', borderRadius:8}} 
                        value={formData.authorIds} 
                        onChange={e => setFormData({...formData, authorIds: Array.from(e.target.selectedOptions, o => parseInt(o.value))})}>
                        {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                    </div>
                  </div>
                )}
                
                {/* Tab Phiên bản */}
                {activeTab === 'variants' && (
                   <div className="tab-content">
                     {formData.variants.map((v, idx) => (
                       <div key={idx} className="variant-card">
                         <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                            <h4 style={{margin:0}}>Phiên bản #{idx+1}</h4>
                            {idx > 0 && <button type="button" style={{color:'red', border:'none', background:'none', cursor:'pointer'}} onClick={() => {
                              const nv = [...formData.variants]; nv.splice(idx, 1); setFormData({...formData, variants: nv});
                            }}>Xóa</button>}
                          </div>
                          
                          <div className="form-row">
                            <div className="form-group">
                              <label>Giá bán (VNĐ)</label>
                              <input type="number" min="0" value={v.price} onChange={e => updateVariant(idx, 'price', e.target.value)} />
                            </div>
                            <div className="form-group">
                              <label>Số lượng kho</label>
                              <input type="number" min="0" value={v.quantity} onChange={e => updateVariant(idx, 'quantity', e.target.value)} />
                            </div>
                          </div>

                          <div className="form-group">
                            <label>Trạng thái</label>
                            <select value={v.status} onChange={e => updateVariant(idx, 'status', e.target.value)}>
                              <option value="AVAILABLE">Sẵn hàng (Available)</option>
                              <option value="OUT_OF_STOCK">Hết hàng (Out of Stock)</option>
                            </select>
                          </div>
                          
                          <div className="form-group" style={{marginTop:'1rem'}}>
                            <label style={{cursor:'pointer', color:'var(--primary)', fontWeight:600, display:'flex', alignItems:'center', gap:4}}>
                              <IoCloudUpload /> Tải ảnh lên
                              <input type="file" hidden onChange={e => handleUpload(idx, e.target.files[0])} />
                            </label>
                            <div className="image-preview">
                              {v.imageUrls?.map((url, i) => (
                                <div key={i} className="preview-item"><img src={url} alt="" /></div>
                              ))}
                            </div>
                          </div>
                       </div>
                     ))}
                     <button type="button" className="btn-secondary" style={{width:'100%', justifyContent:'center'}} onClick={() => {
                        setFormData({...formData, variants: [...formData.variants, {price:0, quantity:0, status:'AVAILABLE', imageUrls:[]}]})
                      }}>
                        + Thêm phiên bản khác
                      </button>
                   </div>
                )}
              </div>
              <div className="drawer-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowDrawer(false)}>Hủy</button>
                <button type="submit" className="btn-primary">{modalMode === 'create' ? 'Tạo Sách' : 'Lưu Thay Đổi'}</button>
              </div>
           </form>
         </div>
      </div>
    </div>
  );
}