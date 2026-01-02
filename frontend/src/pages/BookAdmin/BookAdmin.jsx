import { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";

// Import icons
import {
  IoAdd, IoSearch, IoClose, IoTrash, IoCreate,
  IoCloudUpload, IoBookOutline,
  IoChevronBack, IoChevronForward,
  IoPlaySkipBack, IoPlaySkipForward,
  IoCubeOutline, IoPricetagsOutline,
  IoLibrary
} from "react-icons/io5";

import "./BookAdmin.css";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Helper để lấy ngày hiện tại hiển thị ở Header
const getTodayString = () => {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return new Date().toLocaleDateString('vi-VN', options);
};

// Skeleton Loader
const SkeletonRow = () => (
  <tr className="animate-pulse" style={{borderBottom:'none'}}>
    <td colSpan="6" style={{padding:'1rem 0'}}>
      <div style={{background:'white', borderRadius:'12px', padding:'1rem', display:'flex', alignItems:'center', boxShadow:'0 2px 4px rgba(0,0,0,0.02)'}}>
        <div style={{width:'48px', height:'72px', background:'#f1f5f9', borderRadius:'4px', marginRight:'1rem'}}></div>
        <div style={{flex:1}}>
          <div style={{height:'16px', background:'#f1f5f9', borderRadius:'4px', width:'30%', marginBottom:'8px'}}></div>
          <div style={{height:'12px', background:'#f1f5f9', borderRadius:'4px', width:'20%'}}></div>
        </div>
      </div>
    </td>
  </tr>
);

export default function BookAdmin() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("title");

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [showDrawer, setShowDrawer] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [modalMode, setModalMode] = useState("create");
  const [selectedBook, setSelectedBook] = useState(null);

  const [authorSearch, setAuthorSearch] = useState(""); 
  const [showAuthorDropdown, setShowAuthorDropdown] = useState(false);

  const [formData, setFormData] = useState({
    title: "", description: "", publisherYear: new Date().getFullYear(),
    publisherId: "", authorIds: [], categoryIds: [],
    variants: []
  });

  const [publishers, setPublishers] = useState([]);
  const [authors, setAuthors] = useState([]);

  // Fetch logic
  const fetchBooks = async () => {
    try {
      setLoading(true);
      let url = `/books?page=${page}&size=6&sortBy=id`;
      if (searchTerm) url = `/books/search?${searchType}=${searchTerm}&page=${page}&size=6`;

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
      const [pubRes, authRes] = await Promise.all([axiosClient.get("/publishers"), axiosClient.get("/authors")]);
      setPublishers(pubRes.data || []); setAuthors(authRes.data || []);
    } catch (error) { console.error("Metadata error", error); }
  };

  useEffect(() => { fetchBooks(); }, [page]);
  useEffect(() => { fetchMetadata(); }, []);

  // Form Handlers
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
      title: book.title, description: book.description || "",
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
    const errors = [];
    if (!formData.title?.trim()) errors.push("Tiêu đề sách không được để trống");
    if (!formData.variants || formData.variants.length === 0) errors.push("Phải có ít nhất 1 phiên bản");
    
    if (errors.length > 0) {
      toast.error(<div><strong>Kiểm tra lại:</strong><ul style={{margin:'5px 0 0 15px'}}>{errors.map((e,i)=><li key={i}>{e}</li>)}</ul></div>);
      return;
    }
    
    const cleanedData = {
      ...formData,
      publisherId: formData.publisherId || null,
      variants: formData.variants.map(v => ({ ...v, isbn: v.isbn || null }))
    };
    
    try {
      if (modalMode === "create") {
        await axiosClient.post("/books", cleanedData);
        toast.success("Thêm sách mới thành công!");
      } else {
        await axiosClient.put(`/books/${selectedBook.id}`, cleanedData);
        toast.success("Cập nhật thành công!");
      }
      setShowDrawer(false); fetchBooks();
    } catch (error) { toast.error(error.response?.data?.message || "Lỗi lưu dữ liệu"); }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Xác nhận xóa?', text: "Hành động này không thể hoàn tác!", icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#64748b',
      confirmButtonText: 'Xóa ngay', cancelButtonText: 'Hủy'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosClient.delete(`/books/${id}`);
          Swal.fire('Đã xóa!', 'Sách đã được xóa', 'success'); fetchBooks();
        } catch (error) { Swal.fire('Lỗi', 'Không thể xóa sách này', 'error'); }
      }
    })
  };

  const updateVariant = (idx, field, val) => {
    const newVars = [...formData.variants]; newVars[idx][field] = val;
    setFormData({ ...formData, variants: newVars });
  };

  const handleUpload = async (e, variantIndex, isCover) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const loadingToast = toast.loading('Đang tải ảnh lên...');
    try {
      const urls = await Promise.all(files.map(async (file) => {
        const fd = new FormData(); fd.append('file', file);
        const res = await axiosClient.post('/books/upload-image', fd);
        return res.data.url;
      }));
      
      const current = formData.variants[variantIndex];
      let newImages = [];
      if (isCover) {
        newImages = [urls[0], ...(current.imageUrls || []).slice(1)];
      } else {
        const cover = (current.imageUrls && current.imageUrls[0]) || null;
        newImages = cover ? [cover, ...(current.imageUrls || []).slice(1), ...urls] : [...urls];
      }
      updateVariant(variantIndex, 'imageUrls', newImages);
      toast.success('Xong!', { id: loadingToast });
    } catch (error) { toast.error('Lỗi upload', { id: loadingToast }); }
    e.target.value = null;
  };

  // Pagination Helper
  const renderPageNumbers = () => {
    const pageNumbers = [];
    let start = Math.max(0, page - 2), end = Math.min(totalPages - 1, page + 2);
    if (end - start < 4) { if (start === 0) end = Math.min(totalPages - 1, 4); else start = Math.max(0, totalPages - 5); }
    for (let i = start; i <= end; i++) pageNumbers.push(<button key={i} className={`page-btn ${page === i ? 'active' : ''}`} onClick={() => setPage(i)}>{i + 1}</button>);
    return pageNumbers;
  };

  const totalStock = books.reduce((acc, b) => acc + (b.variants?.reduce((v, i) => v + i.quantity, 0) || 0), 0);

  return (
    <div className="book-admin-page">
      <Toaster position="top-center" reverseOrder={false} />

      {/* --- NEW MODERN HEADER --- */}
      <div className="admin-header-card">
        <div className="header-content">
          <h1 className="header-title">Quản Lý Sách Elite</h1>
          <div className="header-subtitle">
            <span style={{width:'8px', height:'8px', background:'var(--success-text)', borderRadius:'50%', display:'inline-block'}}></span>
            {getTodayString()}
          </div>
        </div>

        <div className="header-actions">
          {/* Nhóm Thống kê (Stats) */}
          <div className="header-stats-group">
            <div className="stat-box blue">
              <div className="stat-icon-wrapper"><IoLibrary /></div>
              <div className="stat-info"><span className="stat-label">Đầu sách</span><span className="stat-value">{books.length}</span></div>
            </div>
            <div className="stat-box green">
              <div className="stat-icon-wrapper"><IoCubeOutline /></div>
              <div className="stat-info"><span className="stat-label">Tổng Kho</span><span className="stat-value">{totalStock}</span></div>
            </div>
          </div>

          <button className="btn-create-glow" onClick={handleCreate}>
            <div style={{background:'white', color:'var(--primary)', borderRadius:'50%', padding:'4px', display:'flex'}}><IoAdd size={20} /></div>
            <span>Thêm Mới</span>
          </button>
        </div>
      </div>

      {/* --- FILTER BAR --- */}
      <div style={{display:'flex', justifyContent:'center'}}>
        <div className="search-section">
          <select className="search-select" value={searchType} onChange={(e) => setSearchType(e.target.value)}>
            <option value="title">Tên sách</option>
            <option value="author">Tác giả</option>
          </select>
          <input className="search-input" placeholder="Tìm kiếm nhanh..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchBooks()} />
          <button className="btn-search" onClick={() => { setPage(0); fetchBooks(); }}><IoSearch size={20} /></button>
        </div>
      </div>

      {/* --- TABLE (CARD STYLE) --- */}
      <div className="books-table-container">
        <table className="books-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>ID</th>
              <th style={{ width: '35%' }}>Sách & Tác giả</th>
              <th style={{ width: '20%' }}>Xuất Bản</th>
              <th style={{ width: '20%' }}>Giá & Kho</th>
              <th style={{ width: '15%' }}>Trạng thái</th>
              <th style={{ textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? [...Array(5)].map((_, i) => <SkeletonRow key={i} />) : books.length > 0 ? (
              books.map((book) => {
                const prices = book.variants?.map(v => v.price) || [];
                const priceDisplay = prices.length ? (Math.min(...prices) === Math.max(...prices) ? formatCurrency(Math.min(...prices)) : `${formatCurrency(Math.min(...prices))} +`) : '0 đ';
                const coverImg = book.variants?.[0]?.imageUrls?.[0] || "https://placehold.co/48x72?text=No+Img";

                return (
                  <tr key={book.id}>
                    <td style={{ fontWeight: '800', color: '#cbd5e1' }}>#{book.id}</td>
                    <td>
                      <div style={{display:'flex', gap:'1.25rem', alignItems:'center'}}>
                         <div className="book-cover-wrapper">
                            <img src={coverImg} className="book-cover-img" alt="" onError={(e) => e.target.src = "https://placehold.co/48x72?text=Error"} />
                         </div>
                         <div>
                            <div className="book-title"><strong>{book.title}</strong></div>
                            <div className="book-meta"><IoBookOutline /> {book.authorNames?.join(", ") || "Chưa cập nhật"}</div>
                         </div>
                      </div>
                    </td>
                    <td>
                      <div style={{fontWeight: 600, color:'var(--text-main)'}}>{book.publisherName}</div>
                      <div style={{fontSize:'0.8rem', color:'var(--text-light)'}}>{book.publisherYear}</div>
                    </td>
                    <td>
                      <div style={{fontWeight: 700, color: 'var(--primary)', display:'flex', alignItems:'center', gap:4}}>
                        <IoPricetagsOutline /> {priceDisplay}
                      </div>
                      <div style={{fontSize:'0.8rem', color:'var(--text-secondary)', marginTop:'2px'}}>{book.variants?.length || 0} phiên bản</div>
                    </td>
                    <td>
                      {(() => {
                        const v = book.variants?.[0];
                        const isAvail = v?.status === 'AVAILABLE' && v?.quantity > 0;
                        return <span className={`status-badge ${isAvail ? 'available' : 'out_of_stock'}`}>{isAvail ? 'Sẵn hàng' : 'Hết hàng'}</span>
                      })()}
                    </td>
                    <td>
                      <div className="actions">
                        <button className="btn-icon btn-edit" onClick={() => handleEdit(book)}><IoCreate size={18} /></button>
                        <button className="btn-icon btn-delete" onClick={() => handleDelete(book.id)}><IoTrash size={18} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr><td colSpan="6"><div style={{textAlign:'center', padding:'3rem', color:'#cbd5e1'}}><IoCubeOutline size={64}/><p>Chưa có dữ liệu</p></div></td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- PAGINATION (FIXED) --- */}
      {!loading && totalPages > 0 && (
        <div className="pagination-wrapper">
          <div style={{fontSize:'0.9rem', color:'var(--text-secondary)'}}>Trang <strong>{page + 1}</strong> / {totalPages}</div>
          <div style={{display:'flex', gap:'5px'}}>
            <button className="page-btn" disabled={page===0} onClick={()=>setPage(0)} title="Trang đầu"><IoPlaySkipBack/></button>
            <button className="page-btn" disabled={page===0} onClick={()=>setPage(p=>p-1)} title="Trang trước"><IoChevronBack/></button>
            {renderPageNumbers()}
            <button className="page-btn" disabled={page===totalPages-1} onClick={()=>setPage(p=>p+1)} title="Trang sau"><IoChevronForward/></button>
            <button className="page-btn" disabled={page===totalPages-1} onClick={()=>setPage(totalPages-1)} title="Trang cuối"><IoPlaySkipForward/></button>
          </div>
          <input 
            type="number" className="page-btn" 
            style={{width:'50px', textAlign:'center', border:'1px solid #e2e8f0'}} 
            placeholder="Go" 
            onKeyDown={(e) => { if(e.key==='Enter') { const p = parseInt(e.target.value); if(p>=1 && p<=totalPages) setPage(p-1); } }} 
          />
        </div>
      )}

      {/* --- DRAWER FORM --- */}
      <div className={`drawer-overlay ${showDrawer ? 'open' : ''}`} onClick={() => setShowDrawer(false)}>
        <div className="drawer-panel" onClick={e => e.stopPropagation()}>
          <div className="drawer-header">
            <h2 style={{margin:0, fontSize:'1.4rem', color:'var(--text-main)'}}>{modalMode === 'create' ? 'Thêm Sách Mới' : 'Cập Nhật Sách'}</h2>
            <button className="btn-icon" onClick={() => setShowDrawer(false)} style={{background:'#f1f5f9'}}><IoClose size={20} /></button>
          </div>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="drawer-body">
              <div className="form-tabs">
                <button type="button" className={`tab-btn ${activeTab==='general'?'active':''}`} onClick={()=>setActiveTab('general')}>Thông tin chung</button>
                <button type="button" className={`tab-btn ${activeTab==='variants'?'active':''}`} onClick={()=>setActiveTab('variants')}>Phiên bản ({formData.variants.length})</button>
              </div>

              {activeTab === 'general' && (
                <div className="animate-fade-in">
                  <div className="form-group"><label>Tên sách <span style={{color:'red'}}>*</span></label><input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} /></div>
                  <div className="form-group"><label>Mô tả ngắn</label><textarea rows="4" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} /></div>
                  <div style={{display:'flex', gap:'1rem'}}>
                    <div className="form-group" style={{flex:1}}><label>Năm XB</label><input type="number" value={formData.publisherYear} onChange={e => setFormData({ ...formData, publisherYear: e.target.value })} /></div>
                    <div className="form-group" style={{flex:1}}><label>Nhà XB</label><select value={formData.publisherId} onChange={e => setFormData({ ...formData, publisherId: e.target.value })}>{publishers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                  </div>
                  
                  <div className="form-group" style={{position:'relative'}}>
                     <label>Tác giả</label>
                     <div style={{display:'flex', alignItems:'center', border:'1px solid var(--border-color)', borderRadius:'8px', background:'#f8fafc', padding:'0 10px'}}>
                        <IoSearch color="#94a3b8"/>
                        <input style={{border:'none', background:'transparent', boxShadow:'none'}} placeholder="Tìm tác giả..." value={authorSearch} onChange={e=>{setAuthorSearch(e.target.value);setShowAuthorDropdown(true)}} onFocus={()=>setShowAuthorDropdown(true)}/>
                     </div>
                     {showAuthorDropdown && <div style={{position:'absolute', width:'100%', background:'white', border:'1px solid #e2e8f0', zIndex:50, maxHeight:'200px', overflowY:'auto', borderRadius:'8px', boxShadow:'0 10px 15px -3px rgba(0,0,0,0.1)'}}>
                        {authors.filter(a=>a.name.toLowerCase().includes(authorSearch.toLowerCase()) && !formData.authorIds.includes(a.id)).map(a=>(
                          <div key={a.id} style={{padding:'10px', cursor:'pointer', borderBottom:'1px solid #f1f5f9'}} onClick={()=>{setFormData({...formData, authorIds:[...formData.authorIds, a.id]}); setAuthorSearch(""); setShowAuthorDropdown(false);}} className="hover:bg-slate-50">{a.name}</div>
                        ))}
                     </div>}
                     <div style={{display:'flex', flexWrap:'wrap', gap:'8px', marginTop:'10px'}}>
                        {formData.authorIds.map(id => {
                           const a = authors.find(au=>au.id===id);
                           return a ? <span key={id} className="tag-badge" style={{padding:'4px 10px', borderRadius:'6px', display:'flex', alignItems:'center', gap:'5px', fontSize:'0.85rem'}}>{a.name} <IoClose style={{cursor:'pointer'}} onClick={()=>setFormData({...formData, authorIds:formData.authorIds.filter(i=>i!==id)})}/></span> : null;
                        })}
                     </div>
                     {showAuthorDropdown && <div style={{position:'fixed',inset:0,zIndex:40}} onClick={()=>setShowAuthorDropdown(false)}></div>}
                  </div>
                </div>
              )}

              {activeTab === 'variants' && (
                <div className="animate-fade-in">
                  {formData.variants.map((v, idx) => (
                    <div key={idx} style={{background:'#fff', padding:'1.5rem', borderRadius:'12px', border:'1px solid #e2e8f0', marginBottom:'1.5rem', boxShadow:'0 2px 5px rgba(0,0,0,0.02)'}}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h4 style={{ margin: 0, color: 'var(--primary)' }}>Phiên bản #{idx + 1}</h4>
                        {idx > 0 && <button type="button" style={{color:'#ef4444', background:'none', border:'none', cursor:'pointer', fontWeight:600}} onClick={() => {
                          const nv = [...formData.variants]; nv.splice(idx, 1); setFormData({ ...formData, variants: nv });
                        }}>Xóa</button>}
                      </div>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <div className="form-group" style={{ flex: 1 }}><label>Giá bán</label><input type="number" value={v.price} onChange={e => updateVariant(idx, 'price', e.target.value)} /></div>
                        <div className="form-group" style={{ flex: 1 }}><label>Kho</label><input type="number" value={v.quantity} onChange={e => updateVariant(idx, 'quantity', e.target.value)} /></div>
                      </div>
                      <div className="form-group">
                        <label>Ảnh bìa</label>
                        <input type="file" id={`cover-${idx}`} accept="image/*" hidden onChange={(e) => handleUpload(e, idx, true)} />
                        {v.imageUrls && v.imageUrls[0] ? (
                          <div style={{position:'relative', width:'100px', height:'140px'}}>
                            <img src={v.imageUrls[0]} alt="cover" style={{width:'100%', height:'100%', objectFit:'cover', borderRadius:'8px', boxShadow:'var(--shadow-book)'}} />
                            <label htmlFor={`cover-${idx}`} style={{position:'absolute', bottom:'-10px', left:'50%', transform:'translateX(-50%)', background:'black', color:'white', fontSize:'10px', padding:'4px 8px', borderRadius:'10px', cursor:'pointer', whiteSpace:'nowrap'}}>Thay đổi</label>
                          </div>
                        ) : (
                          <label htmlFor={`cover-${idx}`} className="upload-zone"><IoCloudUpload size={24} style={{marginBottom:'5px', color:'#94a3b8'}}/><div>Tải ảnh bìa</div></label>
                        )}
                      </div>
                      <div className="form-group">
                         <label>Ảnh chi tiết</label>
                         <input type="file" id={`gallery-${idx}`} multiple accept="image/*" hidden onChange={(e) => handleUpload(e, idx, false)} />
                         <div style={{display:'flex', gap:'10px', overflowX:'auto', paddingBottom:'5px'}}>
                           <label htmlFor={`gallery-${idx}`} style={{width:'60px', height:'80px', border:'1px dashed #cbd5e1', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0}}><IoAdd size={24} color="#94a3b8"/></label>
                           {v.imageUrls && v.imageUrls.slice(1).map((url, imgIdx) => (
                             <div key={imgIdx} style={{position:'relative', width:'60px', height:'80px', flexShrink:0}}>
                               <img src={url} alt="" style={{width:'100%', height:'100%', objectFit:'cover', borderRadius:'6px'}} />
                               <div onClick={()=>{const newImgs = v.imageUrls.filter((_, i) => i !== imgIdx + 1); updateVariant(idx, 'imageUrls', newImgs);}} style={{position:'absolute', top:-5, right:-5, background:'red', color:'white', borderRadius:'50%', width:'16px', height:'16px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', cursor:'pointer'}}>x</div>
                             </div>
                           ))}
                         </div>
                      </div>
                    </div>
                  ))}
                  <button type="button" className="btn-secondary" style={{ width: '100%', borderStyle: 'dashed' }} onClick={() => {
                    setFormData({ ...formData, variants: [...formData.variants, { price: 0, quantity: 0, status: 'AVAILABLE', imageUrls: [] }] })
                  }}>+ Thêm phiên bản</button>
                </div>
              )}
            </div>
            <div className="drawer-footer">
              <button type="button" className="btn-secondary" onClick={() => setShowDrawer(false)}>Hủy bỏ</button>
              <button type="submit" className="btn-primary">Lưu thay đổi</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}