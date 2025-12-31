import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import axios from "axios";

import ex1 from "../../assets/ex1.jpg";
import recommendBanner from "../../assets/banner/recommend-banner.png";

import "../../pages/HomePage/HomePage.css";
import "../../components/Recommend/Recommend.css";

const PAGE_SIZE = 30;

const Recommend = () => {
    const { pathname } = useLocation();

    if (pathname.startsWith("/admin")) return null;

    const [allBooks, setAllBooks] = useState([]);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:8080/api/books/random"
                );
                setAllBooks(response.data || []);
            } catch (error) {
                console.error("Error fetching books:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBooks();
    }, []);

    // 👉 SÁCH THEO TRANG
    const pagedBooks = allBooks.slice(
        page * PAGE_SIZE,
        (page + 1) * PAGE_SIZE
    );

    const totalPages = Math.ceil(allBooks.length / PAGE_SIZE);

    return (
        <main>
            <div className="recommend">
                <img src={recommendBanner} alt="recommend banner" />

                <div className="recommend-detail">
                    {loading ? (
                        Array(PAGE_SIZE)
                            .fill(0)
                            .map((_, index) => (
                                <div key={index} className="book-loading-placeholder">
                                    <div className="loading-img"></div>
                                    <div className="loading-text"></div>
                                </div>
                            ))
                    ) : (
                        pagedBooks.map((book) => {
                            const variant = book.variants?.[0];
                            const imageUrl = variant?.imageUrls?.[0] || ex1;
                            const price = variant?.price || 0;

                            return (
                                <NavLink
                                    key={book.id}
                                    className="book-view"
                                    to={`/books/${book.id}`}
                                >
                                    <img
                                        src={imageUrl}
                                        alt={book.title}
                                        onError={(e) => (e.target.src = ex1)}
                                    />
                                    <div className="label-price">
                                        <h3>{book.title}</h3>
                                        <p className="special-price">
                                            <span className="price-new">
                                                {price.toLocaleString("vi-VN")} đ
                                            </span>
                                        </p>
                                    </div>
                                </NavLink>
                            );
                        })
                    )}
                </div>
                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="pagination mt-625! mb-10!">
                        <button
                            onClick={() => setPage(Math.max(0, page - 1))}
                            disabled={page === 0}
                        >
                            Trước
                        </button>

                        {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                            const pageNum = page > 2 ? page - 2 + i : i;
                            if (pageNum >= totalPages) return null;

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setPage(pageNum)}
                                    className={page === pageNum ? "active" : ""}
                                >
                                    {pageNum + 1}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                            disabled={page === totalPages - 1}
                        >
                            Sau
                        </button>
                    </div>
                )}

            </div>
        </main>
    );
};

export default Recommend;