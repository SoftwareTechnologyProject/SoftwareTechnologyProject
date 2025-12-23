import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axiosClient from "../../config/axiosConfig";
import { Link } from "react-router-dom";
import ex1 from "../../assets/ex1.jpg";
import "./CategoryPage.css";

const CategoryPage = () => {
  const { categorySlug } = useParams();
  const normalizedSlug = categorySlug?.toLowerCase() || "";
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(32);
  const [sortBy, setSortBy] = useState("newest"); // newest, price-asc, price-desc, trending
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [selectedPublishers, setSelectedPublishers] = useState([]);

  // Mapping slug to category name (all 17 categories from database)
  const categoryMap = {
    "agriculture": "Sách Nông - Lâm - Ngư Nghiệp",           // 108 books
    "manga": "Truyện Tranh, Manga, Comic",                    // 108 books
    "magazines": "Tạp Chí - Catalogue",                       // 108 books
    "cooking": "Ingredients, Methods & Appliances",           // 69 books
    "desserts": "Baking - Desserts",                          // 66 books
    "magazines-alt": "Magazines",                             // 27 books
    "beverages-wine": "Beverages & Wine",                     // 27 books
    "drinks": "Drinks & Beverages",                           // 21 books
    "travel": "Discovery & Exploration",                      // 15 books
    "vietnam": "Vietnam",                                     // 12 books
    "vegetarian": "Vegetarian & Vegan",                       // 9 books
    "anthropology": "Anthropology",                           // 9 books
    "europe": "Europe",                                       // 6 books
    "guidebook": "Guidebook series",                          // 6 books
    "diet": "Diets - Weight Loss - Nutrition",                // 6 books
    "cooking-education": "Cooking Education & Reference",     // 3 books
    "asia": "Asia"                                            // 3 books
  };

  const categoryName = categoryMap[normalizedSlug] || "Sß║ún Phß║⌐m";

  useEffect(() => {
    const fetchBooksByCategory = async () => {
      try {
        setLoading(true);
        // Fetch all books từ API
        // Tăng size để chắc chắn lấy đủ (một category có ~108 sách)
    const response = await axiosClient.get('/api/books?page=0&size=500');
    const allBooks = response.data.value || response.data || [];
        
        // Lọc sách theo category
        const targetCategory = categoryMap[normalizedSlug];
        if (targetCategory) {
          const filteredByCategory = allBooks.filter(book => {
            return book.categoryNames && book.categoryNames.includes(targetCategory);
          });
          setBooks(filteredByCategory);
        } else {
          setBooks(allBooks);
        }
      } catch (err) {
        console.error('Error fetching books:', err);
        setError("Kh├┤ng thß╗â tß║úi sß║ún phß║⌐m. Vui l├▓ng thß╗¡ lß║íi!");
      } finally {
        setLoading(false);
      }
    };

    fetchBooksByCategory();
  }, [normalizedSlug]);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...books];

    // Filter by price
    result = result.filter(book => {
      const price = book.variants?.[0]?.price || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Filter by publisher
    if (selectedPublishers.length > 0) {
      result = result.filter(book => 
        selectedPublishers.includes(book.publisherName)
      );
    }

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
  }, [books, priceRange, selectedPublishers, sortBy]);

  if (loading) {
    return <div className="category-page"><p>─Éang tß║úi...</p></div>;
  }

  if (error) {
    return <div className="category-page"><p className="error">{error}</p></div>;
  }

  // Get unique publishers
  const uniquePublishers = [...new Set(books.map(b => b.publisherName).filter(Boolean))];

  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const paginatedBooks = filteredBooks.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  return (
    <div className="category-page">
      <div className="category-header">
        <h1>{categoryName}</h1>
        <p>{filteredBooks.length} sß║ún phß║⌐m</p>
      </div>

      <div className="category-container">
        {/* Filter Sidebar */}
        <aside className="filter-sidebar">
          <div className="filter-section">
            <h3>Gi├í</h3>
            <div className="price-inputs">
              <input 
                type="number" 
                value={priceRange[0]} 
                onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                placeholder="Tß╗½"
              />
              <span>-</span>
              <input 
                type="number" 
                value={priceRange[1]} 
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 1000000])}
                placeholder="─Éß║┐n"
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
                Tß║Ñt cß║ú gi├í
              </label>
              <label className="checkbox-item">
                <input 
                  type="radio" 
                  name="price" 
                  checked={priceRange[0] === 0 && priceRange[1] === 100000}
                  onChange={() => setPriceRange([0, 100000])}
                />
                D╞░ß╗¢i 100K
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
                Tr├¬n 300K
              </label>
            </div>
          </div>

          <div className="filter-section">
            <h3>Nh├á cung cß║Ñp</h3>
            <div className="publishers-list">
              {uniquePublishers.map(publisher => (
                <label key={publisher} className="checkbox-item">
                  <input 
                    type="checkbox" 
                    checked={selectedPublishers.includes(publisher)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPublishers([...selectedPublishers, publisher]);
                      } else {
                        setSelectedPublishers(selectedPublishers.filter(p => p !== publisher));
                      }
                    }}
                  />
                  {publisher}
                </label>
              ))}
            </div>
          </div>

          <button className="btn-clear-filter" onClick={() => {
            setPriceRange([0, 1000000]);
            setSelectedPublishers([]);
            setSortBy('newest');
          }}>
            X├│a lß╗ìc
          </button>
        </aside>

        {/* Products Container */}
        <section className="products-section">
          {/* Toolbar */}
          <div className="products-toolbar">
            <div className="sort-container">
              <label htmlFor="sort">Sß║»p xß║┐p:</label>
              <select id="sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="newest">Mß╗¢i nhß║Ñt</option>
                <option value="price-asc">Gi├í: Thß║Ñp ─æß║┐n cao</option>
                <option value="price-desc">Gi├í: Cao ─æß║┐n thß║Ñp</option>
              </select>
            </div>
              <div className="items-per-page">
                <label htmlFor="items">Hiß╗ân thß╗ï:</label>
                <select id="items" value={itemsPerPage} onChange={(e) => setItemsPerPage(parseInt(e.target.value))}>
                  <option value={5}>5 sß║ún phß║⌐m</option>
                  <option value={10}>10 sß║ún phß║⌐m</option>
                  <option value={15}>15 sß║ún phß║⌐m</option>
                  <option value={20}>20 sß║ún phß║⌐m</option>
                </select>
              </div>
          </div>

          {paginatedBooks.length === 0 ? (
            <div className="no-products">
              <p>Kh├┤ng c├│ sß║ún phß║⌐m n├áo ph├╣ hß╗úp vß╗¢i bß╗Ö lß╗ìc cß╗ºa bß║ín.</p>
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
                          <span className="price-new">{price.toLocaleString('vi-VN')} ─æ</span>
                          <span className="price-old">{oldPrice.toLocaleString('vi-VN')} ─æ</span>
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
                    Tr╞░ß╗¢c
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

export default CategoryPage;
