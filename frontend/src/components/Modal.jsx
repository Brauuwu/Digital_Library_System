import React from 'react';

export default function Modal({ open, title, children, onClose }){
  if(!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <div style={{fontWeight:700}}>{title}</div>
          <button className="btn secondary" onClick={onClose}>Đóng</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}
