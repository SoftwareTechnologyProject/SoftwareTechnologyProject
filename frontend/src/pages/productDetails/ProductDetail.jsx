import React, { useState } from "react";
import "./BookDetail.css";

export default function BookDetail() {
  const [quantity, setQuantity] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("Ngôi Làng Tuyết");

  const book = {
    title: "Phiếu Quà Tặng - Gift Card Mệnh Giá 100K - Ngôi Làng Tuyết",
    rating: 5,
    ratingCount: 4,
    sold: 7,
    price: 100000,
    shippingInfo: {
      address: "Phường Mỹ Hòa, TP Long Xuyên, An Giang",
      method: "Giao hàng tiêu chuẩn",
      deliveryDate: "Thứ năm - 20/11",
    },
    promotions: [
      "Shopeepay: giảm 15%",
      "Zalopay: giảm 15%",
      "VPbank: giảm 50%",
      "Hộp quà tặng đặc biệt",
    ],
    categories: ["Ông Già Noel", "Người Tuyết", "Xe Lửa", "Ngôi Làng Tuyết"],
    productInfo: {
      code: "gc100noel25-mau4",
      supplier: "Cty PHS TP.HCM - Fahasa",
      weight: 100,
      size: "8.5 x 5.5 x 0.1 cm",
      bestsellerLink: "#",
    },
    description:
      `Thẻ Quà Tặng FAHASA - Mở Ra Thế Giới Tri Thức\n
Gift Card FAHASA là phiên bản Phiếu Quà Tặng hiện đại, sử dụng được tại hệ thống Nhà sách FAHASA trên toàn quốc và trực tuyến tại trang fahasa.com.\n
Với thiết kế nhỏ gọn, sang trọng và tiện lợi, Gift Card là lựa chọn tinh tế để tặng trong các dịp lễ hội, sinh nhật, tri ân khách hàng / đối tác hay phần thưởng nhân viên.\n
Ưu điểm nổi bật của Thẻ quà tặng:\n
1. Quà tặng tinh tế\n
Thiết kế sang trọng, nhỏ gọn, chất liệu bền đẹp, phù hợp mọi đối tượng.\n
2. Mẫu mã đa dạng\n
Nhiều mẫu thiết kế đẹp mắt để lựa chọn.\n
3. Tiện lợi\n
Dễ dàng sử dụng cho tất cả các sản phẩm tại Fahasa.\n`,
    reviews: [
      {
        name: "LAM THI ANH",
        date: "07/11/2025",
        rating: 5,
        content:
          "Mình mua 5 thẻ, Fahasa giao đủ số lượng, sản phẩm rất oke nha, chất giấy khá dày. Giao hàng nhanh còn nhanh nữa. Rất đáng mua.",
      },
      {
        name: "Thien Thu",
        date: "05/11/2025",
        rating: 5,
        content:
          "Cảm cái thẻ trên tay mà nón quả trời ơi, Giáng Sinh sắp tới rồi kìa. Sao Fahasa có thể phát hành những cái thẻ xinh mà tiện quá zị.",
      },
      {
        name: "Son Huynh",
        date: "03/11/2025",
        rating: 5,
        content:
          "Cái tui ưng nhất là thiết kế này luôn á, đang đau đầu mua gì tặng dịp Giáng Sinh, thôi mua cái này cho tiện. Người nhận tùy ý sử dụng vì FAHASA có rất rất nhiều thứ. Mười điểm ko có nhùng nhé.",
      },
    ],
  };

  const changeQuantity = (delta) => {
    setQuantity((q) => Math.max(1, q + delta));
  };

  return (
    <div className="book-detail-fahasa">
      <div className="left-panel">
        <div className="main-image">
          <img src="/assets/giftcard_main.jpg" alt={book.title} />
        </div>
        <div className="thumbnail-list">
          <img src="/assets/giftcard_1.jpg" alt="giftcard 1" />
          <img src="/assets/giftcard_2.jpg" alt="giftcard 2" />
          <img src="/assets/giftcard_3.jpg" alt="giftcard 3" />
          <div className="more-thumbs">+1</div>
        </div>
        <div className="buttons">
          <button className="btn-cart">Thêm vào giỏ hàng</button>
          <button className="btn-buy">Mua ngay</button>
        </div>
        <div className="policies">
          <p>🚚 Thời gian giao hàng: Giao nhanh và uy tín</p>
          <p>🔄 Chính sách đổi trả: Đổi trả miễn phí toàn quốc</p>
          <p>⭐ Chính sách khách sỉ: Ưu đãi khi mua số lượng lớn</p>
        </div>
      </div>

      <div className="right-panel">
        <h2>{book.title}</h2>
        <div className="rating-sold">
          <div className="rating">
            ⭐ {book.rating} ({book.ratingCount} đánh giá)
          </div>
          <div className="sold">Đã bán {book.sold}</div>
        </div>

        <div className="price-section">
          <div className="price">{book.price.toLocaleString()} đ</div>
          <div className="vat-info">Sản phẩm này không xuất hóa đơn VAT</div>
        </div>

        <div className="shipping-info">
          <h3>Thông tin vận chuyển</h3>
          <p>
            Giao hàng đến: <b>{book.shippingInfo.address}</b> <span className="change">Thay đổi</span>
          </p>
          <p>🚚 {book.shippingInfo.method}</p>
          <p>Dự kiến giao {book.shippingInfo.deliveryDate}</p>
        </div>

        <div className="promotions">
          <h3>Ưu đãi liên quan</h3>
          <div className="promo-list">
            {book.promotions.map((promo, i) => (
              <div key={i} className="promo-item">{promo}</div>
            ))}
          </div>
        </div>

        <div className="categories">
          <h3>Phân loại:</h3>
          <div className="category-buttons">
            {book.categories.map((cat) => (
              <button
                key={cat}
                className={cat === selectedCategory ? "active" : ""}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="quantity">
          <h3>Số lượng:</h3>
          <div className="qty-control">
            <button onClick={() => changeQuantity(-1)}>-</button>
            <input type="number" readOnly value={quantity} />
            <button onClick={() => changeQuantity(1)}>+</button>
          </div>
        </div>

        <div className="product-info-detail">
          <h3>Thông tin chi tiết</h3>
          <table>
            <tbody>
              <tr>
                <td>Mã hàng</td>
                <td>{book.productInfo.code}</td>
              </tr>
              <tr>
                <td>Nhà cung cấp</td>
                <td><a href="#">{book.productInfo.supplier}</a></td>
              </tr>
              <tr>
                <td>Trọng lượng (gr)</td>
                <td>{book.productInfo.weight}</td>
              </tr>
              <tr>
                <td>Kích Thước Bao Bì</td>
                <td>{book.productInfo.size}</td>
              </tr>
              <tr>
                <td>Sản phẩm bán chạy nhất</td>
                <td><a href={book.productInfo.bestsellerLink}>Top 100 sản phẩm bán chạy của tháng</a></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="description">
          <h3>Mô tả sản phẩm</h3>
          <p style={{whiteSpace: 'pre-line'}}>{book.description}</p>
        </div>

        <div className="reviews">
          <h3>Đánh giá sản phẩm</h3>
          <div className="rating-summary">
            <div className="avg-rating">
              <div className="score">{book.rating}/5</div>
              <div className="stars">⭐⭐⭐⭐⭐</div>
              <div>{book.ratingCount} đánh giá</div>
            </div>
            <div className="rating-bars">
              {[5,4,3,2,1].map((star) => (
                <div key={star} className="bar-row">
                  <span>{star} sao</span>
                  <div className="bar">
                    <div className="fill" style={{width: star === 5 ? "100%" : "0%"}}></div>
                  </div>
                  <span>{star === 5 ? "100%" : "0%"}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="review-list">
            {book.reviews.map((rev, i) => (
              <div key={i} className="review">
                <div className="rev-header">
                  <b>{rev.name}</b> <span>{rev.date}</span> <span className="stars">{"⭐".repeat(rev.rating)}</span>
                </div>
                <p>{rev.content}</p>
                <div className="rev-footer">
                  <button>Thích (0)</button>
                  <button>Báo cáo</button>
                </div>
              </div>
            ))}
          </div>

          <button className="write-review">✏️ Viết đánh giá</button>
        </div>
      </div>
    </div>
  );
}