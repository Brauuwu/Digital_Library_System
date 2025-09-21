import React, { useEffect, useState } from 'react';
import api from '../api';
import BookCard from '../components/BookCard';

export default function Categories(){
  const [cats,setCats]=useState([]);
  useEffect(()=>{ api.get('/categories').then(r=>setCats(r.data)).catch(()=>{}); },[]);
  return (<div>
    <div className="page-title"><h2>Thể loại</h2><div className="muted">Quản lý các thể loại sách</div></div>
    {cats.map(c=> (
      <div key={c.ID_TheLoai} className="card" style={{marginBottom:12}}>
        <h3>{c.TenTheLoai} <span className="muted" style={{fontSize:12}}>({(c.Books||[]).length} sách)</span></h3>
        {(c.Books||[]).length === 0 ? <div className="muted">Chưa có sách cho thể loại này.</div> : (c.Books||[]).map(b=> (
          <BookCard key={b.ID_Sach} book={b} isAdmin={false} />
        ))}
      </div>
    ))}
  </div>)
}
