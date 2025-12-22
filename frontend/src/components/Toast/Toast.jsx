import React, { useEffect } from 'react';
import './Toast.css';

// MO TA: Toast component
// - Chuc nang: hien thong bao nho o goc man hinh khi nguoi dung thuc hien hanh dong
// - Su dung: dung o nhieu trang, nhan props message, linkText/linkHref, onClose, duration
// - UI: hop trang nen co vien do va ben phai mau do de nhan manh (theo yeu cau)
const Toast = ({ message, linkText, linkHref, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="toast-container">
      <div className="toast-box">
        <div className="toast-main">
          <span className="toast-icon">🛒</span>
          <div className="toast-message-wrap">
            <div className="toast-message">{message}</div>
            {linkText && linkHref && (
              <a href={linkHref} className="toast-link">{linkText}</a>
            )}
          </div>
        </div>
        <div className="toast-side">
          <button className="toast-close" onClick={onClose}>✕</button>
        </div>
      </div>
    </div>
  );
};

export default Toast;
