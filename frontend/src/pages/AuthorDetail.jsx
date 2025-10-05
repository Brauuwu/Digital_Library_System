// frontend/src/pages/AuthorDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";
import LinkifyText from '../components/LinkifyText';

export default function AuthorDetail() {
  const { id } = useParams();
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadAuthor = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/authors/${id}`);
        const data = res.data;

        // Chuẩn hóa dữ liệu sách
        data.Books = (data.Books || []).map((b) => ({
          ID_Sach: b.ID_Sach || b.id || b.ID,
          TieuDeSach: b.TieuDeSach || b.TieuDe || b.title || b.name,
        }));

        setAuthor(data);
      } catch (err) {
        setAuthor(null);
      } finally {
        setLoading(false);
      }
    };

    loadAuthor();
  }, [id]);

  if (loading) return <div className="muted">Đang tải...</div>;
  if (!author) return <div className="muted">Tác giả không tìm thấy</div>;

  return (
    <div>
      <div className="page-title">
        <h2>{author.HoTen}</h2>
        <div className="muted">Thông tin tác giả</div>
      </div>

      <div className="card">
        <div>
          <strong>Tên:</strong> {author.HoTen}
        </div>

        <div style={{ marginTop: 8 }}>
          <strong>Tiểu sử:</strong>
          <p>{author.TieuSu ? <LinkifyText text={author.TieuSu} /> : "Chưa có tiểu sử"}</p>
        </div>

        <div style={{ marginTop: 12 }}>
          <strong>Sách của tác giả:</strong>
          <ul style={{ marginTop: 8 }}>
            {author.Books.length > 0 ? (
              author.Books.map((b) => (
                <li key={b.ID_Sach}>
                  <Link to={`/books/${b.ID_Sach}`}>{b.TieuDeSach}</Link>
                </li>
              ))
            ) : (
              <li className="muted">Chưa có sách</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
