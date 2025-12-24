import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import banner1 from "../../assets/banner/banner-1.png";
import banner2 from "../../assets/banner/banner-3.png";
import banner3 from "../../assets/banner/banner-5.png";
import bannerMomo from "../../assets/banner/banner-momo.png";
import bannerVnpay from "../../assets/banner/banner-vnpay.png";

import discovery from "../../assets/logo/discovery.png";
import baking from "../../assets/logo/baking.png";
import agriculture from "../../assets/logo/agriculture.png";
import manga from "../../assets/logo/manga.png";
import catalogue from "../../assets/logo/catalogue.png";
import vnHistory from "../../assets/logo/vnHistory.png";

import card1 from "../../assets/gift-card/card-1.jpg";
import ex1 from "../../assets/ex1.jpg";

import { BsGrid } from "react-icons/bs";
import { IoGiftOutline } from "react-icons/io5";
import { FaArrowTrendUp } from "react-icons/fa6";
import { RiBook3Line } from "react-icons/ri";

import "./HomePage.css";

const banners = [banner3, banner2, banner1];

const catalog = [
    { img: discovery, link: "/travel", content: "Discovery & Exploration" },
    { img: baking, link: "/desserts", content: "Baking - Desserts" },
    { img: agriculture, link: "/agriculture", content: "Sách Nông - Lâm - Ngư Nghiệp" },
    { img: manga, link: "/manga", content: "Manga" },
    { img: catalogue, link: "/magazines", content: "Tạp Chí" },
    { img: vnHistory, link: "/vietnam", content: "Việt Nam" },
];

const giftCard = Array(9).fill({ img: card1, link: "/card1" });

const listTrend = Array(10).fill({
    img: ex1,
    link: "/ex1",
    title: "Doraemon - Movie Story Màu - Nobita Và Những Hiệp Sĩ Không Gian",
    oldPrice: "40.000 đ",
    newPrice: "36.000 đ",
    discount: "-10%",
});

const comboTrend = Array(20).fill({
    img: ex1,
    link: "/ex1",
    title: "Doraemon - Movie Story Màu - Nobita Và Những Hiệp Sĩ Không Gian",
    oldPrice: "40.000 đ",
    newPrice: "36.000 đ",
    discount: "-10%",
});

