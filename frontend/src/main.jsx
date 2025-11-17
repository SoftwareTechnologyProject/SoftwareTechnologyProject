import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './main.css'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Header />
    
    <Footer />
  </StrictMode>,
)
