import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import formatUrl from '../utils/formatUrl';
import LinkifyText from '../components/LinkifyText';

export default function PublisherDetail() {
  const { id } = useParams();
  const [publisher, setPublisher] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const r = await api.get(`/publishers/${id}`);
        const data = r.data;

        // normalize books like AuthorDetail
        data.Books = (data.Books || []).map((b) => ({
          ID_Sach: b.ID_Sach || b.id || b.ID,
          TieuDeSach: b.TieuDeSach || b.TieuDe || b.title || b.name,
        }));

        setPublisher(data);
      } catch (err) {
        setPublisher(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading) return <div className="muted">Đang tải...</div>;
  if (!publisher) return <div className="muted">Nhà xuất bản không tìm thấy</div>;

  return (
    <div>
      <div className="page-title">
        <h2>{publisher.TenNXB}</h2>
        <div className="muted">Thông tin nhà xuất bản</div>
      </div>

      <div className="card">
        <div>
          <strong>Tên:</strong> {publisher.TenNXB}
        </div>

        {publisher.DiaChi && (
          <div style={{ marginTop: 8 }}>
            <strong>Địa chỉ:</strong> {publisher.DiaChi}
          </div>
        )}

        {publisher.Website && (
          <div style={{ marginTop: 8 }}>
            <strong>Website:</strong>
            <p style={{ margin: '6px 0' }}>
              <a href={publisher.Website} target="_blank" rel="noopener noreferrer" title={publisher.Website}>
                {formatUrl(publisher.Website)}
              </a>
            </p>
          </div>
        )}

        <div style={{ marginTop: 12 }}>
          <strong>Sách của nhà xuất bản:</strong>
          <ul style={{ marginTop: 8 }}>
            {publisher.Books.length > 0 ? (
              publisher.Books.map((b) => (
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
