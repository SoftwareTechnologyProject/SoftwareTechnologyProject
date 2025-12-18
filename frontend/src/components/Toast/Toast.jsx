import React, { useEffect } from 'react';
import './Toast.css';

const Toast = ({ message, linkText, linkHref, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="toast-container">
      <div className="toast-content">
        <span className="toast-icon">✅</span>
        <span className="toast-message">{message}</span>
        {linkText && linkHref && (
          <a href={linkHref} className="toast-link">
            [{linkText}]
          </a>
        )}
        <button className="toast-close" onClick={onClose}>
          ✕
        </button>
      </div>
    </div>
  );
};

export default Toast;
