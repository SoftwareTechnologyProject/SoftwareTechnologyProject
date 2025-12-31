import React, { useState } from 'react';
import './Andress.css';

export default function Andress({ show, onClose, onConfirm, userAddresses = [] }) {
  const [selectedAddress, setSelectedAddress] = useState('');
  const [customAddress, setCustomAddress] = useState({
    city: '',
    district: '',
    ward: ''
  });
  const [useCustom, setUseCustom] = useState(false);

  if (!show) return null;

  const handleConfirm = () => {
    if (useCustom) {
      const addr = `${customAddress.ward}, ${customAddress.district}, ${customAddress.city}`;
      onConfirm(addr);
    } else {
      onConfirm(selectedAddress || userAddresses[0] || 'Long Xuyên, An Giang');
    }
  };

  return (
    <div className="andress-modal-overlay" onClick={onClose}>
      <div className="andress-modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Chọn địa chỉ giao hàng</h3>
        
        {userAddresses.length > 0 && (
          <div className="address-list">
            <h4>Địa chỉ đã lưu:</h4>
            {userAddresses.map((addr, idx) => (
              <label key={idx} className="address-option">
                <input 
                  type="radio" 
                  name="address" 
                  value={addr}
                  checked={selectedAddress === addr && !useCustom}
                  onChange={() => {
                    setSelectedAddress(addr);
                    setUseCustom(false);
                  }}
                />
                <span>{addr}</span>
              </label>
            ))}
          </div>
        )}

        <div className="custom-address-section">
          <label className="address-option">
            <input 
              type="radio" 
              name="address" 
              checked={useCustom}
              onChange={() => setUseCustom(true)}
            />
            <span>Nhập địa chỉ khác</span>
          </label>
          
          {useCustom && (
            <div className="custom-address-form">
              <input 
                type="text" 
                placeholder="Tỉnh/Thành phố"
                value={customAddress.city}
                onChange={(e) => setCustomAddress({...customAddress, city: e.target.value})}
              />
              <input 
                type="text" 
                placeholder="Quận/Huyện"
                value={customAddress.district}
                onChange={(e) => setCustomAddress({...customAddress, district: e.target.value})}
              />
              <input 
                type="text" 
                placeholder="Phường/Xã"
                value={customAddress.ward}
                onChange={(e) => setCustomAddress({...customAddress, ward: e.target.value})}
              />
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Hủy</button>
          <button className="btn-confirm" onClick={handleConfirm}>Xác nhận</button>
        </div>
      </div>
    </div>
  );
}
