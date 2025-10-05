import React, { useEffect, useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";
import Modal from '../components/Modal';
import LinkifyText from '../components/LinkifyText';

export default function Authors() {
  const [q, setQ] = useState("");
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(false);
 
  // Không load user/token - tắt chức năng admin

  // Load danh sách tác giả
  const load = async (search = "") => {
    setLoading(true);
    try {
      const res = await api.get("/authors", { params: { q: search } });
      setAuthors(res.data || []);
    } catch (err) {
      setAuthors([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const onSearch = (e) => {
    e && e.preventDefault();
    load(q);
  };
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const openDetail = async (a) => {
    setDetailLoading(true);
    try{
      const res = await api.get(`/authors/${a.ID_TacGia || a.id}`);
      console.debug('DEBUG: author detail response', res.data);
      const data = res.data;
      data.Books = (data.Books || []).map((b) => ({ ID_Sach: b.ID_Sach || b.id || b.ID, TieuDeSach: b.TieuDeSach || b.TieuDe || b.title || b.name }));
      setDetail(data);
    }catch(err){
      console.error('Failed to load author detail', err);
      setDetail(null);
    }finally{
      setDetailLoading(false);
      setDetailOpen(true);
    }
  };
  const closeDetail = () => { setDetail(null); setDetailOpen(false); };
  // Không còn action admin: thêm / sửa / xóa

  return (
    <div>
      <div className="page-title">
        <h2>Tác giả</h2>
        <div className="muted">Quản lý tác giả trong thư viện</div>
      </div>

      {/* Tìm kiếm + Thêm */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <form onSubmit={onSearch} style={{ flex: 1 }}>
          <input
            placeholder="Tìm kiếm tác giả..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="input"
            style={{ width: "100%" }}
          />
        </form>
        <button className="btn" onClick={() => load(q)}>
          Tìm
        </button>
      </div>

      {/* Danh sách */}
      <div className="card">
        {loading && <div className="muted">Đang tải...</div>}
        {!loading && authors.length === 0 && (
          <div className="muted">Không có tác giả</div>
        )}

        {authors.map((a) => (
          <div key={a.ID_TacGia || a.id} className="list-row">
            <div style={{ fontWeight: 700 }}>
              <Link to={`/authors/${a.ID_TacGia || a.id}`}>
                {a.HoTen || a.TenTacGia}
              </Link>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn small" onClick={() => openDetail(a)}>Xem</button>
            </div>
          </div>
        ))}
      </div>
      <Modal open={detailOpen} onClose={closeDetail} title={`Tác giả: ${detail?.HoTen || detail?.TenTacGia || ''}`}>
        {detailLoading ? (
          <div className="muted">Đang tải...</div>
        ) : detail ? (
          <div>
            <div><strong>Tên:</strong> {detail.HoTen || detail.TenTacGia}</div>
            <div style={{ marginTop: 8 }}>
              <strong>Tiểu sử:</strong>
              <p>{detail.TieuSu ? <LinkifyText text={detail.TieuSu} /> : 'Chưa có tiểu sử'}</p>
            </div>
            <div style={{ marginTop: 12 }}>
              <strong>Sách của tác giả:</strong>
              <ul style={{ marginTop: 8 }}>
                {detail.Books && detail.Books.length > 0 ? (
                  detail.Books.map(b => (
                    <li key={b.ID_Sach}><Link to={`/books/${b.ID_Sach}`}>{b.TieuDeSach}</Link></li>
                  ))
                ) : (
                  <li className="muted">Chưa có sách</li>
                )}
              </ul>
            </div>
          </div>
        ) : (
          <div className="muted">Không tải được thông tin tác giả</div>
        )}
      </Modal>
    </div>
  );
}
