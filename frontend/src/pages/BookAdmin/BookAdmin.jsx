import { useState, useEffect, useCallback } from "react";
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
  IoArrowForward, IoFilter, IoSwapVertical,
  IoCheckmarkCircle, IoWarning // Icons cho filter, sort, validation
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

  // State Filter & Sort
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    minPrice: "",
    maxPrice: "",
    publisher: "",
    status: ""
  });
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");

  const [showDrawer, setShowDrawer] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [modalMode, setModalMode] = useState("create");
  const [selectedBook, setSelectedBook] = useState(null);

  // State tìm kiếm tác giả
  const [authorSearch, setAuthorSearch] = useState(""); 
  const [showAuthorDropdown, setShowAuthorDropdown] = useState(false);

  // State Validation Errors
  const [validationErrors, setValidationErrors] = useState({});

  // State Drag & Drop
  const [isDragging, setIsDragging] = useState({});

  const [formData, setFormData] = useState({
    title: "", description: "", publisherYear: new Date().getFullYear(),
    publisherId: "", authorIds: [], categoryIds: [],
    variants: []
  });

  const [publishers, setPublishers] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);

  // Fetch dữ liệu
  const fetchBooks = async () => {
    try {
      setLoading(true);
      let url = `/books?page=${page}&size=7&sortBy=${sortBy}&sortOrder=${sortOrder}`;
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

  // Fetch ALL books for filtering (no pagination)
  const fetchAllBooksForFilter = async () => {
    try {
      setLoading(true);
      // Fetch with large size to get all books
      const response = await axiosClient.get(`/books?page=0&size=10000&sortBy=id&sortOrder=desc`);
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
      const [pubRes, authRes, catRes] = await Promise.all([
        axiosClient.get("/publishers"),
        axiosClient.get("/authors"),
        axiosClient.get("/categories")
      ]);
      setPublishers(pubRes.data || []);
      setAuthors(authRes.data || []);
      
      // Chỉ lấy 17 categories chính hiển thị ở trang chủ
      const allCategories = catRes.data || [];
      
      // Danh sách 17 categories từ trang chính
      const mainCategoryIds = [
        882,   // Sách Nông - Lâm - Ngư Nghiệp
        1084,  // Truyện Tranh, Manga, Comic
        1468,  // Tạp Chí - Catalogue
        163,   // Ingredients, Methods & Appliances
        14860, // Baking - Desserts
        6445,  // Magazines
        68078, // Beverages & Wine
        159,   // Drinks & Beverages
        14924, // Discovery & Exploration
        276,   // Vietnam
        14862, // Vegetarian & Vegan
        11021, // Anthropology
        273,   // Europe
        275,   // Guidebook series
        161,   // Diets - Weight Loss - Nutrition
        68088, // Cooking Education & Reference
        271    // Asia
      ];
      
      const mainCategories = allCategories.filter(cat => mainCategoryIds.includes(cat.id));
      
      setCategories(mainCategories);
    } catch (error) { console.error("Metadata error", error); }
  };

  // Check if any filter is active
  const hasActiveFilters = Object.values(filters).some(val => val !== "");

  useEffect(() => { 
    // When filter is active, fetch all books for client-side filtering
    // Otherwise use normal pagination
    if (hasActiveFilters) {
      fetchAllBooksForFilter();
    } else {
      fetchBooks(); 
    }
  }, [page, sortBy, sortOrder, hasActiveFilters]);
  useEffect(() => { fetchMetadata(); }, []);

  // Filter logic (client-side for displayed books)
  const getFilteredBooks = useCallback(() => {
    let filtered = [...books];
    
    // Filter by category
    if (filters.category) {
      const categoryIdToFind = parseInt(filters.category);
      filtered = filtered.filter(book => {
        if (!book.categoryIds || book.categoryIds.length === 0) return false;
        
        // Convert to array if needed and ensure number comparison
        const categoryArray = Array.isArray(book.categoryIds) 
          ? book.categoryIds 
          : Array.from(book.categoryIds);
        
        // Convert all to numbers for comparison
        return categoryArray.map(id => parseInt(id)).includes(categoryIdToFind);
      });
    }
    
    // Filter by price range
    if (filters.minPrice || filters.maxPrice) {
      filtered = filtered.filter(book => {
        if (!book.variants || book.variants.length === 0) return false;
        
        const prices = book.variants.map(v => v.price || 0);
        const minBookPrice = Math.min(...prices);
        const maxBookPrice = Math.max(...prices);
        
        const minFilter = filters.minPrice ? parseFloat(filters.minPrice) : 0;
        const maxFilter = filters.maxPrice ? parseFloat(filters.maxPrice) : Infinity;
        
        return minBookPrice >= minFilter && maxBookPrice <= maxFilter;
      });
    }
    
    // Filter by publisher
    if (filters.publisher) {
      filtered = filtered.filter(book => 
        book.publisherName?.toLowerCase().includes(filters.publisher.toLowerCase())
      );
    }
    
    // Filter by status
    if (filters.status) {
      filtered = filtered.filter(book => 
        book.variants?.some(v => v.status === filters.status)
      );
    }
    
    return filtered;
  }, [books, filters]);

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.title || formData.title.trim().length < 3) {
      errors.title = "Tên sách phải có ít nhất 3 ký tự";
    }
    
    if (!formData.publisherId) {
      errors.publisherId = "Vui lòng chọn nhà xuất bản";
    }
    
    if (formData.authorIds.length === 0) {
      errors.authorIds = "Vui lòng chọn ít nhất 1 tác giả";
    }
    
    formData.variants.forEach((v, idx) => {
      if (!v.price || parseFloat(v.price) <= 0) {
        errors[`variant_${idx}_price`] = "Giá phải lớn hơn 0";
      }
      
      if (v.quantity === "" || v.quantity === null || parseInt(v.quantity) < 0) {
        errors[`variant_${idx}_quantity`] = "Số lượng không được âm";
      }
      
      if (!v.imageUrls || v.imageUrls.length === 0) {
        errors[`variant_${idx}_images`] = "Phải có ít nhất 1 ảnh bìa";
      }
    });
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // --- XỬ LÝ FORM ---
  const handleCreate = () => {
    setModalMode("create"); setActiveTab("general");
    setAuthorSearch(""); setShowAuthorDropdown(false);
    setValidationErrors({});
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
    setValidationErrors({});

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
    
    // Validate form before submit
    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin!");
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
    
    // Clear validation error for this field
    const errorKey = `variant_${idx}_${field}`;
    if (validationErrors[errorKey]) {
      const newErrors = { ...validationErrors };
      delete newErrors[errorKey];
      setValidationErrors(newErrors);
    }
  };

  // Drag & Drop handlers
  const handleDragEnter = (e, variantIndex, type) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging({ [`${variantIndex}_${type}`]: true });
  };

  const handleDragLeave = (e, variantIndex, type) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging({ [`${variantIndex}_${type}`]: false });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e, variantIndex, type) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging({ [`${variantIndex}_${type}`]: false });

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    // Filter only image files
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      toast.error('Vui lòng chỉ kéo thả file ảnh');
      return;
    }

    if (type === 'cover') {
      // Only take first file for cover
      await uploadCoverImage(imageFiles[0], variantIndex);
    } else {
      // Upload multiple detail images
      await uploadDetailImages(imageFiles, variantIndex);
    }
  };

  // Upload ảnh bìa (chỉ 1 ảnh, sẽ là phần tử đầu tiên trong array)
  const uploadCoverImage = async (file, variantIndex) => {
    if (!file) return;

    // Validate
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ảnh không được vượt quá 5MB');
      return;
    }

    const loadingToast = toast.loading('Đang upload ảnh bìa...');
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      
      const response = await axiosClient.post('/books/upload-image', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const imageUrl = response.data.url;
      const currentVariant = formData.variants[variantIndex];
      const existingImages = currentVariant.imageUrls || [];
      
      // Thay thế ảnh bìa (index 0) hoặc thêm vào đầu
      const updatedImages = existingImages.length > 0 
        ? [imageUrl, ...existingImages.slice(1)] 
        : [imageUrl];
      
      updateVariant(variantIndex, 'imageUrls', updatedImages);
      toast.success('Upload ảnh bìa thành công!', { id: loadingToast });
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.error || 'Lỗi upload ảnh', { id: loadingToast });
    }
  };

  const handleCoverUpload = async (e, variantIndex) => {
    const file = e.target.files[0];
    if (file) {
      await uploadCoverImage(file, variantIndex);
    }
    e.target.value = null;
  };

  // Upload ảnh chi tiết (nhiều ảnh, thêm vào sau ảnh bìa)
  const uploadDetailImages = async (files, variantIndex) => {
    if (files.length === 0) return;

    // Validate từng file
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File ${file.name} vượt quá 5MB`);
        return;
      }
    }

    const loadingToast = toast.loading(`Đang upload ${files.length} ảnh chi tiết...`);
    try {
      const uploadPromises = files.map(async (file) => {
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);
        const response = await axiosClient.post('/books/upload-image', formDataUpload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const currentVariant = formData.variants[variantIndex];
      const existingImages = currentVariant.imageUrls || [];
      
      // Thêm ảnh chi tiết vào sau ảnh bìa
      const updatedImages = [...existingImages, ...uploadedUrls];
      
      updateVariant(variantIndex, 'imageUrls', updatedImages);
      toast.success(`Đã upload ${files.length} ảnh chi tiết!`, { id: loadingToast });
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.error || 'Lỗi upload ảnh', { id: loadingToast });
    }
  };

  const handleDetailImagesUpload = async (e, variantIndex) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      await uploadDetailImages(files, variantIndex);
    }
    e.target.value = null;
  };

  // --- LOGIC PHÂN TRANG (Render số trang) ---
  const renderPageNumbers = () => {
    const pageNumbers = [];
    const currentTotalPages = hasActiveFilters ? filteredTotalPages : totalPages;
    let startPage = Math.max(0, page - 2);
    let endPage = Math.min(currentTotalPages - 1, page + 2);

    if (endPage - startPage < 4) {
      if (startPage === 0) endPage = Math.min(currentTotalPages - 1, 4);
      else if (endPage === currentTotalPages - 1) startPage = Math.max(0, currentTotalPages - 5);
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
    const maxPages = hasActiveFilters ? filteredTotalPages : totalPages;
    if (p >= 1 && p <= maxPages) {
      setPage(p - 1);
      setJumpPage("");
    } else {
      toast.error(`Trang không hợp lệ! (1 - ${maxPages})`);
    }
  };

  // Tính toán thống kê Header
  const displayedBooks = getFilteredBooks();
  const totalStock = displayedBooks.reduce((acc, b) => acc + (b.variants?.reduce((vAcc, v) => vAcc + v.quantity, 0) || 0), 0);
  const lowStockCount = displayedBooks.filter(b => b.variants?.some(v => v.quantity < 5)).length;

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      category: "",
      minPrice: "",
      maxPrice: "",
      publisher: "",
      status: ""
    });
  };

  // Pagination for filtered results (client-side pagination when filter is active)
  const pageSize = 7;
  const filteredTotalPages = hasActiveFilters 
    ? Math.ceil(displayedBooks.length / pageSize) 
    : totalPages;
  
  const paginatedBooks = hasActiveFilters
    ? displayedBooks.slice(page * pageSize, (page + 1) * pageSize)
    : displayedBooks;

  // Adjust page if out of bounds after filtering
  useEffect(() => {
    if (hasActiveFilters && page >= filteredTotalPages && filteredTotalPages > 0) {
      setPage(0);
    }
  }, [hasActiveFilters, filteredTotalPages, page]);

  return (
    <div className="book-admin-page">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="admin-header-card">
        <IoLibrary className="header-bg-decoration" />
        <div className="header-content">
          <h1 className="header-title">Quản Lý Sách Elite</h1>
          <div className="header-stats-row">
            <div className="stat-item"><IoLibrary color="var(--primary)" /> <span>Đầu sách: <strong>{displayedBooks.length}</strong></span></div>
            <div className="stat-item"><IoStatsChart color="#10b981" /> <span>Tồn kho: <strong>{totalStock}</strong></span></div>
            <div className="stat-item"><IoAlertCircle color="#f59e0b" /> <span>Sắp hết: <strong>{lowStockCount}</strong></span></div>
          </div>
        </div>
        <button className="btn-create-glow" onClick={handleCreate}><IoAdd size={24} /> <span>Thêm Sách Mới</span></button>
      </div>

      {/* Search Bar & Filters */}
      <div className="search-section">
        <select className="search-select" value={searchType} onChange={(e) => setSearchType(e.target.value)}>
          <option value="title">Tên sách</option>
          <option value="author">Tác giả</option>
        </select>
        <div style={{ position: 'relative', flex: 1 }}>
          <input className="search-input" placeholder="Tìm kiếm sách, tác giả, ISBN..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchBooks()} />
        </div>
        <button className="btn-search" onClick={() => { setPage(0); fetchBooks(); }}><IoSearch size={20} /></button>
        <button 
          className={`btn-filter ${showFilters ? 'active' : ''} ${hasActiveFilters ? 'has-filters' : ''}`} 
          onClick={() => setShowFilters(!showFilters)}
          title="Bộ lọc"
        >
          <IoFilter size={20} />
          {hasActiveFilters && <span className="filter-badge">{Object.values(filters).filter(v => v !== "").length}</span>}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="filter-panel">
          <div className="filter-header">
            <h3><IoFilter /> Bộ lọc nâng cao</h3>
            {hasActiveFilters && (
              <button className="btn-clear-filters" onClick={clearFilters}>
                <IoClose /> Xóa bộ lọc
              </button>
            )}
          </div>
          <div className="filter-grid">
            <div className="filter-item">
              <label>Danh mục</label>
              <select value={filters.category} onChange={(e) => setFilters({...filters, category: e.target.value})}>
                <option value="">Tất cả</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="filter-item">
              <label>Giá từ</label>
              <input 
                type="number" 
                placeholder="0" 
                value={filters.minPrice}
                onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
              />
            </div>
            <div className="filter-item">
              <label>Giá đến</label>
              <input 
                type="number" 
                placeholder="1,000,000" 
                value={filters.maxPrice}
                onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
              />
            </div>
            <div className="filter-item">
              <label>Nhà xuất bản</label>
              <input 
                type="text" 
                placeholder="Tìm nhà XB..." 
                value={filters.publisher}
                onChange={(e) => setFilters({...filters, publisher: e.target.value})}
              />
            </div>
            <div className="filter-item">
              <label>Trạng thái</label>
              <select value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}>
                <option value="">Tất cả</option>
                <option value="AVAILABLE">Sẵn hàng</option>
                <option value="OUT_OF_STOCK">Hết hàng</option>
              </select>
            </div>
            <div className="filter-item">
              <label>Sắp xếp theo</label>
              <div style={{display: 'flex', gap: '0.5rem'}}>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{flex: 1}}
                >
                  <option value="id">ID</option>
                  <option value="title">Tên sách</option>
                  <option value="publisherYear">Năm XB</option>
                </select>
                <button 
                  className="btn-sort-order"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  title={sortOrder === 'asc' ? 'Tăng dần' : 'Giảm dần'}
                >
                  <IoSwapVertical size={20} />
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="books-table-container">
        {loading ? <div className="loading-container"><div className="spinner"></div><span>Đang tải dữ liệu...</span></div> : paginatedBooks.length > 0 ? (
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
              {paginatedBooks.map((book) => {
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
      {!loading && filteredTotalPages > 0 && (
        <div className="pagination-wrapper">
          {/* CỘT TRÁI: Thông tin trang */}
          <div className="pagination-info">
            Trang <strong>{page + 1}</strong> / {filteredTotalPages}
            {hasActiveFilters && (
              <span style={{marginLeft: '0.5rem', color: 'var(--primary)', fontSize: '0.85rem'}}>
                (Đã lọc: {displayedBooks.length} sách)
              </span>
            )}
          </div>

          {/* CỘT GIỮA: Các nút điều hướng */}
          <div className="pagination-controls">
            <button className="page-btn" disabled={page === 0} onClick={() => setPage(0)} title="Trang đầu"><IoPlaySkipBack /></button>
            <button className="page-btn" disabled={page === 0} onClick={() => setPage(p => p - 1)} title="Trang trước"><IoChevronBack /></button>
            
            {renderPageNumbers()}
            
            <button className="page-btn" disabled={page === filteredTotalPages - 1} onClick={() => setPage(p => p + 1)} title="Trang sau"><IoChevronForward /></button>
            <button className="page-btn" disabled={page === filteredTotalPages - 1} onClick={() => setPage(filteredTotalPages - 1)} title="Trang cuối"><IoPlaySkipForward /></button>
          </div>

          {/* CỘT PHẢI: Ô nhập số trang */}
          <div className="pagination-jump">
            <span>Đến trang:</span>
            <input 
              className="page-input" 
              type="number" 
              min="1" 
              max={filteredTotalPages}
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
                  <div className="form-group">
                    <label>Tên sách <span style={{color:'red'}}>*</span></label>
                    <input 
                      required 
                      value={formData.title} 
                      onChange={e => {
                        setFormData({ ...formData, title: e.target.value });
                        if (validationErrors.title) {
                          const newErrors = { ...validationErrors };
                          delete newErrors.title;
                          setValidationErrors(newErrors);
                        }
                      }}
                      className={validationErrors.title ? 'input-error' : ''}
                    />
                    {validationErrors.title && (
                      <div className="error-message">
                        <IoWarning size={14} /> {validationErrors.title}
                      </div>
                    )}
                  </div>
                  <div className="form-group"><label>Mô tả ngắn</label><textarea rows="4" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} /></div>
                  <div style={{display:'flex', gap:'1rem'}}>
                    <div className="form-group" style={{flex:1}}><label>Năm XB</label><input type="number" value={formData.publisherYear} onChange={e => setFormData({ ...formData, publisherYear: e.target.value })} /></div>
                    <div className="form-group" style={{flex:1}}>
                      <label>Nhà XB <span style={{color:'red'}}>*</span></label>
                      <select 
                        value={formData.publisherId} 
                        onChange={e => {
                          setFormData({ ...formData, publisherId: e.target.value });
                          if (validationErrors.publisherId) {
                            const newErrors = { ...validationErrors };
                            delete newErrors.publisherId;
                            setValidationErrors(newErrors);
                          }
                        }}
                        className={validationErrors.publisherId ? 'input-error' : ''}
                      >
                        <option value="">-- Chọn nhà xuất bản --</option>
                        {publishers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                      {validationErrors.publisherId && (
                        <div className="error-message">
                          <IoWarning size={14} /> {validationErrors.publisherId}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Combobox Author */}
                  <div className="form-group">
                     <label>Tác giả <span style={{color:'red'}}>*</span></label>
                     <div className="combobox-wrapper">
                       <div className="combobox-input-wrapper">
                         <IoSearch className="combobox-icon"/>
                         <input 
                           className={`combobox-input ${validationErrors.authorIds ? 'input-error' : ''}`}
                           placeholder="Tìm tác giả..." 
                           value={authorSearch} 
                           onChange={e=>{setAuthorSearch(e.target.value);setShowAuthorDropdown(true)}} 
                           onFocus={()=>setShowAuthorDropdown(true)}
                         />
                       </div>
                       {showAuthorDropdown && <div className="combobox-dropdown show">
                          {authors.filter(a=>a.name.toLowerCase().includes(authorSearch.toLowerCase()) && !formData.authorIds.includes(a.id)).map(a=>(
                            <div key={a.id} className="combobox-item" onClick={()=>{
                              setFormData({...formData, authorIds:[...formData.authorIds, a.id]});
                              setAuthorSearch("");
                              setShowAuthorDropdown(false);
                              if (validationErrors.authorIds) {
                                const newErrors = { ...validationErrors };
                                delete newErrors.authorIds;
                                setValidationErrors(newErrors);
                              }
                            }}>
                               {a.name}
                            </div>
                          ))}
                       </div>}
                     </div>
                     {validationErrors.authorIds && (
                       <div className="error-message">
                         <IoWarning size={14} /> {validationErrors.authorIds}
                       </div>
                     )}
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
                        <div className="form-group" style={{ flex: 1 }}>
                          <label>Giá bán <span style={{color:'red'}}>*</span></label>
                          <input 
                            type="number" 
                            value={v.price} 
                            onChange={e => updateVariant(idx, 'price', e.target.value)}
                            className={validationErrors[`variant_${idx}_price`] ? 'input-error' : ''}
                          />
                          {validationErrors[`variant_${idx}_price`] && (
                            <div className="error-message">
                              <IoWarning size={14} /> {validationErrors[`variant_${idx}_price`]}
                            </div>
                          )}
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                          <label>Kho <span style={{color:'red'}}>*</span></label>
                          <input 
                            type="number" 
                            value={v.quantity} 
                            onChange={e => updateVariant(idx, 'quantity', e.target.value)}
                            className={validationErrors[`variant_${idx}_quantity`] ? 'input-error' : ''}
                          />
                          {validationErrors[`variant_${idx}_quantity`] && (
                            <div className="error-message">
                              <IoWarning size={14} /> {validationErrors[`variant_${idx}_quantity`]}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* --- KHU VỰC UPLOAD ẢNH BÌA (with Drag & Drop) --- */}
                      <div className="variant-images-section" style={{marginTop:'1.5rem', padding:'1rem', background:'#f8f9fa', borderRadius:'8px'}}>
                        <label style={{fontWeight:600, marginBottom:'0.5rem', display:'flex', alignItems:'center', gap:'0.5rem', color:'var(--primary)'}}>
                          <IoBookOutline size={18} /> Ảnh bìa (Cover Image) <span style={{color:'red'}}>*</span>
                        </label>
                        <p style={{fontSize:'0.85rem', color:'#6c757d', marginBottom:'0.75rem'}}>Ảnh này sẽ hiển thị làm thumbnail trên trang chủ và danh sách sản phẩm</p>
                        
                        {v.imageUrls && v.imageUrls.length > 0 ? (
                          <div className="img-preview-item" style={{width:'150px', position:'relative'}}>
                            <img src={v.imageUrls[0]} alt="Cover" onError={(e) => e.target.src = "https://placehold.co/150x200?text=Cover"} style={{width:'100%', height:'200px', objectFit:'cover', borderRadius:'8px'}} />
                            <button type="button" className="btn-remove-img" style={{position:'absolute', top:'5px', right:'5px'}} onClick={() => {
                              const newUrls = v.imageUrls.slice(1);
                              updateVariant(idx, 'imageUrls', newUrls);
                            }}><IoClose size={16} /></button>
                            <input type="file" id={`cover-upload-${idx}`} accept="image/*" style={{display:'none'}} onChange={(e) => handleCoverUpload(e, idx)} />
                            <label htmlFor={`cover-upload-${idx}`} style={{display:'block', textAlign:'center', marginTop:'0.5rem', cursor:'pointer', color:'var(--primary)', fontSize:'0.85rem', fontWeight:600}}>Thay đổi ảnh bìa</label>
                          </div>
                        ) : (
                          <div
                            onDragEnter={(e) => handleDragEnter(e, idx, 'cover')}
                            onDragLeave={(e) => handleDragLeave(e, idx, 'cover')}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, idx, 'cover')}
                          >
                            <input type="file" id={`cover-upload-${idx}`} accept="image/*" style={{display:'none'}} onChange={(e) => handleCoverUpload(e, idx)} />
                            <label 
                              htmlFor={`cover-upload-${idx}`} 
                              className={`upload-zone ${isDragging[`${idx}_cover`] ? 'dragging' : ''} ${validationErrors[`variant_${idx}_images`] ? 'upload-zone-error' : ''}`}
                              style={{minHeight:'120px'}}
                            >
                              <IoCloudUpload size={36} className="upload-icon-large" />
                              <div>
                                <div className="upload-text">
                                  {isDragging[`${idx}_cover`] ? 'Thả ảnh vào đây' : 'Kéo thả hoặc click để tải ảnh bìa'}
                                </div>
                                <div className="upload-subtext">JPG, PNG (Tối đa 5MB)</div>
                              </div>
                            </label>
                          </div>
                        )}
                        {validationErrors[`variant_${idx}_images`] && (
                          <div className="error-message" style={{marginTop: '0.5rem'}}>
                            <IoWarning size={14} /> {validationErrors[`variant_${idx}_images`]}
                          </div>
                        )}
                      </div>

                      {/* --- KHU VỰC UPLOAD ẢNH CHI TIẾT (with Drag & Drop) --- */}
                      <div 
                        className="variant-images-section" 
                        style={{marginTop:'1.5rem', padding:'1rem', background:'#f1f3f5', borderRadius:'8px'}}
                        onDragEnter={(e) => handleDragEnter(e, idx, 'detail')}
                        onDragLeave={(e) => handleDragLeave(e, idx, 'detail')}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, idx, 'detail')}
                      >
                        <label style={{fontWeight:600, marginBottom:'0.5rem', display:'flex', alignItems:'center', gap:'0.5rem', color:'#495057'}}>
                          <IoLibrary size={18} /> Ảnh chi tiết (Detail Images)
                        </label>
                        <p style={{fontSize:'0.85rem', color:'#6c757d', marginBottom:'0.75rem'}}>Các ảnh này sẽ hiển thị trong trang chi tiết sản phẩm để khách hàng xem kỹ hơn</p>
                        
                        <input type="file" id={`detail-upload-${idx}`} multiple accept="image/*" style={{display:'none'}} onChange={(e) => handleDetailImagesUpload(e, idx)} />
                        <label 
                          htmlFor={`detail-upload-${idx}`} 
                          className={`upload-zone ${isDragging[`${idx}_detail`] ? 'dragging' : ''}`}
                          style={{minHeight:'100px', borderStyle:'dashed'}}
                        >
                          <IoCloudUpload size={32} className="upload-icon-large" />
                          <div>
                            <div className="upload-text">
                              {isDragging[`${idx}_detail`] ? 'Thả ảnh vào đây' : 'Kéo thả nhiều ảnh hoặc click để chọn'}
                            </div>
                            <div className="upload-subtext">Chọn nhiều ảnh cùng lúc (Tối đa 5MB/ảnh)</div>
                          </div>
                        </label>
                        
                        {v.imageUrls && v.imageUrls.length > 1 && (
                          <div className="img-preview-list" style={{marginTop:'1rem'}}>
                            {v.imageUrls.slice(1).map((url, imgIdx) => (
                              <div key={imgIdx} className="img-preview-item">
                                <img src={url} alt={`Detail ${imgIdx + 1}`} onError={(e) => e.target.src = "https://placehold.co/100x130?text=Error"} />
                                <button type="button" className="btn-remove-img" onClick={() => {
                                  const newUrls = [v.imageUrls[0], ...v.imageUrls.slice(1).filter((_, i) => i !== imgIdx)];
                                  updateVariant(idx, 'imageUrls', newUrls);
                                }}><IoClose size={14} /></button>
                                <div style={{fontSize:'0.7rem', textAlign:'center', marginTop:'0.25rem', color:'#6c757d'}}>#{imgIdx + 1}</div>
                              </div>
                            ))}
                          </div>
                        )}
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