const HomePage = () => {
    const [index, setIndex] = useState(0);
    const [giftIndex, setGiftIndex] = useState(0);
    const totalGiftSlides = Math.ceil(giftCard.length / 3);
    const [comboIndex, setComboIndex] = useState(0);
    const totalComboTrendSlides = Math.ceil(comboTrend.length / 5);

    // State for real book data
    const [trendingBooks, setTrendingBooks] = useState([]);
    const [featuredBooks, setFeaturedBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const category = "Truyện Tranh, Manga, Comic";

    useEffect(() => {
        const fetchTrendingManga = async () => {
            try {
                const response = await axios.get("http://localhost:8080/api/books/trendingManga", {
                                         params: {
                                           category,
                                           page: 0,
                                           size: 20
                                         }
                                       });

                const books = response.data?.content || [];

                setFeaturedBooks(books.slice(0, 20));
            } catch (error) {
                console.error('Error fetching books:', error);
                setFeaturedBooks(comboTrend);
            } finally {
                setLoading(false);
            }
        };

        fetchTrendingManga();
    }, []);
    // Fetch books from API
    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/books?page=0&size=20');
                const books = response.data?.content || [];
                console.log(books);

                // Use first 10 books for trending
                setTrendingBooks(books.slice(0, 10));
            } catch (error) {
                console.error('Error fetching books:', error);
                // Keep static data as fallback
                setTrendingBooks(listTrend);
            } finally {
                setLoading(false);
            }
        };

        fetchBooks();
    }, []);

    // Auto slide
    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % banners.length);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setGiftIndex((prev) => (prev + 1) % totalGiftSlides);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <main>
                <div className="banner-container">
                    <div className="elite-banner">
                        <Link to="#">
                            <img src={banners[index]} alt="Auto banner" />
                        </Link>

                        <button onClick={() => setIndex((index - 1 + banners.length) % banners.length)} className="arrow-left">
                            ❮
                        </button>

                        <button onClick={() => setIndex((index + 1) % banners.length)} className="arrow-right">
                            ❯
                        </button>

                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                            {banners.map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-3 h-3 rounded-full transition-all duration-300 ${i === index
                                        ? "bg-[#b20000] w-10"
                                        : "bg-[var(--components-color)]"
                                        }`}
                                ></div>
                            ))}
                        </div>
                    </div>

                    <div className="pay-banner">
                        <Link to="#"><img src={bannerMomo} alt="banner Momo" /></Link>
                        <Link to="#"><img src={bannerVnpay} alt="banner Vnpay" /></Link>
                    </div>
                </div>

                {/* ======================= Catalog ========================= */}
                <div className="product-catalog">
                    <div className="title-content">
                        <BsGrid className="icon-title" />
                        <h1>Danh Mục Sản Phẩm</h1>
                    </div>

                    <div className="catalog-detail">
                        {catalog.map((item, index) => (
                            <Link key={index} to={item.link}>
                                <img src={item.img} alt="" className="w-full h-auto" />
                                <span>{item.content}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* ======================= Gift Card ========================= */}
                <div className="product-catalog">
                    <div className="title-content border-none">
                        <IoGiftOutline className="icon-title" />
                        <h1>Phiếu Quà Tặng - Gift Card</h1>
                    </div>

                    <div className="gift-card">

                        <div
                            className="auto-slide"
                            style={{
                                transform: `translateX(-${giftIndex * 100}%)`,
                                width: `${totalGiftSlides * 100}%`
                            }}
                        >
                            {Array.from({ length: totalGiftSlides }).map((_, groupIndex) => (
                                <div key={groupIndex} className="card">
                                    {giftCard
                                        .slice(groupIndex * 3, groupIndex * 3 + 3)
                                        .map((item, idx) => (
                                            <Link key={idx} to={item.link}>
                                                <img src={item.img} alt="" className="w-full h-auto rounded-xl" />
                                            </Link>
                                        ))}
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() =>
                                setGiftIndex((giftIndex - 1 + totalGiftSlides) % totalGiftSlides)
                            }
                            className="arrow-left"
                        >
                            ❮
                        </button>

                        <button
                            onClick={() =>
                                setGiftIndex((giftIndex + 1) % totalGiftSlides)
                            }
                            className="arrow-right"
                        >
                            ❯
                        </button>

                    </div>

                    <div className="button-more">
                        <Link to="#">Xem Thêm</Link>
                    </div>
                </div>

                {/* ====================== Trending =================== */}
                <div className="trending">
                    <div className="title-trending">
                        <FaArrowTrendUp className="icon-title" />
                        <h1>Xu Hướng Mua Sắm</h1>
                    </div>

                    <div className="trend-detail">
                        {loading ? (
                            // Loading placeholder
                            Array(10).fill(0).map((_, index) => (
                                <div key={index} className="book-loading-placeholder">
                                    <div className="loading-img"></div>
                                    <div className="loading-text"></div>
                                </div>
                            ))
                        ) : (
                            trendingBooks.map((book, index) => {
                                const variant = book.variants?.[0];
                                const imageUrl = variant?.imageUrls?.[0] || ex1;
                                const price = variant?.price || 0;
                                const oldPrice = price * 1.1; // Mock old price

                                return (
                                    <Link className="book-view" key={book.id || index} to={`/books/${book.id}`}>
                                        <img
                                            src={imageUrl}
                                            alt={book.title}
                                            onError={(e) => {
                                                e.target.src = ex1;
                                            }}
                                        />
                                        <div className="description">
                                            <div className="label-price">
                                                <h3>{book.title}</h3>
                                                <p className="special-price">
                                                    <span className="price-new">{price.toLocaleString('vi-VN')} đ</span>
                                                    <span className="percent-discount">-10%</span>
                                                </p>
                                                <span className="price-old">{oldPrice.toLocaleString('vi-VN')} đ</span>
                                            </div>
                                            <div className="progress-bar">
                                                <span> Đã Bán {book.variants?.[0]?.sold ?? 0}</span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })
                        )}
                    </div>

                    <div className="button-more">
                        <Link to="/trend/xu-huong">Xem thêm</Link>
                    </div>
                </div>

                {/* ====================== Combo Trending =================== */}
                <div className="combo-trending">
                    <div className="title-trending">
                        <RiBook3Line className="icon-title" />
                        <h1>Manga Trending</h1>
                    </div>

                    <div className="combo-slide">
                        <div
                            className="combo-transform"
                            style={{
                                width: `${totalComboTrendSlides * 100}%`,
                                transform: `translateX(-${comboIndex * 25}%)`,
                            }}
                        >
                            {Array.from({ length: Math.ceil(featuredBooks.length / 5) }).map((_, groupIdx) => (
                                <div key={groupIdx} className="combo-detail">
                                    {featuredBooks
                                        .slice(groupIdx * 5, groupIdx * 5 + 5)
                                        .map((book, idx) => {
                                            const variant = book.variants?.[0];
                                            const imageUrl = variant?.imageUrls?.[0] || ex1;
                                            const price = variant?.price || 0;
                                            const oldPrice = price * 1.15;

                                            return (
                                                <Link className="w-[20%] book-view" key={book.id || idx} to={`/books/${book.id}`}>
                                                    <img
                                                        src={imageUrl}
                                                        alt={book.title}
                                                        onError={(e) => {
                                                            e.target.src = ex1;
                                                        }}
                                                    />

                                                    <div className="description">
                                                        <div className="label-price">
                                                            <h3>{book.title}</h3>
                                                            <p className="special-price">
                                                                <span className="price-new">{price.toLocaleString('vi-VN')} đ</span>
                                                                <span className="percent-discount">-10%</span>
                                                            </p>
                                                            <span className="price-old">{oldPrice.toLocaleString('vi-VN')} đ</span>
                                                        </div>
                                                        <div className="progress-bar">
                                                            <span> Đã Bán {book.variants?.[0]?.sold ?? 0}</span>
                                                        </div>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                </div>
                            ))}
                        </div>

                        {comboIndex > 0 && (
                            <button
                                className="arrow-left !bg-[var(--primary-color)] !text-[var(--components-color)]"
                                onClick={() => setComboIndex(comboIndex - 1)}
                            >
                                ❮
                            </button>
                        )}

                        {comboIndex < totalComboTrendSlides - 1 && (
                            <button
                                className="arrow-right !bg-[var(--primary-color)] !text-[var(--components-color)]"
                                onClick={() => setComboIndex(comboIndex + 1)}
                            >
                                ❯
                            </button>
                        )}
                    </div>

                    <div className="button-more mt-4">
                        <Link to="/trend/manga-trending">Xem thêm</Link>
                    </div>
                </div>
            </main>
        </>
    );
};

export default HomePage;
