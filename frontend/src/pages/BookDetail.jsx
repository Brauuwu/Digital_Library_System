import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";
import formatUrl from '../utils/formatUrl';
import AuthorHover from '../components/AuthorHover';

export default function BookDetail() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/books/${id}`)
      .then((r) => {
        setBook(r.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Không tìm thấy sách");
        setLoading(false);
      });
  }, [id]);

  // Helper: format website for display (show host and short path)
  const formatUrl = (raw) => {
    if (!raw) return '';
    try {
      const u = new URL(raw);
      // remove www.
      const host = u.host.replace(/^www\./i, '');
      let path = u.pathname === '/' ? '' : u.pathname;
      if (u.search) path += u.search;
      if (path.length > 24) path = path.slice(0, 21) + '...';
      return host + (path ? path : '');
    } catch (err) {
      // fallback: truncate long strings
      return raw.length > 30 ? raw.slice(0, 27) + '...' : raw;
    }
  };

  if (loading)
    return (
      <div className="card" style={{ maxWidth: 600, margin: "24px auto", padding: 20 }}>
        Đang tải...
      </div>
    );
  if (error)
    return (
      <div className="card" style={{ maxWidth: 600, margin: "24px auto", padding: 20 }}>
        {error}
      </div>
    );
  if (!book) return null;

  return (
    <div className="card" style={{ maxWidth: 800, margin: "24px auto", padding: 20 }}>
      <h2 style={{ marginBottom: 16 }}>{book.TieuDeSach}</h2>

      {/* Ảnh bìa */}
      <div style={{ display: "flex", gap: 20 }}>
        <div className="cover-frame">
          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={book.TieuDeSach}
              className="book-cover-img"
            />
          ) : (
            <img
              src="/anh-bia.png" // ảnh mặc định bạn đã chọn
              alt="Bìa sách"
              className="book-cover-img"
            />
          )}
        </div>

        {/* Thông tin */}
        <div style={{ flex: 1 }}>
          {book.Authors && book.Authors.length > 0 && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <strong>Tác giả:</strong>
              <div style={{ display: 'inline-flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                {book.Authors.map((a, i) => (
                  <div key={a.ID_TacGia || a.id} style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                    <AuthorHover author={a} />
                    {i < book.Authors.length - 1 && <span style={{ color: '#666' }}>,</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {book.Publisher && (
            <div>
              <strong>Nhà xuất bản:</strong>{' '}
              <Link to={`/publishers/${book.Publisher.ID_NXB}`}>{book.Publisher.TenNXB}</Link>
            </div>
          )}

          {book.NamXuatBan != null && (
            <div>
              <strong>Năm xuất bản:</strong> {book.NamXuatBan}
            </div>
          )}

          {book.Categories && book.Categories.length > 0 && (
            <div>
              <strong>Thể loại:</strong>{" "}
              {book.Categories.map((c) => c.TenTheLoai).join(", ")}
            </div>
          )}

          {book.SoLuongCon != null && (
            <div>
              <strong>Số lượng còn:</strong> {book.SoLuongCon}
            </div>
          )}
        </div>
      </div>

      {/* Mô tả */}
      {book.MoTa && (
        <div style={{ marginTop: 16 }}>
          <strong>Mô tả:</strong>
          <p style={{ marginTop: 4 }}>{book.MoTa}</p>
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <Link to="/books" className="btn">
          ← Quay lại danh sách
        </Link>
      </div>
    </div>
  );
}
