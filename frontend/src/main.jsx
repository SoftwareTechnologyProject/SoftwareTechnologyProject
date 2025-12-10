import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './main.css'

// Components
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'

// Pages
import HomePage from "./pages/HomePage/HomePage";
import Account from "./pages/Account/Account";
import ProductDetail from "./pages/Book/ProductDetail.jsx";
import VoucherManagement from './pages/VoucherManagement/VoucherManagement.jsx'
import CategoryPage from "./pages/Category/CategoryPage";
// import DashboardPage from './pages/Dashboard/DashboardPage.jsx'

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Header />
      <Routes>
        {/* Routes cũ */}
        <Route path="/" element={<HomePage />} />
        <Route path="/account" element={<Account />} />
        <Route path="/books/:id" element={<ProductDetail />} />
        <Route path="/:categorySlug" element={<CategoryPage />} />

        {/* Routes mới */}
        <Route path="/vouchers" element={<VoucherManagement />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  </StrictMode>
)