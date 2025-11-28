import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './main.css'
import HomePage from "./pages/HomePage/HomePage";
import Account from "./pages/Account/Account";
import Header from "./components/Header/Header"
import Footer from "./components/Footer/Footer"

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/account" element={<Account />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  </StrictMode>
);