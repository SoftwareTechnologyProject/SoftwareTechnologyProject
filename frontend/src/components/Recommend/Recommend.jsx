import React, { useState, useEffect } from "react"
import { NavLink } from "react-router-dom";

import ex1 from "../../assets/ex1.jpg";
import recommendBanner from "../../assets/banner/recommend-banner.png";

import "../../pages/HomePage/HomePage.css";
import "../../components/Recommend/Recommend.css";

const Recommend = () => {

    const listTrend = [
        { id: 1, img: ex1, link: "/books/1", title: "Doraemon - Movie Story Màu - Nobita Và Những Hiệp Sĩ Không Gian", oldPrice: "40.000 đ", newPrice: "36.000 đ", discount: "-10%" },
        { id: 2, img: ex1, link: "/books/2", title: "One Piece - Tập 1: Romance Dawn", oldPrice: "35.000 đ", newPrice: "31.500 đ", discount: "-10%" },
        { id: 3, img: ex1, link: "/books/3", title: "Naruto - Tập 1: Uzumaki Naruto", oldPrice: "30.000 đ", newPrice: "27.000 đ", discount: "-10%" },
        { id: 4, img: ex1, link: "/books/4", title: "Attack on Titan - Tập 1", oldPrice: "45.000 đ", newPrice: "40.500 đ", discount: "-10%" },
        { id: 5, img: ex1, link: "/books/5", title: "Dragon Ball - Tập 1", oldPrice: "32.000 đ", newPrice: "28.800 đ", discount: "-10%" },
        { id: 6, img: ex1, link: "/books/6", title: "Detective Conan - Tập 1", oldPrice: "38.000 đ", newPrice: "34.200 đ", discount: "-10%" },
        { id: 7, img: ex1, link: "/books/7", title: "Demon Slayer - Tập 1", oldPrice: "42.000 đ", newPrice: "37.800 đ", discount: "-10%" },
        { id: 8, img: ex1, link: "/books/8", title: "My Hero Academia - Tập 1", oldPrice: "36.000 đ", newPrice: "32.400 đ", discount: "-10%" },
        { id: 9, img: ex1, link: "/books/9", title: "Jujutsu Kaisen - Tập 1", oldPrice: "44.000 đ", newPrice: "39.600 đ", discount: "-10%" },
        { id: 10, img: ex1, link: "/books/10", title: "Chainsaw Man - Tập 1", oldPrice: "41.000 đ", newPrice: "36.900 đ", discount: "-10%" }
    ];

    return (
        <>
            <main>
                <div className="recommend">
                    <img src={recommendBanner} alt="recommend banner" />
                    <div className="recommend-detail">
                        {listTrend.map((item, index) => (
                            <NavLink key={index} to={item.link}>
                                <img src={item.img} alt="" className="w-full h-auto" />
                                <div className="label-price">
                                    <h3>{item.title}</h3>
                                    <p className="special-price">
                                        <span className="price-new">{item.newPrice}</span>
                                        <span className="percent-discount">{item.discount}</span>
                                    </p>
                                    <span className="price-old">{item.oldPrice}</span>
                                </div>
                            </NavLink>
                        ))}
                    </div>

                    <div className="button-more mt-65">
                        <NavLink to="#" className="flex gap-2">
                            Xem Tất Cả
                        </NavLink>
                    </div>
                </div>
            </main>
        </>
    )
}

export default Recommend;