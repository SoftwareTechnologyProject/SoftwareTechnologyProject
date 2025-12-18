import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import ex1 from "../../assets/ex1.jpg";
import "./SearchResult.css";

const SearchResult = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [sortBy, setSortBy] = useState("newest"); // newest, price-asc, price-desc, trending
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get("keyword");
  const page = searchParams.get("page") || 0;

  useEffect(() => {
    const fetchBooksByKey = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8080/api/books/searchKey',           {
            params: {
              keyWord: keyword,
              page: page,
              size: 500
            }
          });
        const allBooks = response.data.content || [];
        setBooks(allBooks);
      } catch (err) {
        console.error('Error fetching books:', err);
        setError("Không thể tải sản phẩm. Vui lòng thử lại!");
      } finally {
        setLoading(false);
      }
    };

    fetchBooksByKey();
  }, [keyword]);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...books];

    // Filter by price
    result = result.filter(book => {
      const price = book.variants?.[0]?.price || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Sort
    switch(sortBy) {
      case 'price-asc':
        result.sort((a, b) => (a.variants?.[0]?.price || 0) - (b.variants?.[0]?.price || 0));
        break;
      case 'price-desc':
        result.sort((a, b) => (b.variants?.[0]?.price || 0) - (a.variants?.[0]?.price || 0));
        break;
      case 'newest':
        result.sort((a, b) => b.id - a.id);
        break;
      default:
        break;
    }

    setFilteredBooks(result);
    setCurrentPage(0);
  }, [books, priceRange, sortBy]);

  if (loading) {
    return <div className="category-page"><p>Đang tải...</p></div>;
  }

  if (error) {
    return <div className="category-page"><p className="error">{error}</p></div>;
  }

  // Get unique publishers
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const paginatedBooks = filteredBooks.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  return (
    <div className="category-page">
      <div className="category-header">
        <h1>Kết Quả Tìm Kiếm</h1>
        <p>{filteredBooks.length} sản phẩm</p>
      </div>

      <div className="category-container">
        {/* Filter Sidebar */}
        <aside className="filter-sidebar">
          <div className="filter-section">
            <h3>Giá</h3>
            <div className="price-inputs">
              <input 
                type="number" 
                value={priceRange[0]} 
                onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                placeholder="Từ"
              />
              <span>-</span>
              <input 
                type="number" 
                value={priceRange[1]} 
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 1000000])}
                placeholder="Đến"
              />
            </div>
            <div className="price-ranges">
              <label className="checkbox-item">
                <input 
                  type="radio" 
                  name="price" 
                  checked={priceRange[0] === 0 && priceRange[1] === 1000000}
                  onChange={() => setPriceRange([0, 1000000])}
                />
                Tất cả giá
              </label>
              <label className="checkbox-item">
                <input 
                  type="radio" 
                  name="price" 
                  checked={priceRange[0] === 0 && priceRange[1] === 100000}
                  onChange={() => setPriceRange([0, 100000])}
                />
                Dưới 100K
              </label>
              <label className="checkbox-item">
                <input 
                  type="radio" 
                  name="price" 
                  checked={priceRange[0] === 100000 && priceRange[1] === 300000}
                  onChange={() => setPriceRange([100000, 300000])}
                />
                100K - 300K
              </label>
              <label className="checkbox-item">
                <input 
                  type="radio" 
                  name="price" 
                  checked={priceRange[0] === 300000 && priceRange[1] === 1000000}
                  onChange={() => setPriceRange([300000, 1000000])}
                />
                Trên 300K
              </label>
            </div>
          </div>

          <button className="btn-clear-filter" onClick={() => {
            setPriceRange([0, 1000000]);
            setSortBy('newest');
          }}>
            Xóa lọc
          </button>
        </aside>

        {/* Products Container */}
        <section className="products-section">
          {/* Toolbar */}
          <div className="products-toolbar">
            <div className="sort-container">
              <label htmlFor="sort">Sắp xếp:</label>
              <select id="sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="newest">Mới nhất</option>
                <option value="price-asc">Giá: Thấp đến cao</option>
                <option value="price-desc">Giá: Cao đến thấp</option>
              </select>
            </div>

            <div className="items-per-page">
              <label htmlFor="items">Hiển thị:</label>
              <select id="items" value={itemsPerPage} onChange={(e) => setItemsPerPage(parseInt(e.target.value))}>
                <option value={5}>5 sản phẩm</option>
                <option value={10}>10 sản phẩm</option>
                <option value={15}>15 sản phẩm</option>
                <option value={20}>20 sản phẩm</option>
              </select>
            </div>
          </div>

          {paginatedBooks.length === 0 ? (
            <div className="no-products">
              <p>Không có sản phẩm nào phù hợp với bộ lọc của bạn.</p>
            </div>
          ) : (
            <>
              <div className="products-grid">
                {paginatedBooks.map((book, index) => {
                  const variant = book.variants?.[0];
                  const imageUrl = variant?.imageUrls?.[0] || ex1;
                  const price = variant?.price || 0;
                  const oldPrice = Math.round(price * 1.1);

                  return (
                    <Link key={book.id || index} to={`/books/${book.id}`} className="product-card">
                      <div className="product-image">
                        <img
                          src={imageUrl}
                          alt={book.title}
                          onError={(e) => {
                            e.target.src = ex1;
                          }}
                        />
                      </div>
                      <div className="product-info">
                        <h3>{book.title?.substring(0, 50) + (book.title?.length > 50 ? '...' : '')}</h3>
                        <p className="author">{book.authorNames?.join(", ")}</p>
                        <div className="price-section">
                          <span className="price-new">{price.toLocaleString('vi-VN')} đ</span>
                          <span className="price-old">{oldPrice.toLocaleString('vi-VN')} đ</span>
                          <span className="discount">-10%</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                  >
                    Trước
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                    const pageNum = currentPage > 2 ? currentPage - 2 + i : i;
                    if (pageNum >= totalPages) return null;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={currentPage === pageNum ? 'active' : ''}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage === totalPages - 1}
                  >
                    Sau
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default SearchResult;
