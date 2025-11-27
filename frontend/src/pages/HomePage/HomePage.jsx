import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import banner1 from "../../assets/banner/banner-1.png";
import banner2 from "../../assets/banner/banner-3.png";
import banner3 from "../../assets/banner/banner-5.png";
import bannerMomo from "../../assets/banner/banner-momo.png";
import bannerVnpay from "../../assets/banner/banner-vnpay.png";
import recommendBanner from "../../assets/banner/recommend-banner.png";

import child from "../../assets/logo/child.png";
import foreign from "../../assets/logo/foreign.png";
import language from "../../assets/logo/language.png";
import literature from "../../assets/logo/literature.png";
import sgk from "../../assets/logo/sgk.png";
import skill from "../../assets/logo/skill.png";
import vnHistory from "../../assets/logo/vnHistory.png";
import paper from "../../assets/logo/paper.png";

import card1 from "../../assets/gift-card/card-1.jpg";
import ex1 from "../../assets/ex1.jpg";

import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';

import { BsGrid } from "react-icons/bs";
import { IoGiftOutline } from "react-icons/io5";
import { FaArrowTrendUp } from "react-icons/fa6";
import { RiBook3Line } from "react-icons/ri";

import "./HomePage.css";

const banners = [banner1, banner2, banner3];

const catalog = [
    { img: paper, link: "/paper", content: "Giấy Photo" },
    { img: child, link: "/child-books", content: "Thiếu Nhi" },
    { img: foreign, link: "/foreign-books", content: "Ngoại Văn" },
    { img: language, link: "/language", content: "Sách Học Ngoại Ngữ" },
    { img: literature, link: "/literature", content: "Văn Học" },
    { img: sgk, link: "/textbooks", content: "SGK 2026" },
    { img: skill, link: "/skills", content: "Tâm Lý Kỹ Năng" },
    { img: vnHistory, link: "/vietnam-history", content: "Lịch Sử Việt Nam" },
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
            <Header />

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
                        {listTrend.map((item, index) => (
                            <Link key={index} to={item.link}>
                                <img src={item.img} alt="" className="w-full h-auto" />
                                <div className="label-price">
                                    <h3>{item.title}</h3>
                                    <p className="special-price">
                                        <span className="price-new">{item.newPrice}</span>
                                        <span className="percent-discount">{item.discount}</span>
                                    </p>
                                    <span className="price-old">{item.oldPrice}</span>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div className="button-more">
                        <Link to="#">Xem Thêm</Link>
                    </div>
                </div>

                {/* ====================== Combo Trending =================== */}
                <div className="combo-trending">
                    <div className="title-trending">
                        <RiBook3Line className="icon-title" />
                        <h1>Combo Trending</h1>
                    </div>

                    <div className="combo-slide">
                        <div
                            className="combo-transform"
                            style={{
                                width: `${totalComboTrendSlides * 100}%`,
                                transform: `translateX(-${comboIndex * 25}%)`,
                            }}
                        >
                            {Array.from({ length: totalComboTrendSlides }).map((_, groupIdx) => (
                                <div key={groupIdx} className="combo-detail">
                                    {comboTrend
                                        .slice(groupIdx * 5, groupIdx * 5 + 5)
                                        .map((item, idx) => (
                                            <Link key={idx} to={item.link}>
                                                <img src={item.img} alt="" />
                                                <div className="label-price">
                                                    <h3>{item.title}</h3>
                                                    <p className="special-price">
                                                        <span className="price-new">{item.newPrice}</span>
                                                        <span className="percent-discount">{item.discount}</span>
                                                    </p>
                                                    <span className="price-old">{item.oldPrice}</span>
                                                </div>
                                            </Link>
                                        ))}
                                </div>
                            ))}
                        </div>

                        {comboIndex > 0 && (
                            <button
                                className="arrow-left"
                                onClick={() => setComboIndex(comboIndex - 1)}
                            >
                                ❮
                            </button>
                        )}

                        {comboIndex < totalComboTrendSlides - 1 && (
                            <button
                                className="arrow-right"
                                onClick={() => setComboIndex(comboIndex + 1)}
                            >
                                ❯
                            </button>
                        )}
                    </div>

                    <div className="button-more">
                        <Link to="#">Xem Thêm</Link>
                    </div>
                </div>

                {/* ====================== Recommend =================== */}
                <div className="recommend">
                    <img src={recommendBanner} alt="recommend banner" />

                    <div className="recommend-detail">
                        {listTrend.map((item, index) => (
                            <Link key={index} to={item.link}>
                                <img src={item.img} alt="" className="w-full h-auto" />
                                <div className="label-price">
                                    <h3>{item.title}</h3>
                                    <p className="special-price">
                                        <span className="price-new">{item.newPrice}</span>
                                        <span className="percent-discount">{item.discount}</span>
                                    </p>
                                    <span className="price-old">{item.oldPrice}</span>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div className="button-more mt-65">
                        <Link to="#" className="flex gap-2">
                            Xem Tất Cả
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
};

export default HomePage;
