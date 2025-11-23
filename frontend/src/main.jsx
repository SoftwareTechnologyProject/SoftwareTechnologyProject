import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './main.css'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import Home from './pages/Home'
import VoucherManagement from './pages/VoucherManagement/VoucherManagement'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/vouchers" element={<VoucherManagement />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  </StrictMode>,
)
