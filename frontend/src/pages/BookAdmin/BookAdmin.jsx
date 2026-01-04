import { useState, useEffect, useCallback } from "react";
import axiosClient from "../../api/axiosClient";
import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";

import {
  IoAdd, IoSearch, IoClose, IoTrash, IoCreate,
  IoCloudUpload, IoBookOutline,
  IoChevronBack, IoChevronForward,
  IoPlaySkipBack, IoPlaySkipForward, 
  IoCubeOutline, IoPricetagsOutline,
  IoLibrary, IoStatsChart, IoAlertCircle,
  IoFilter, IoSwapVertical,
  IoCheckmark, IoWarning,
  IoGrid, IoList, IoImage, IoEye // Thêm IoEye
} from "react-icons/io5";

import "./BookAdmin.css";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export default function BookAdmin() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("title");
  const [showFilters, setShowFilters] = useState(false);
  const [tempFilters, setTempFilters] = useState({ category: "", minPrice: "", maxPrice: "", publisher: "", status: "" });
  const [appliedFilters, setAppliedFilters] = useState({ category: "", minPrice: "", maxPrice: "", publisher: "", status: "" });
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState("desc");

  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [jumpPage, setJumpPage] = useState("");

  // View Mode
  const [viewMode, setViewMode] = useState("list");

  // Selection & Bulk Actions (Mới)
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Modal State
  const [showDrawer, setShowDrawer] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false); // Mới
  const [quickViewBook, setQuickViewBook] = useState(null); // Mới
  
  const [activeTab, setActiveTab] = useState("general");
  const [modalMode, setModalMode] = useState("create");
  const [selectedBook, setSelectedBook] = useState(null);
  
  // Form Data
  const [formData, setFormData] = useState({
    title: "", description: "", publisherYear: new Date().getFullYear(),
    publisherId: "", authorIds: [], categoryIds: [],
    variants: []
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [isDragging, setIsDragging] = useState({});
  const [authorSearch, setAuthorSearch] = useState("");
  const [showAuthorDropdown, setShowAuthorDropdown] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Metadata
  const [publishers, setPublishers] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);

  // --- Data Fetching ---
  const fetchBooks = async () => {
    try {
      setLoading(true);
      let url = `/books?page=${page}&size=8&sortBy=${sortBy}&sortOrder=${sortOrder}`;
      
      // Nếu có tìm kiếm hoặc filter giá, dùng endpoint /searchKey mới
      if (searchTerm || appliedFilters.minPrice || appliedFilters.maxPrice) {
        const params = new URLSearchParams();
        if (searchTerm) params.append('keyWord', searchTerm);
        if (appliedFilters.minPrice) params.append('minPrice', appliedFilters.minPrice);
        if (appliedFilters.maxPrice) params.append('maxPrice', appliedFilters.maxPrice);
        params.append('page', page);
        params.append('size', 8);
        params.append('sortBy', sortBy);
        params.append('sortOrder', sortOrder);
        url = `/books/searchKey?${params.toString()}`;
      }
      
      const response = await axiosClient.get(url);
      if (response.data.content) {
        setBooks(response.data.content);
        setTotalPages(response.data.totalPages || 1);
        setSelectedIds(new Set()); // Reset selection khi chuyển trang
      } else {
        setBooks([]); setTotalPages(0);
      }
    } catch (error) { toast.error("Lỗi tải danh sách"); } finally { setLoading(false); }
  };

  const fetchAllBooksForFilter = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get(`/books?page=0&size=2000&sortBy=id&sortOrder=desc`);
      if (response.data.content) {
        setBooks(response.data.content);
        setTotalPages(1);
        setSelectedIds(new Set());
      }
    } catch (error) { toast.error("Lỗi tải dữ liệu lọc"); } finally { setLoading(false); }
  };

  const fetchMetadata = async () => {
    try {
      const [pubRes, authRes, catRes] = await Promise.all([
        axiosClient.get("/publishers"), axiosClient.get("/authors"), axiosClient.get("/categories")
      ]);
      setPublishers(pubRes.data || []);
      setAuthors(authRes.data || []);
      const allCategories = catRes.data || [];
      // Demo category IDs
      const mainCategoryIds = [882, 1084, 1468, 163, 14860, 6445, 68078, 159, 14924, 276, 14862, 11021, 273, 275, 161, 68088, 271];
      setCategories(allCategories.filter(cat => mainCategoryIds.includes(cat.id)));
    } catch (error) { console.error("Lỗi metadata", error); }
  };

  const hasActiveFilters = Object.values(appliedFilters).some(val => val !== "");

  useEffect(() => {
    // Nếu có BẤT KỲ filter nào, load hết về client để filter + paginate ở client
    // Đảm bảo mỗi trang đều đủ số lượng sách
    if (hasActiveFilters) {
      fetchAllBooksForFilter(); // Load tất cả sách, filter ở client (không cần page)
    } else {
      fetchBooks(); // Load bình thường với server-side pagination (cần page)
    }
  }, [page, sortBy, sortOrder, hasActiveFilters]); // Thêm page để chuyển trang hoạt động

  // Reset page về 0 khi thay đổi sort hoặc filter
  useEffect(() => {
    setPage(0);
  }, [sortBy, sortOrder, hasActiveFilters]);

  useEffect(() => { fetchMetadata(); }, []);

  // --- Filtering Logic ---
  const getFilteredBooks = useCallback(() => {
    let filtered = [...books];
    if (appliedFilters.category) {
      const catId = parseInt(appliedFilters.category);
      filtered = filtered.filter(b => (b.categoryIds || []).map(id=>parseInt(id)).includes(catId));
    }
    if (appliedFilters.minPrice || appliedFilters.maxPrice) {
      filtered = filtered.filter(b => {
        if (!b.variants || b.variants.length === 0) return false;
        const prices = b.variants.map(v => v.price || 0);
        const min = Math.min(...prices); const max = Math.max(...prices);
        const minF = appliedFilters.minPrice ? parseFloat(appliedFilters.minPrice) : 0;
        const maxF = appliedFilters.maxPrice ? parseFloat(appliedFilters.maxPrice) : Infinity;
        return min >= minF && max <= maxF;
      });
    }
    if (appliedFilters.publisher) filtered = filtered.filter(b => b.publisherName?.toLowerCase().includes(appliedFilters.publisher.toLowerCase()));
    if (appliedFilters.status) filtered = filtered.filter(b => b.variants?.some(v => v.status === appliedFilters.status));
    
    if (hasActiveFilters) {
      filtered.sort((a, b) => {
        let aVal, bVal;
        if(sortBy === 'title') { aVal=a.title?.toLowerCase(); bVal=b.title?.toLowerCase(); }
        else if(sortBy === 'publisherYear') { aVal=a.publisherYear; bVal=b.publisherYear; }
        else { aVal=a.id; bVal=b.id; }
        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [books, appliedFilters, hasActiveFilters, sortBy, sortOrder]);

  // --- Handlers ---
  const handleCreate = () => {
    setModalMode("create"); setActiveTab("general"); setAuthorSearch(""); setCategorySearch(""); setValidationErrors({});
    setFormData({ title: "", description: "", publisherYear: new Date().getFullYear(), publisherId: "", authorIds: [], categoryIds: [], variants: [{ price: 0, quantity: 0, status: "AVAILABLE", imageUrls: [] }] });
    setShowDrawer(true);
  };

  const handleEdit = (book) => {
    setModalMode("edit"); setActiveTab("general"); setSelectedBook(book); setAuthorSearch(""); setCategorySearch(""); setValidationErrors({});
    const mappedVariants = (book.variants || []).map(v => ({
      id: v.id, price: v.price || 0, quantity: v.quantity || 0, status: v.status || "AVAILABLE", imageUrls: v.imageUrls || []
    }));
    setFormData({
      title: book.title, description: book.description || "", publisherYear: book.publisherYear || new Date().getFullYear(),
      publisherId: book.publisherId || "", authorIds: book.authorIds || (book.authors ? book.authors.map(a => a.id) : []),
      categoryIds: book.categoryIds || [],
      variants: mappedVariants.length > 0 ? mappedVariants : [{ price: 0, quantity: 0, status: "AVAILABLE", imageUrls: [] }]
    });
    setShowDrawer(true);
  };

  // Quick View Handler
  const handleQuickView = (book) => {
    setQuickViewBook(book);
    setShowQuickView(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title || formData.title.trim().length < 3) errors.title = "Tên sách tối thiểu 3 ký tự";
    if (!formData.publisherId) errors.publisherId = "Chưa chọn nhà xuất bản";
    if (formData.authorIds.length === 0) errors.authorIds = "Chọn ít nhất 1 tác giả";
    formData.variants.forEach((v, idx) => {
      if (!v.price || v.price <= 0) errors[`variant_${idx}_price`] = "Giá phải > 0";
      if (v.quantity < 0) errors[`variant_${idx}_quantity`] = "Số lượng không âm";
      if (!v.imageUrls || v.imageUrls.length === 0) errors[`variant_${idx}_images`] = "Thiếu ảnh bìa";
    });
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) { toast.error("Vui lòng kiểm tra lại form"); return; }
    try {
      if (modalMode === "create") { await axiosClient.post("/books", formData); toast.success("Thêm thành công!"); } 
      else { await axiosClient.put(`/books/${selectedBook.id}`, formData); toast.success("Cập nhật thành công!"); }
      setShowDrawer(false); 
      if (!hasActiveFilters) fetchBooks(); else fetchAllBooksForFilter();
    } catch (error) { toast.error(error.response?.data?.message || "Lỗi lưu dữ liệu"); }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Xóa sách này?', text: "Dữ liệu sẽ không thể khôi phục!", icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Xóa', cancelButtonText: 'Hủy'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try { await axiosClient.delete(`/books/${id}`); Swal.fire('Đã xóa!', '', 'success'); fetchBooks(); } 
        catch (e) { toast.error("Không thể xóa sách này"); }
      }
    });
  };

  // Bulk Actions Handlers
  const handleSelectOne = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleSelectAll = (currentBooks) => {
    if (selectedIds.size === currentBooks.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(currentBooks.map(b => b.id)));
  };

  const handleBulkDelete = () => {
    Swal.fire({
      title: `Xóa ${selectedIds.size} sách đã chọn?`, text: "Hành động này không thể hoàn tác!", icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Xóa Hết', cancelButtonText: 'Hủy'
    }).then(async (result) => {
      if (result.isConfirmed) {
        // Giả lập xóa hàng loạt bằng Promise.all vì API thường xóa theo ID lẻ
        try {
          await Promise.all(Array.from(selectedIds).map(id => axiosClient.delete(`/books/${id}`)));
          Swal.fire('Thành công', 'Đã xóa các sách đã chọn', 'success');
          setSelectedIds(new Set());
          fetchBooks();
        } catch (e) { toast.error("Có lỗi xảy ra khi xóa hàng loạt"); }
      }
    });
  };

  // --- Upload Logic ---
  const updateVariant = (idx, field, val) => {
    const newVars = [...formData.variants]; newVars[idx][field] = val;
    setFormData({ ...formData, variants: newVars });
    if(validationErrors[`variant_${idx}_${field}`]) {
        const newErrs = {...validationErrors}; delete newErrs[`variant_${idx}_${field}`]; setValidationErrors(newErrs);
    }
  };

  const handleUpload = async (files, idx, type) => {
    const loadingId = toast.loading('Đang upload...');
    try {
      const uploadedUrls = await Promise.all(Array.from(files).map(async (file) => {
         const fd = new FormData(); fd.append('file', file);
         const res = await axiosClient.post('/books/upload-image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
         return res.data.url;
      }));
      const currentUrls = formData.variants[idx].imageUrls || [];
      if (type === 'cover') updateVariant(idx, 'imageUrls', [uploadedUrls[0], ...currentUrls.slice(1)]);
      else updateVariant(idx, 'imageUrls', [...currentUrls, ...uploadedUrls]);
      toast.success('Xong!', { id: loadingId });
    } catch (e) { toast.error('Lỗi upload', { id: loadingId }); }
  };

  const handleDrag = (e, idx, type, status) => { 
    e.preventDefault(); e.stopPropagation(); 
    setIsDragging({ ...isDragging, [`${idx}_${type}`]: status }); 
  };
  const onDrop = (e, idx, type) => {
    handleDrag(e, idx, type, false);
    if(e.dataTransfer.files?.length) handleUpload(e.dataTransfer.files, idx, type);
  };

  // --- Pagination Data ---
  const displayedBooks = getFilteredBooks();
  const PAGE_SIZE = 8;
  // Khi có filter: dùng client-side pagination (đảm bảo mỗi trang đủ số lượng)
  // Không có filter: dùng server-side pagination
  const finalTotalPages = hasActiveFilters ? Math.ceil(displayedBooks.length / PAGE_SIZE) : totalPages;
  const paginatedBooks = hasActiveFilters ? displayedBooks.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE) : displayedBooks;

  const renderPageNumbers = () => {
    let pages = []; 
    let start = Math.max(0, page - 2); let end = Math.min(finalTotalPages - 1, page + 2);
    if (end - start < 4) { if (start === 0) end = Math.min(finalTotalPages - 1, 4); else if (end === finalTotalPages - 1) start = Math.max(0, finalTotalPages - 5); }
    for (let i = start; i <= end; i++) pages.push(<button key={i} className={`page-btn ${page === i ? 'active' : ''}`} onClick={() => setPage(i)}>{i + 1}</button>);
    return pages;
  };

  return (
    <div className="book-admin-page">
      <Toaster position="top-right" />

      {/* HEADER */}
      <div className="admin-header-card">
        <IoLibrary className="header-bg-decoration" />
        <div className="header-content">
          <h1 className="header-title">Quản Lý Sách Elite</h1>
          <div className="header-stats-row">
            <div className="stat-item"><IoLibrary color="var(--primary)" /> <span>Tổng: <strong>{displayedBooks.length}</strong></span></div>
            <div className="stat-item"><IoStatsChart color="#10b981" /> <span>Tồn kho: <strong>{displayedBooks.reduce((acc, b) => acc + (b.variants?.reduce((s, v) => s + v.quantity, 0) || 0), 0)}</strong></span></div>
          </div>
        </div>
        <button className="btn-create-glow" onClick={handleCreate}><IoAdd size={22} /> <span>Thêm Sách</span></button>
      </div>

      {/* TOOLBAR */}
      <div className="search-section">
        <div style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '300px' }}>
          <select className="search-select" style={{width: '110px'}} value={searchType} onChange={(e) => setSearchType(e.target.value)}>
            <option value="title">Tên sách</option>
            <option value="author">Tác giả</option>
          </select>
          <input className="search-input" placeholder="Nhập từ khóa tìm kiếm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchBooks()} />
          <button className="btn-search" onClick={() => { setPage(0); fetchBooks(); }}><IoSearch size={20} /></button>
        </div>
        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
          <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}><option value="id">Mới nhất</option><option value="title">Tên A-Z</option><option value="publisherYear">Năm XB</option></select>
          <button className="btn-icon" style={{background:'white', border:'1px solid var(--border)'}} onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}><IoSwapVertical size={18} /></button>
          <button className={`btn-filter-toggle ${showFilters ? 'active' : ''}`} onClick={() => setShowFilters(!showFilters)}><IoFilter size={18} /> Lọc {hasActiveFilters && <span className="filter-badge">!</span>}</button>
          <div className="view-mode-switch">
            <button className={`btn-view-mode ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}><IoList size={20} /></button>
            <button className={`btn-view-mode ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}><IoGrid size={18} /></button>
          </div>
        </div>
      </div>

      {/* FILTER PANEL */}
      {showFilters && (
        <div className="filter-panel">
          <div className="filter-header"><h3><IoFilter /> Bộ lọc nâng cao</h3>{hasActiveFilters && <button className="btn-clear-filters" onClick={()=>{setTempFilters({ category: "", minPrice: "", maxPrice: "", publisher: "", status: "" }); setAppliedFilters({});}} style={{background:'none', border:'none', color:'var(--red-delete)', cursor:'pointer', display:'flex', alignItems:'center', gap:'4px'}}><IoClose /> Xóa lọc</button>}</div>
          <div className="filter-grid">
            <div className="filter-item"><label>Danh mục</label><select value={tempFilters.category} onChange={(e) => setTempFilters({...tempFilters, category: e.target.value})}><option value="">Tất cả</option>{categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}</select></div>
            <div className="filter-item"><label>Giá từ</label><input type="number" placeholder="0" value={tempFilters.minPrice} onChange={(e) => setTempFilters({...tempFilters, minPrice: e.target.value})}/></div>
            <div className="filter-item"><label>Giá đến</label><input type="number" placeholder="Max" value={tempFilters.maxPrice} onChange={(e) => setTempFilters({...tempFilters, maxPrice: e.target.value})}/></div>
            <div className="filter-item"><label>Nhà XB</label><input type="text" placeholder="Tìm tên..." value={tempFilters.publisher} onChange={(e) => setTempFilters({...tempFilters, publisher: e.target.value})}/></div>
            <div className="filter-item"><label>Trạng thái</label><select value={tempFilters.status} onChange={(e) => setTempFilters({...tempFilters, status: e.target.value})}><option value="">Tất cả</option><option value="AVAILABLE">Sẵn hàng</option><option value="OUT_OF_STOCK">Hết hàng</option></select></div>
          </div>
          <div className="filter-actions"><button className="btn-create-glow" style={{padding:'0.5rem 1rem'}} onClick={()=>{setAppliedFilters({...tempFilters}); setPage(0);}}><IoCheckmark /> Áp dụng</button></div>
        </div>
      )}

      {/* CONTENT AREA */}
      <div className="books-content-area" style={{ minHeight: '400px' }}>
        {loading ? (
           <div className={viewMode === 'list' ? "skeleton-list" : "books-grid"}>
             {[...Array(8)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: viewMode==='list'?'70px':'350px', marginBottom: '10px' }}></div>
             ))}
           </div>
        ) : paginatedBooks.length > 0 ? (
          viewMode === 'list' ? (
            /* --- LIST VIEW --- */
            <div className="books-table-container">
              <table className="books-table">
                <thead>
                  <tr>
                    <th style={{width: '40px'}}><input type="checkbox" className="custom-checkbox" checked={selectedIds.size === paginatedBooks.length && paginatedBooks.length > 0} onChange={() => handleSelectAll(paginatedBooks)} /></th>
                    <th style={{ width: '60px' }}>ID</th>
                    <th style={{ width: '80px' }}>Ảnh</th>
                    <th style={{ width: '30%' }}>Thông tin sách</th>
                    <th>Nhà Xuất Bản</th>
                    <th>Giá & Kho</th>
                    <th>Trạng thái</th>
                    <th style={{ textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBooks.map((book) => {
                    const cover = book.variants?.[0]?.imageUrls?.[0];
                    const prices = book.variants?.map(v => v.price) || [];
                    const priceStr = prices.length ? formatCurrency(Math.min(...prices)) : '0 đ';
                    const isSelected = selectedIds.has(book.id);
                    return (
                      <tr key={book.id} className={isSelected ? 'selected' : ''}>
                        <td><input type="checkbox" className="custom-checkbox" checked={isSelected} onChange={() => handleSelectOne(book.id)} /></td>
                        <td style={{ fontWeight: '700', color: 'var(--text-secondary)' }}>#{book.id}</td>
                        <td>
                           <div style={{width:'48px', height:'64px', borderRadius:'6px', overflow:'hidden', border:'1px solid #e2e8f0', background:'#f8fafc', display:'flex', alignItems:'center', justifyContent:'center'}}>
                              {cover ? <img src={cover} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}}/> : <IoImage color="#cbd5e1"/>}
                           </div>
                        </td>
                        <td className="book-title">
                          <strong>{book.title}</strong>
                          <div className="book-meta"><IoBookOutline /> {book.authorNames?.join(", ")}</div>
                        </td>
                        <td><div style={{fontWeight:600}}>{book.publisherName}</div><small style={{color:'var(--text-secondary)'}}>{book.publisherYear}</small></td>
                        <td><div style={{fontWeight:700, color:'var(--primary)'}}>{priceStr}</div><small>{book.variants?.length} phiên bản</small></td>
                        <td><span className={`status-badge ${book.variants?.[0]?.status === 'AVAILABLE' ? 'available' : 'out_of_stock'}`}>{book.variants?.[0]?.status === 'AVAILABLE' ? 'Sẵn hàng' : 'Hết hàng'}</span></td>
                        <td>
                          <div className="actions" style={{display:'flex', gap:'8px', justifyContent:'flex-end'}}>
                            <button className="btn-icon btn-view" onClick={() => handleQuickView(book)} title="Xem nhanh"><IoEye size={18} /></button>
                            <button className="btn-icon btn-edit" onClick={() => handleEdit(book)}><IoCreate size={18} /></button>
                            <button className="btn-icon btn-delete" onClick={() => handleDelete(book.id)}><IoTrash size={18} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* --- GRID VIEW --- */
            <div className="books-grid">
              {paginatedBooks.map((book) => {
                 const cover = book.variants?.[0]?.imageUrls?.[0];
                 const prices = book.variants?.map(v => v.price) || [];
                 const priceStr = prices.length ? formatCurrency(Math.min(...prices)) : '0 đ';
                 return (
                  <div key={book.id} className="book-card">
                    <div className="book-card-img-wrapper">
                       {cover ? <img src={cover} alt={book.title} /> : <div style={{height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#cbd5e1'}}><IoImage size={48} /></div>}
                       <div className="card-actions-overlay">
                          <button onClick={() => handleQuickView(book)} className="btn-icon btn-view"><IoEye /></button>
                          <button onClick={() => handleEdit(book)} className="btn-icon btn-edit"><IoCreate /></button>
                          <button onClick={() => handleDelete(book.id)} className="btn-icon btn-delete"><IoTrash /></button>
                       </div>
                    </div>
                    <div className="book-card-body">
                      <div style={{fontSize:'0.75rem', color:'var(--text-secondary)', fontWeight:600, textTransform:'uppercase', marginBottom:'4px'}}>{book.categoryNames?.[0] || 'Sách'}</div>
                      <h4 style={{margin:'0 0 0.5rem 0', fontSize:'1rem', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden', height:'2.6rem'}} title={book.title}>{book.title}</h4>
                      <div style={{fontSize:'0.85rem', color:'var(--text-secondary)', marginBottom:'1rem'}}>{book.authorNames?.[0]}</div>
                      <div style={{marginTop:'auto', display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'1px solid #f1f5f9', paddingTop:'0.8rem'}}>
                         <div style={{fontWeight:'700', color:'var(--primary)', fontSize:'1.1rem'}}>{priceStr}</div>
                         <div style={{fontSize:'0.75rem', padding:'2px 8px', borderRadius:'4px', background: book.variants?.[0]?.status==='AVAILABLE'?'#dcfce7':'#f1f5f9', color: book.variants?.[0]?.status==='AVAILABLE'?'#166534':'#64748b', fontWeight:600}}>
                            {book.variants?.[0]?.status==='AVAILABLE'?'Sẵn':'Hết'}
                         </div>
                      </div>
                    </div>
                  </div>
                 )
              })}
            </div>
          )
        ) : (
          <div className="empty-state">
            <div className="empty-icon-bg"><IoCubeOutline /></div>
            <h3>Không tìm thấy dữ liệu</h3>
            <p>Vui lòng thử từ khóa khác hoặc xóa bộ lọc.</p>
          </div>
        )}
      </div>

      {/* PAGINATION */}
      {!loading && finalTotalPages > 0 && (
        <div className="pagination-wrapper">
          <div style={{fontSize:'0.9rem', color:'var(--text-secondary)'}}>Trang <strong>{page + 1}</strong> / {finalTotalPages}</div>
          <div className="pagination-controls">
            <button className="page-btn" disabled={page === 0} onClick={() => setPage(0)}><IoPlaySkipBack /></button>
            <button className="page-btn" disabled={page === 0} onClick={() => setPage(p => p - 1)}><IoChevronBack /></button>
            {renderPageNumbers()}
            <button className="page-btn" disabled={page === finalTotalPages - 1} onClick={() => setPage(p => p + 1)}><IoChevronForward /></button>
            <button className="page-btn" disabled={page === finalTotalPages - 1} onClick={() => setPage(finalTotalPages - 1)}><IoPlaySkipForward /></button>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:'8px', fontSize:'0.9rem'}}>
             Đến: <input type="number" className="search-input" style={{width:'60px', padding:'4px', textAlign:'center', minWidth:'auto'}} value={jumpPage} onChange={e=>setJumpPage(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){const p=parseInt(jumpPage); if(p>=1 && p<=finalTotalPages) setPage(p-1);}}} />
          </div>
        </div>
      )}
      
      {/* BULK ACTIONS BAR (New Feature) */}
      {selectedIds.size > 0 && (
        <div className="bulk-action-bar">
          <div className="bulk-count">Đã chọn: {selectedIds.size} cuốn sách</div>
          <button className="bulk-btn" onClick={handleBulkDelete}><IoTrash /> Xóa {selectedIds.size} sách</button>
          <button style={{background:'none', border:'none', color:'#94a3b8', cursor:'pointer'}} onClick={()=>setSelectedIds(new Set())}>Hủy</button>
        </div>
      )}

      {/* QUICK VIEW MODAL (New Feature) */}
      {showQuickView && quickViewBook && (
        <div className="modal-overlay" onClick={() => setShowQuickView(false)}>
          <div className="modal-quickview" onClick={e => e.stopPropagation()}>
            <div className="quickview-img">
              {quickViewBook.variants?.[0]?.imageUrls?.[0] 
                ? <img src={quickViewBook.variants[0].imageUrls[0]} alt="Cover" />
                : <IoImage size={100} color="#cbd5e1" />}
            </div>
            <div className="quickview-content">
              <div className="quickview-header">
                <h2 style={{margin:0, fontSize:'1.5rem'}}>{quickViewBook.title}</h2>
                <button className="btn-icon" onClick={() => setShowQuickView(false)}><IoClose size={24} /></button>
              </div>
              <div style={{display:'flex', gap:'0.5rem', flexWrap:'wrap', marginBottom:'1rem'}}>
                {quickViewBook.categoryNames?.length > 0 ? (
                  quickViewBook.categoryNames.map((cat, idx) => (
                    <span key={idx} className="tag-badge">{cat}</span>
                  ))
                ) : (
                  <span className="tag-badge" style={{background:'#f1f5f9', color:'#64748b'}}>Chưa phân loại</span>
                )}
              </div>
              <p style={{color:'var(--text-secondary)'}}>{quickViewBook.description || "Chưa có mô tả..."}</p>
              
              <div style={{background:'#f8fafc', padding:'1rem', borderRadius:'8px', marginTop:'1rem'}}>
                <div style={{display:'flex', justifyContent:'space-between'}}>
                   <span>Tác giả: <strong>{quickViewBook.authorNames?.join(", ")}</strong></span>
                   <span>NXB: <strong>{quickViewBook.publisherName}</strong></span>
                </div>
              </div>
              
              <div className="quickview-price">
                 {formatCurrency(quickViewBook.variants?.[0]?.price || 0)}
              </div>
              <div style={{display:'flex', gap:'1rem', marginTop:'auto'}}>
                <button className="btn-create-glow" onClick={() => { setShowQuickView(false); handleEdit(quickViewBook); }}>
                  <IoCreate /> Chỉnh sửa ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER FORM (Fixed Scroll) */}
      <div className={`drawer-overlay ${showDrawer ? 'open' : ''}`} onClick={() => setShowDrawer(false)}>
        <div className="drawer-panel" onClick={e => e.stopPropagation()}>
          <div className="drawer-header">
            <h2 style={{margin:0, fontSize:'1.4rem'}}>{modalMode === 'create' ? 'Thêm Sách Mới' : 'Cập Nhật Sách'}</h2>
            <button className="btn-icon" onClick={() => setShowDrawer(false)} style={{background: '#f1f5f9'}}><IoClose size={20} /></button>
          </div>
          
          {/* Form Container (Fixed Height) */}
          <form onSubmit={handleSubmit} className="drawer-form-container">
            <div className="drawer-body">
              <div className="form-tabs">
                <button type="button" className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>Thông tin chung</button>
                <button type="button" className={`tab-btn ${activeTab === 'variants' ? 'active' : ''}`} onClick={() => setActiveTab('variants')}>Phiên bản ({formData.variants.length})</button>
              </div>

              {activeTab === 'general' && (
                <div className="fade-in">
                  <div className="form-group"><label>Tên sách <span style={{color:'red'}}>*</span></label><input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className={validationErrors.title ? 'input-error' : ''} />{validationErrors.title && <div className="error-message"><IoWarning /> {validationErrors.title}</div>}</div>
                  <div className="form-group"><label>Mô tả</label><textarea rows="3" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} /></div>
                  <div style={{display:'flex', gap:'1rem'}}>
                    <div className="form-group" style={{flex:1}}><label>Năm XB</label><input type="number" value={formData.publisherYear} onChange={e => setFormData({ ...formData, publisherYear: e.target.value })} /></div>
                    <div className="form-group" style={{flex:1}}><label>Nhà XB <span style={{color:'red'}}>*</span></label><select value={formData.publisherId} onChange={e => setFormData({ ...formData, publisherId: e.target.value })} className={validationErrors.publisherId ? 'input-error' : ''}><option value="">-- Chọn --</option>{publishers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                  </div>
                  <div className="form-group"><label>Tác giả <span style={{color:'red'}}>*</span></label>
                     <div className="combobox-wrapper">
                       <div className="combobox-input-wrapper"><IoSearch className="combobox-icon"/><input className={`combobox-input ${validationErrors.authorIds ? 'input-error' : ''}`} placeholder="Tìm tác giả..." value={authorSearch} onChange={e=>{setAuthorSearch(e.target.value);setShowAuthorDropdown(true)}} onFocus={()=>setShowAuthorDropdown(true)}/></div>
                       {showAuthorDropdown && <div className="combobox-dropdown show">{authors.filter(a=>a.name.toLowerCase().includes(authorSearch.toLowerCase()) && !formData.authorIds.includes(a.id)).map(a=>(<div key={a.id} className="combobox-item" onClick={()=>{ setFormData({...formData, authorIds:[...formData.authorIds, a.id]}); setAuthorSearch(""); setShowAuthorDropdown(false); }}>{a.name}</div>))}</div>}
                     </div>
                     <div className="selected-tags-wrapper">{formData.authorIds.map(id => { const a = authors.find(au=>au.id===id); return a ? <span key={id} className="tag-badge">{a.name} <button type="button" className="tag-remove-btn" onClick={()=>setFormData({...formData, authorIds:formData.authorIds.filter(i=>i!==id)})}><IoClose/></button></span> : null; })}</div>
                     {showAuthorDropdown && <div style={{position:'fixed', inset:0, zIndex:40}} onClick={()=>setShowAuthorDropdown(false)}></div>}
                  </div>
                  <div className="form-group"><label>Thể loại</label>
                     <div className="combobox-wrapper">
                       <div className="combobox-input-wrapper"><IoSearch className="combobox-icon"/><input className="combobox-input" placeholder="Tìm thể loại..." value={categorySearch} onChange={e=>{setCategorySearch(e.target.value);setShowCategoryDropdown(true)}} onFocus={()=>setShowCategoryDropdown(true)}/></div>
                       {showCategoryDropdown && <div className="combobox-dropdown show">{categories.filter(c=>c.name.toLowerCase().includes(categorySearch.toLowerCase()) && !formData.categoryIds.includes(c.id)).map(c=>(<div key={c.id} className="combobox-item" onClick={()=>{ setFormData({...formData, categoryIds:[...formData.categoryIds, c.id]}); setCategorySearch(""); setShowCategoryDropdown(false); }}>{c.name}</div>))}</div>}
                     </div>
                     <div className="selected-tags-wrapper">{formData.categoryIds.map(id => { const c = categories.find(cat=>cat.id===id); return c ? <span key={id} className="tag-badge">{c.name} <button type="button" className="tag-remove-btn" onClick={()=>setFormData({...formData, categoryIds:formData.categoryIds.filter(i=>i!==id)})}><IoClose/></button></span> : null; })}</div>
                     {showCategoryDropdown && <div style={{position:'fixed', inset:0, zIndex:40}} onClick={()=>setShowCategoryDropdown(false)}></div>}
                  </div>
                </div>
              )}

              {activeTab === 'variants' && (
                <div className="fade-in">
                  {formData.variants.map((v, idx) => (
                    <div key={idx} className="variant-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom:'1rem' }}><h4 style={{margin:0, color:'var(--primary)'}}>Phiên bản #{idx + 1}</h4>{idx > 0 && <button type="button" style={{color:'var(--red-delete)', background:'none', border:'none', cursor:'pointer'}} onClick={() => { const nv = [...formData.variants]; nv.splice(idx, 1); setFormData({ ...formData, variants: nv }); }}>Xóa</button>}</div>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <div className="form-group" style={{ flex: 1 }}><label>Giá <span style={{color:'red'}}>*</span></label><input type="number" value={v.price} onChange={e => updateVariant(idx, 'price', e.target.value)} className={validationErrors[`variant_${idx}_price`] ? 'input-error' : ''}/></div>
                        <div className="form-group" style={{ flex: 1 }}><label>Kho <span style={{color:'red'}}>*</span></label><input type="number" value={v.quantity} onChange={e => updateVariant(idx, 'quantity', e.target.value)} /></div>
                      </div>
                      <div style={{marginTop:'1rem'}}>
                         <label style={{fontSize:'0.9rem', fontWeight:600, marginBottom:'0.5rem', display:'block'}}>Ảnh bìa <span style={{color:'red'}}>*</span></label>
                         {v.imageUrls && v.imageUrls.length > 0 ? 
                            <div className="img-preview-item" style={{width:'140px', height:'190px'}}><img src={v.imageUrls[0]} style={{width:'100%', height:'100%', objectFit:'cover'}} alt=""/><button type="button" className="btn-remove-img" onClick={()=>updateVariant(idx, 'imageUrls', v.imageUrls.slice(1))}><IoClose/></button></div> :
                            <div onDragEnter={(e)=>handleDrag(e,idx,'cover',true)} onDragLeave={(e)=>handleDrag(e,idx,'cover',false)} onDragOver={e=>e.preventDefault()} onDrop={(e)=>onDrop(e,idx,'cover')}>
                               <input type="file" id={`c-${idx}`} accept="image/*" style={{display:'none'}} onChange={e=>handleUpload(e.target.files, idx, 'cover')} />
                               <label htmlFor={`c-${idx}`} className={`upload-zone ${isDragging[`${idx}_cover`] ? 'dragging' : ''} ${validationErrors[`variant_${idx}_images`] ? 'input-error' : ''}`}><IoCloudUpload size={28} className="upload-icon-large"/><span style={{fontSize:'0.85rem'}}>Ảnh bìa</span></label>
                            </div>
                         }
                      </div>
                      <div style={{marginTop:'1rem'}}>
                         <label style={{fontSize:'0.9rem', fontWeight:600, marginBottom:'0.5rem', display:'block'}}>Ảnh chi tiết</label>
                         <div onDragEnter={(e)=>handleDrag(e,idx,'detail',true)} onDragLeave={(e)=>handleDrag(e,idx,'detail',false)} onDragOver={e=>e.preventDefault()} onDrop={(e)=>onDrop(e,idx,'detail')}>
                            <input type="file" id={`d-${idx}`} multiple accept="image/*" style={{display:'none'}} onChange={e=>handleUpload(e.target.files, idx, 'detail')} />
                            <label htmlFor={`d-${idx}`} className={`upload-zone ${isDragging[`${idx}_detail`] ? 'dragging' : ''}`} style={{minHeight:'60px', padding:'1rem', borderStyle:'dashed'}}><IoCloudUpload size={24} className="upload-icon-large"/><span style={{fontSize:'0.8rem'}}>Thêm ảnh phụ</span></label>
                         </div>
                         <div className="img-preview-list">
                            {v.imageUrls?.slice(1).map((url, i) => (<div key={i} className="img-preview-item"><img src={url} style={{width:'100%', height:'100%', objectFit:'cover'}} alt=""/><button type="button" className="btn-remove-img" onClick={()=>{const n=[v.imageUrls[0], ...v.imageUrls.slice(1).filter((_,k)=>k!==i)]; updateVariant(idx, 'imageUrls', n)}}><IoClose/></button></div>))}
                         </div>
                      </div>
                    </div>
                  ))}
                  <button type="button" className="btn-create-glow" style={{width:'100%', background:'white', color:'var(--primary)', border:'1px dashed var(--primary)', boxShadow:'none'}} onClick={()=>setFormData({...formData, variants:[...formData.variants, {price:0, quantity:0, status:'AVAILABLE', imageUrls:[]}]})}><IoAdd/> Thêm phiên bản</button>
                </div>
              )}
            </div>
            <div className="drawer-footer">
               <button type="button" className="btn-icon" style={{width:'auto', padding:'0 1.5rem', borderRadius:'8px', background:'#f1f5f9'}} onClick={() => setShowDrawer(false)}>Đóng</button>
               <button type="submit" className="btn-create-glow">Lưu Lại</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}