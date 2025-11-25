import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './main.css'
import HomePage from "./pages/HomePage/HomePage";
import Account from "./pages/Account/Account";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/account" element={<Account />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);

