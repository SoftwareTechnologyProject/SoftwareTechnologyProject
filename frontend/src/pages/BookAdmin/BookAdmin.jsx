import { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import toast from "react-hot-toast";
import { IoAdd, IoSearch, IoClose, IoTrash, IoCreate, IoCloudUpload } from "react-icons/io5";
import "./BookAdmin.css";

export default function BookAdmin() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("title");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // create | edit
  const [selectedBook, setSelectedBook] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    publisherYear: new Date().getFullYear(),
    publisherId: "",
    authorIds: [],
    categoryIds: [],
    variants: []
  });
  
  // Metadata
  const [publishers, setPublishers] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);

  // Fetch books
  const fetchBooks = async () => {
    try {
      setLoading(true);
      let url = `/books?page=${page}&size=10&sortBy=id`;
      
      if (searchTerm) {
        url = `/books/search?${searchType}=${searchTerm}&page=${page}&size=10`;
      }
      
      const response = await axiosClient.get(url);
      setBooks(response.data);
      // Note: Backend trả về List thay vì Page object, cần điều chỉnh nếu có pagination
    } catch (error) {
      console.error("Error fetching books:", error);
      toast.error("Không thể tải danh sách sách");
    } finally {
      setLoading(false);
    }
  };

  // Fetch metadata
  const fetchMetadata = async () => {
    try {
      const [publishersRes, authorsRes, categoriesRes] = await Promise.all([
        axiosClient.get("/publishers"),
        axiosClient.get("/authors"),
        axiosClient.get("/categories")
      ]);
      
      setPublishers(publishersRes.data);
      setAuthors(authorsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error("Error fetching metadata:", error);
      toast.error("Không thể tải dữ liệu nhà xuất bản, tác giả, thể loại");
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [page]);

  useEffect(() => {
    fetchMetadata();
  }, []);

  // Handle search
  const handleSearch = () => {
    setPage(0);
    fetchBooks();
  };

  // Handle create book
  const handleCreate = () => {
    setModalMode("create");
    setFormData({
      title: "",
      description: "",
      publisherYear: new Date().getFullYear(),
      publisherId: "",
      authorIds: [],
      categoryIds: [],
      variants: [{
        price: 0,
        quantity: 0,
        sold: 0,
        status: "AVAILABLE",
        isbn: "",
        imageUrls: []
      }]
    });
    setSelectedBook(null);
    setShowModal(true);
  };

  // Handle edit book
  const handleEdit = (book) => {
    setModalMode("edit");
    setSelectedBook(book);
    
    // Map variants to include imageUrls properly
    const mappedVariants = (book.variants || []).map(v => ({
      id: v.id,
      price: v.price || 0,
      quantity: v.quantity || 0,
      sold: v.sold || 0,
      status: v.status || "AVAILABLE",
      isbn: v.isbn || "",
      imageUrls: v.imageUrls || []
    }));
    
    setFormData({
      title: book.title,
      description: book.description || "",
      publisherYear: book.publisherYear || new Date().getFullYear(),
      publisherId: book.publisherId || "",
      authorIds: book.authorIds || [],
      categoryIds: book.categoryIds || [],
      variants: mappedVariants.length > 0 ? mappedVariants : [{
        price: 0,
        quantity: 0,
        sold: 0,
        status: "AVAILABLE",
        isbn: "",
        imageUrls: []
      }]
    });
    setShowModal(true);
  };

  // Handle delete book
  const handleDelete = async (bookId) => {
    if (!confirm("Bạn có chắc chắn muốn xóa sách này?")) return;
    
    try {
      await axiosClient.delete(`/books/${bookId}`);
      toast.success("Xóa sách thành công");
      fetchBooks();
    } catch (error) {
      console.error("Error deleting book:", error);
      toast.error(error.response?.data?.message || "Không thể xóa sách");
    }
  };

  // Handle update status
  const handleUpdateStatus = async (variantId, newStatus) => {
    try {
      await axiosClient.patch(`/books/variants/${variantId}/status`, null, {
        params: { status: newStatus }
      });
      toast.success("Cập nhật trạng thái thành công");
      fetchBooks();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Không thể cập nhật trạng thái");
    }
  };

  // Handle submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (modalMode === "create") {
        await axiosClient.post("/books", formData);
        toast.success("Thêm sách thành công");
      } else {
        await axiosClient.put(`/books/${selectedBook.id}`, formData);
        toast.success("Cập nhật sách thành công");
      }
      
      setShowModal(false);
      fetchBooks();
    } catch (error) {
      console.error("Error submitting book:", error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  // Handle upload image
  const handleUploadImage = async (variantIndex, file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await axiosClient.post("/books/upload-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      
      const imageUrl = response.data.url;
      
      // Add image URL to variant
      setFormData(prev => {
        const newVariants = [...prev.variants];
        if (!newVariants[variantIndex].imageUrls) {
          newVariants[variantIndex].imageUrls = [];
        }
        newVariants[variantIndex].imageUrls.push(imageUrl);
        return { ...prev, variants: newVariants };
      });
      
      toast.success("Tải ảnh lên thành công");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(error.response?.data?.error || "Không thể tải ảnh lên");
    }
  };

  // Add variant
  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          price: 0,
          quantity: 0,
          sold: 0,
          status: "AVAILABLE",
          isbn: "",
          imageUrls: []
        }
      ]
    }));
  };

  // Remove variant
  const removeVariant = (index) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="book-admin-page">
      <div className="page-header">
        <h1>Quản Lý Sách</h1>
        <button className="btn-primary" onClick={handleCreate}>
          <IoAdd /> Thêm Sách Mới
        </button>
      </div>

      {/* Search & Filter */}
      <div className="search-section">
        <select 
          value={searchType} 
          onChange={(e) => setSearchType(e.target.value)}
          className="search-select"
        >
          <option value="title">Tên sách</option>
          <option value="isbn">ISBN</option>
          <option value="category">Thể loại</option>
          <option value="author">Tác giả</option>
          <option value="publisher">Nhà xuất bản</option>
        </select>
        
        <input
          type="text"
          placeholder={`Tìm kiếm theo ${searchType === 'title' ? 'tên sách' : searchType}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="search-input"
        />
        
        <button onClick={handleSearch} className="btn-search">
          <IoSearch /> Tìm kiếm
        </button>
      </div>

      {/* Books Table */}
      <div className="books-table-container">
        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : books.length === 0 ? (
          <div className="empty">Không tìm thấy sách nào</div>
        ) : (
          <table className="books-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên sách</th>
                <th>Nhà xuất bản</th>
                <th>Năm XB</th>
                <th>Số biến thể</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.id}>
                  <td>{book.id}</td>
                  <td className="book-title">
                    <strong>{book.title}</strong>
                    <div className="book-meta">
                      {book.authorNames?.join(", ")}
                    </div>
                  </td>
                  <td>{book.publisherName || "N/A"}</td>
                  <td>{book.publisherYear || "N/A"}</td>
                  <td>{book.variants?.length || 0}</td>
                  <td>
                    {book.variants?.map((variant) => (
                      <div key={variant.id} className="variant-status">
                        <select
                          value={variant.status}
                          onChange={(e) => handleUpdateStatus(variant.id, e.target.value)}
                          className={`status-badge ${variant.status.toLowerCase()}`}
                        >
                          <option value="AVAILABLE">AVAILABLE</option>
                          <option value="OUT_OF_STOCK">OUT_OF_STOCK</option>
                        </select>
                      </div>
                    ))}
                  </td>
                  <td className="actions">
                    <button 
                      className="btn-icon btn-edit"
                      onClick={() => handleEdit(book)}
                      title="Chỉnh sửa"
                    >
                      <IoCreate />
                    </button>
                    <button 
                      className="btn-icon btn-delete"
                      onClick={() => handleDelete(book.id)}
                      title="Xóa"
                    >
                      <IoTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
          >
            Trang trước
          </button>
          <span>Trang {page + 1} / {totalPages}</span>
          <button 
            disabled={page >= totalPages - 1}
            onClick={() => setPage(page + 1)}
          >
            Trang sau
          </button>
        </div>
      )}

      {/* Modal Create/Edit */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modalMode === "create" ? "Thêm Sách Mới" : "Chỉnh Sửa Sách"}</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <IoClose />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="book-form">
              {/* Basic Info */}
              <div className="form-section">
                <h3>Thông tin cơ bản</h3>
                
                <div className="form-group">
                  <label>Tên sách *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Mô tả</label>
                  <textarea
                    rows="4"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Năm xuất bản</label>
                    <input
                      type="number"
                      min="1900"
                      max="2100"
                      value={formData.publisherYear}
                      onChange={(e) => setFormData({...formData, publisherYear: parseInt(e.target.value)})}
                    />
                  </div>

                  <div className="form-group">
                    <label>Nhà xuất bản</label>
                    <select
                      value={formData.publisherId}
                      onChange={(e) => setFormData({...formData, publisherId: parseInt(e.target.value)})}
                    >
                      <option value="">Chọn nhà xuất bản</option>
                      {publishers.map(pub => (
                        <option key={pub.id} value={pub.id}>{pub.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Tác giả</label>
                  <select
                    multiple
                    value={formData.authorIds}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                      setFormData({...formData, authorIds: selected});
                    }}
                    className="multi-select"
                  >
                    {authors.map(author => (
                      <option key={author.id} value={author.id}>{author.name}</option>
                    ))}
                  </select>
                  <small>Giữ Ctrl (Cmd) để chọn nhiều</small>
                </div>

                <div className="form-group">
                  <label>Thể loại</label>
                  <select
                    multiple
                    value={formData.categoryIds}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                      setFormData({...formData, categoryIds: selected});
                    }}
                    className="multi-select"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <small>Giữ Ctrl (Cmd) để chọn nhiều</small>
                </div>
              </div>

              {/* Variants */}
              <div className="form-section">
                <div className="section-header">
                  <h3>Phiên bản sách</h3>
                  <button type="button" className="btn-secondary" onClick={addVariant}>
                    <IoAdd /> Thêm phiên bản
                  </button>
                </div>

                {formData.variants.map((variant, index) => (
                  <div key={index} className="variant-card">
                    <div className="variant-header">
                      <h4>Phiên bản {index + 1}</h4>
                      {formData.variants.length > 1 && (
                        <button
                          type="button"
                          className="btn-icon btn-delete"
                          onClick={() => removeVariant(index)}
                        >
                          <IoTrash />
                        </button>
                      )}
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Giá *</label>
                        <input
                          type="number"
                          min="0"
                          required
                          value={variant.price}
                          onChange={(e) => {
                            const newVariants = [...formData.variants];
                            newVariants[index].price = parseFloat(e.target.value);
                            setFormData({...formData, variants: newVariants});
                          }}
                        />
                      </div>

                      <div className="form-group">
                        <label>Số lượng</label>
                        <input
                          type="number"
                          min="0"
                          value={variant.quantity}
                          onChange={(e) => {
                            const newVariants = [...formData.variants];
                            newVariants[index].quantity = parseInt(e.target.value);
                            setFormData({...formData, variants: newVariants});
                          }}
                        />
                      </div>

                      <div className="form-group">
                        <label>Đã bán</label>
                        <input
                          type="number"
                          min="0"
                          value={variant.sold}
                          onChange={(e) => {
                            const newVariants = [...formData.variants];
                            newVariants[index].sold = parseInt(e.target.value);
                            setFormData({...formData, variants: newVariants});
                          }}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>ISBN</label>
                        <input
                          type="text"
                          value={variant.isbn || ""}
                          onChange={(e) => {
                            const newVariants = [...formData.variants];
                            newVariants[index].isbn = e.target.value;
                            setFormData({...formData, variants: newVariants});
                          }}
                        />
                      </div>

                      <div className="form-group">
                        <label>Trạng thái *</label>
                        <select
                          required
                          value={variant.status}
                          onChange={(e) => {
                            const newVariants = [...formData.variants];
                            newVariants[index].status = e.target.value;
                            setFormData({...formData, variants: newVariants});
                          }}
                        >
                          <option value="AVAILABLE">AVAILABLE</option>
                          <option value="OUT_OF_STOCK">OUT_OF_STOCK</option>
                        </select>
                      </div>
                    </div>

                    {/* Upload Image */}
                    <div className="form-group">
                      <label>Hình ảnh</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) handleUploadImage(index, file);
                        }}
                      />
                      
                      {variant.imageUrls && variant.imageUrls.length > 0 && (
                        <div className="image-preview">
                          {variant.imageUrls.map((url, imgIndex) => (
                            <div key={imgIndex} className="preview-item">
                              <img src={url} alt={`Preview ${imgIndex}`} />
                              <button
                                type="button"
                                className="btn-remove-img"
                                onClick={() => {
                                  const newVariants = [...formData.variants];
                                  newVariants[index].imageUrls = newVariants[index].imageUrls.filter((_, i) => i !== imgIndex);
                                  setFormData({...formData, variants: newVariants});
                                }}
                              >
                                <IoClose />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn-primary">
                  {modalMode === "create" ? "Thêm sách" : "Cập nhật"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
