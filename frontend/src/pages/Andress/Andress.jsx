
import React, { useState, useEffect } from 'react';
import './Andress.css';

// MO TA: Andress component (modal chon dia chi)
// - Chuc nang: chon dia chi mac dinh tu user profile hoac nhap dia chi khac
// - Su dung: duoc goi tu ProductDetail de tach logic ra file rieng
// - Props: show(on/off), onClose, onConfirm(addr), userAddresses(array string)

const Andress = ({ show, onClose, onConfirm, userAddresses = [] }) => {
  const [addressType, setAddressType] = useState('default');
  const [selectedAddress, setSelectedAddress] = useState('');
  const [addressForm, setAddressForm] = useState({ city: '', district: '', ward: '' });

  useEffect(() => {
    if (userAddresses && userAddresses.length > 0) {
      setSelectedAddress(userAddresses[0]);
      setAddressType('default');
    }
  }, [userAddresses]);

  if (!show) return null;

  const handleConfirm = () => {
    if (addressType === 'default') {
      onConfirm(selectedAddress);
    } else {
      onConfirm(`${addressForm.ward}, ${addressForm.district}, ${addressForm.city}`);
    }
    onClose();
  };

  return (
    <div className="address-modal-overlay" onClick={onClose}>
      <div className="address-modal" onClick={e => e.stopPropagation()}>
        <div className="address-header">
          <h3>Chọn địa chỉ giao hàng</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="address-body">
          <div className="address-option">
            <input
              type="radio"
              id="default-address"
              name="address-type"
              value="default"
              checked={addressType === 'default'}
              onChange={(e) => setAddressType(e.target.value)}
            />
            <label htmlFor="default-address">
              <strong>Địa chỉ mặc định:</strong>
              <div className="default-list">
                {userAddresses && userAddresses.length > 0 ? (
                  <select value={selectedAddress} onChange={(e) => setSelectedAddress(e.target.value)}>
                    {userAddresses.map((a, i) => (
                      <option key={i} value={a}>{a}</option>
                    ))}
                  </select>
                ) : (
                  <div className="no-address">Chưa có địa chỉ trong hồ sơ</div>
                )}
              </div>
            </label>
          </div>

          <div className="address-option">
            <input
              type="radio"
              id="other-address"
              name="address-type"
              value="other"
              checked={addressType === 'other'}
              onChange={(e) => setAddressType(e.target.value)}
            />
            <label htmlFor="other-address">Giao đến địa chỉ khác</label>
          </div>

          {addressType === 'other' && (
            <div className="address-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Tỉnh/Thành phố</label>
                  <input value={addressForm.city} onChange={(e) => setAddressForm({...addressForm, city: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Quận/Huyện</label>
                  <input value={addressForm.district} onChange={(e) => setAddressForm({...addressForm, district: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Phường/Xã</label>
                  <input value={addressForm.ward} onChange={(e) => setAddressForm({...addressForm, ward: e.target.value})} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="address-footer">
          <button className="btn-cancel" onClick={onClose}>Hủy</button>
          <button className="btn-confirm" onClick={handleConfirm} disabled={addressType === 'other' && (!addressForm.city || !addressForm.district || !addressForm.ward)}>Xác nhận</button>
        </div>
      </div>
    </div>
  );
};

export default Andress;
