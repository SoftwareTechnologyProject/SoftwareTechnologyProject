import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './main.css';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import AccountLayout from './components/AccountLayout/AccountLayout.jsx';
import HomePage from "./pages/HomePage/HomePage";
import Account from "./pages/Account/Account.jsx";
import ProductDetail from "./pages/productDetails/ProductDetail";
import VoucherManagement from './pages/VoucherManagement/VoucherManagement.jsx';
import Recommend from './components/Recommend/Recommend.jsx';
import VoucherWallet from './pages/VoucherWallet/VoucherWallet';
import Order from './pages/Order/Order';
import OrderAdmin from './pages/OrderAdmin/OrderAdmin';
import OrderDetail from './pages/OrderDetail/OrderDetail';
import HeaderAdmin from "./components/HeaderAdmin/HeaderAdmin.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Header />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/account" element={<AccountLayout />}>
          <Route path="accountInf" element={<Account />} />
          <Route path="voucher-wallet" element={<VoucherWallet />} />
          <Route path="order" element={<Order />} />
          <Route path="orderAdmin" element={<OrderAdmin />} />
          <Route path="order/:id" element={<OrderDetail />} />
        </Route>

        {/* Admin */}
        <Route path="/admin" element={<HeaderAdmin />} >
          <Route path="books" element={<Account />} />
        </Route>
        <Route path="/books/:id" element={<ProductDetail />} />
        
      </Routes>

      <Recommend />
      <Footer />
    </BrowserRouter>
  </StrictMode>
);
