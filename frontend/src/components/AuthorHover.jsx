import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import api from '../api';
import LinkifyText from './LinkifyText';
import formatUrl from '../utils/formatUrl';

export default function AuthorHover({ author }){
  const ref = useRef();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const show = async () => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos({ top: r.bottom + window.scrollY + 6, left: r.left + window.scrollX });
    setOpen(true);
    if (data || loading) return;
    setLoading(true);
    try {
      const res = await api.get(`/authors/${author.ID_TacGia || author.id}`);
      setData(res.data);
    } catch (err) {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const hide = () => setOpen(false);

  const pop = (
    <div
      style={{ position: 'absolute', top: pos.top, left: pos.left, zIndex: 9999 }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div style={{ maxWidth: 320, background: '#fff', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 6px 18px rgba(0,0,0,0.08)', padding: 12, borderRadius: 6 }}>
        <div style={{ fontWeight:700, marginBottom:6 }}>{data?.HoTen || author.HoTen || author.TenTacGia}</div>
        {loading && <div className="muted">Đang tải...</div>}
        {!loading && data && (
          <div>
            <div style={{ marginBottom:8 }}>
              <small style={{ color:'#333' }}><strong>Tiểu sử:</strong></small>
              <div style={{ marginTop:4 }}><LinkifyText text={data.TieuSu || ''} /></div>
            </div>
            {data.Website && (
              <div style={{ marginTop:6 }}>
                <small style={{ color:'#333' }}><strong>Website:</strong></small>{' '}
                <a href={data.Website} target="_blank" rel="noreferrer" title={data.Website} style={{ color:'#b02' }}>{formatUrl(data.Website)}</a>
              </div>
            )}
          </div>
        )}
        {!loading && data === null && <div className="muted">Không có thông tin</div>}
      </div>
    </div>
  );

  return (
    <>
      <span ref={ref} style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
        <Link to={`/authors/${author.ID_TacGia || author.id}`} style={{ textDecoration: 'none', color: '#b02' }}>
          {author.HoTen || author.TenTacGia}
        </Link>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (open) hide(); else show(); }}
          aria-label="Xem tiểu sử"
          style={{ background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer', color: '#b02', fontSize: 14 }}
        >
          
        </button>
        {author.Website && (
          <a href={author.Website} target="_blank" rel="noreferrer" title={author.Website} style={{ fontSize:13, color:'#b02' }} onClick={(e)=>e.stopPropagation()}>
            {formatUrl(author.Website)}
          </a>
        )}
      </span>
      {open && createPortal(pop, document.body)}
    </>
  );
}
