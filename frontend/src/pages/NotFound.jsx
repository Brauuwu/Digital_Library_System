import React from 'react';

export default function NotFound() {
  return (
    <div className="card" style={{ maxWidth: 600, margin: '48px auto', textAlign: 'center', padding: 32 }}>
      <h2>404 - Không tìm thấy trang</h2>
      <div className="muted" style={{ marginTop: 16 }}>
        Trang bạn truy cập không tồn tại hoặc đã bị xóa.<br />
        <a href="/" className="btn" style={{ marginTop: 24 }}>Quay về trang chủ</a>
      </div>
    </div>
  );
}
