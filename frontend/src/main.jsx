import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './main.css'
import HomePage from './pages/HomePage/HomePage'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HomePage />
  </StrictMode>,
)
