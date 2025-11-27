import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage/HomePage';
import ProductDetail from './pages/productDetails/ProductDetail';
import Account from './pages/Account/Account';
import VoucherWallet from './pages/VoucherWallet/VoucherWallet';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/books/:id" element={<ProductDetail />} />
          <Route path="/account" element={<Account />} />
          <Route path="/voucher-wallet" element={<VoucherWallet />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
