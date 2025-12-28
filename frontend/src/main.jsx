import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './main.css';

// Components
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Recommend from './components/Recommend/Recommend.jsx';
import HeaderAdmin from './components/HeaderAdmin/HeaderAdmin.jsx';
import AccountLayout from './components/AccountLayout/AccountLayout.jsx';
import ChatFloating from "./components/Chatbox/ChatFloating.jsx";
import { PrivateRoute } from './components/PrivateRoute/PrivateRoute.jsx';
import ScrollTop from './components/ScrollTop/ScrollTop.jsx';

// Pages
import HomePage from './pages/HomePage/HomePage';
import Account from './pages/Account/Account.jsx';
import ProductDetail from './pages/Book/ProductDetail';
import VoucherManagement from './pages/VoucherManagement/VoucherManagement.jsx';
import VoucherWallet from './pages/VoucherWallet/VoucherWallet';
import Cart from "./pages/Cart/Cart.jsx";
import Checkout from "./pages/Checkout/Checkout.jsx";
import PaymentResult from "./pages/PaymentResult/PaymentResult.jsx";
import PaymentSuccess from "./pages/PaymentSuccess/PaymentSuccess.jsx";
import PaymentPending from "./pages/PaymentPending/PaymentPending.jsx";
import PaymentFailed from "./pages/PaymentFailed/PaymentFailed.jsx";
import Order from './pages/Order/Order';
import OrderAdmin from './pages/OrderAdmin/OrderAdmin';
import OrderDetail from './pages/OrderDetail/OrderDetail';
import BlogList from './pages/Blog/BlogList';
import BlogDetail from './pages/Blog/BlogDetail';
import BlogAdmin from './pages/Blog/BlogAdmin';
import BookAdmin from './pages/BookAdmin/BookAdmin';
import Login from "./pages/Login/Login.jsx";
import CategoryPage from './pages/Category/CategoryPage';
import SearchResult from './pages/SearchResult/SearchResult.jsx';
import AdminChatBox from "./components/Chatbox/admin/AdminChatBox.jsx";
import TrendPage from "./pages/TrendPage/TrendPage.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ScrollTop />

      <Routes>
        {/* Blog routes */}
        <Route path="/blog" element={
          <>
            <Header />
            <BlogList />
            <Footer />
            <ChatFloating />
          </>
        } />
        <Route path="/blog/posts/:id" element={
          <>
            <Header />
            <BlogDetail />
            <Footer />
            <ChatFloating />
          </>
        } />

        {/* Login page - standalone without Header/Footer */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Login />} />

        {/* Public routes with Header/Footer */}
        <Route path="/" element={
          <>
            <Header />
            <HomePage />
            <Recommend />
            <Footer />
            <ChatFloating />
          </>
        } />

        <Route path="/books/:id" element={
          <>
            <Header />
            <ProductDetail />
            <Recommend />
            <Footer />
            <ChatFloating />
          </>
        } />

        <Route path="/search" element={
          <>
            <Header />
            <SearchResult />
            <Recommend />
            <Footer />
            <ChatFloating />
          </>
        } />

        <Route path="/trend/:trendSlug" element={
          <>
            <Header />
            <TrendPage />
            <Recommend />
            <Footer />
            <ChatFloating />
          </>
        } />

        <Route path="/vouchers" element={
          <>
            <Header />
            <VoucherManagement />
            <Recommend />
            <Footer />
            <ChatFloating />
          </>
        } />

        <Route path="/voucher-management" element={
          <>
            <Header />
            <VoucherManagement />
            <Recommend />
            <Footer />
            <ChatFloating />
          </>
        } />

        {/* Category routes - PHẢI ĐẶT SAU CÁC ROUTES CỤ THỂ */}
        <Route path="/:categorySlug" element={
          <>
            <Header />
            <CategoryPage />
            <Recommend />
            <Footer />
            <ChatFloating />
          </>
        } />

        {/* Account routes - YÊU CẦU ĐĂNG NHẬP */}
        <Route path="/account" element={
          <PrivateRoute>
            <>
              <Header />
              <AccountLayout />
              <Recommend />
              <Footer />
              <ChatFloating />
            </>
          </PrivateRoute>
        }>
          <Route path="accountInf" element={<Account />} />
          <Route path="voucher-wallet" element={<VoucherWallet />} />
          <Route path="order" element={<Order />} />
          <Route path="order/:id" element={<OrderDetail />} />
        </Route>

        {/* Cart and Checkout */}
        <Route path="/cart" element={
          <>
            <Header />
            <Cart />
            <Recommend />
            <Footer />
            <ChatFloating />
          </>}
        ></Route>

        <Route path="/checkout" element={
          <>
            <Header />
            <Checkout />
            <Recommend />
            <Footer />
            <ChatFloating />
          </>}
        ></Route>
        <Route path="/payment/result" element={
          <>
            <Header />
            <PaymentResult />
            <Recommend />
            <Footer />
            <ChatFloating />
          </>}
        ></Route>
        <Route
          path="/payment/success"
          element={<>
            <Header />
            <PaymentSuccess />
            <Recommend />
            <Footer />
            <ChatFloating />
          </>}
        ></Route>
        <Route path="/payment/failed" element={<>
          <Header />
          <PaymentFailed />
          <Recommend />
          <Footer />
          <ChatFloating />
        </>}
        ></Route>
        <Route
          path="/payment/pending"
          element={<>
            <Header />
            <PaymentPending />
            <Recommend />
            <Footer />
            <ChatFloating />
          </>}
        ></Route>

        {/* Admin routes - YÊU CẦU ĐĂNG NHẬP + ROLE ADMIN */}
        <Route path="/admin" element={
          <PrivateRoute requiredRoles={["ADMIN", "STAFF"]}>
            <HeaderAdmin />
          </PrivateRoute>
        }>
          <Route path="books" element={
            <PrivateRoute requiredRole="ADMIN">
              <BookAdmin />
            </PrivateRoute>
          } />
          <Route path="vouchers" element={
            <PrivateRoute requiredRole="ADMIN">
              <VoucherManagement />
            </PrivateRoute>
          } />
          <Route path="blog" element={
            <PrivateRoute requiredRole="STAFF">
              <BlogAdmin />
            </PrivateRoute>
          } />
          <Route path="orderAdmin" element={
            <PrivateRoute requiredRole="STAFF">
              <OrderAdmin />
            </PrivateRoute>
          } />
          <Route path="order/:id" element={
            <PrivateRoute requiredRole="OrderDetail">
              <BookAdmin />
            </PrivateRoute>
          } />
        </Route>

        <Route path="/admin/chat" element={
          <PrivateRoute requiredRole="ADMIN">
            <AdminChatBox />
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
