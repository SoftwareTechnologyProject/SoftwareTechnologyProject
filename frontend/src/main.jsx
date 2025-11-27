import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './main.css'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import HomePage from "./pages/HomePage/HomePage";
import Account from "./pages/Account/Account";
import ProductDetail from "./pages/productDetails/ProductDetail";
import Home from './pages/Home.jsx'
import VoucherManagement from './pages/VoucherManagement/VoucherManagement.jsx'

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/account" element={<Account />} />
        <Route path="/books/:id" element={<ProductDetail />} />
        <Route path="/home" element={<Home />} />
        <Route path="/vouchers" element={<VoucherManagement />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  </StrictMode>
);
