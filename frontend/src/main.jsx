import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './main.css'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import VoucherManagement from './components/VoucherManagement/VoucherManagement'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Header />
    <VoucherManagement />
    <Footer />
  </StrictMode>,
)
