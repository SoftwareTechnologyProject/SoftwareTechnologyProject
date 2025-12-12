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

// Pages
import HomePage from './pages/HomePage/HomePage';
import Account from './pages/Account/Account.jsx';
import ProductDetail from './pages/Book/ProductDetail.jsx';
import VoucherManagement from './pages/VoucherManagement/VoucherManagement.jsx';
import VoucherWallet from './pages/VoucherWallet/VoucherWallet';
import Order from './pages/Order/Order';
import OrderAdmin from './pages/OrderAdmin/OrderAdmin';
import OrderDetail from './pages/OrderDetail/OrderDetail';
import CategoryPage from './pages/Category/CategoryPage';
import ChatFloating from "./components/Chatbox/ChatFloating.jsx";
import Login from "./pages/login.jsx"

// Component Layout chung cho các trang có Header/Footer
function MainLayout() {
  return (
    <>
      <Header />
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/:categorySlug" element={<CategoryPage />} />
        <Route path="/books/:id" element={<ProductDetail />} />
        <Route path="/vouchers" element={<VoucherManagement />} />

        {/* Account area */}
        <Route path="/account" element={<AccountLayout />}>
          <Route path="accountInf" element={<Account />} />
          <Route path="voucher-wallet" element={<VoucherWallet />} />
          <Route path="order" element={<Order />} />
          <Route path="orderAdmin" element={<OrderAdmin />} />
          <Route path="order/:id" element={<OrderDetail />} />
        </Route>

        {/* Admin (placeholder) */}
        <Route path="/admin" element={<HeaderAdmin />} >
          <Route path="books" element={<Account />} />
        </Route>
      </Routes>

      <Recommend />
      <Footer />
      <ChatFloating />
    </>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Trang LOGIN riêng biệt - không có Header/Footer */}
        <Route path="/login" element={<Login />} />
        
        {/* Tất cả các trang khác có Layout chung */}
        <Route path="*" element={<MainLayout />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
