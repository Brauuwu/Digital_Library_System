import React, { useEffect, useState } from 'react';
import api from '../api';

export default function AdminBorrows(){
  const [borrows,setBorrows]=useState([]);
  useEffect(()=>{ load(); },[]);
  const load = ()=> api.get('/borrows/all' ).then(r=>setBorrows(r.data)).catch(()=>{});
  const markReturn = async (id)=>{ if(!confirm('Đánh dấu đã trả?')) return; await api.post(`/borrows/${id}/return`, {}); load(); };
  return (<div>
    <div className="page-title"><h2>Quản lý mượn trả</h2><div className="muted">Danh sách phiếu mượn</div></div>
    <div className="card">
      {borrows.map(b=> (
        <div key={b.ID_PhieuMuon} className="list-row">
          <div>
            <div style={{fontWeight:700}}>Mã: {b.ID_PhieuMuon} • {b.TrangThai}</div>
            <div className="muted">Người dùng: {b.NguoiDung?.HoTen || b.ID_NguoiDung} • Ngày mượn: {new Date(b.NgayMuon).toLocaleDateString()}</div>
            <div style={{marginTop:8}}>
              {b.ChiTietPhieuMuon && b.ChiTietPhieuMuon.map(d=> <div key={d.ID_ChiTietPhieuMuon} className="muted">- {d.Book?.TieuDeSach || d.ID_Sach}</div>)}
            </div>
          </div>
          <div>
            {b.TrangThai !== 'returned' ? <button className="btn" onClick={()=>markReturn(b.ID_PhieuMuon)}>Đánh dấu trả</button> : <div className="muted">Đã trả</div>}
          </div>
        </div>
      ))}
    </div>
  </div>)
}
