import React, { useEffect, useState } from 'react';
import api from '../api';
import formatUrl from '../utils/formatUrl';
import { Link } from 'react-router-dom';

export default function Publishers() {
  const [publishers, setPublishers] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = () =>
    api.get('/publishers').then(r => setPublishers(r.data)).catch(() => {});

  return (
    <div>
      <div className="page-title">
        <h2>Nhà xuất bản</h2>
        <div className="muted">Quản lý nhà xuất bản trong thư viện</div>
      </div>
      <div className="card">
        {publishers.map(p => (
          <div className="list-row" key={p.ID_NXB}>
            <div>
              <div style={{ fontWeight: 700 }}>
                <Link to={`/publishers/${p.ID_NXB}`}>{p.TenNXB}</Link>
              </div>
              {p.DiaChi && <div className="muted" style={{ fontSize: 12 }}>{p.DiaChi}</div>}
              {p.Website && (
                <div className="muted" style={{ fontSize: 12 }}>
                  <a href={p.Website} target="_blank" rel="noopener noreferrer" title={p.Website}>{formatUrl(p.Website)}</a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
