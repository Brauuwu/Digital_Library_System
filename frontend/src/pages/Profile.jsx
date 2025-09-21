import React, { useEffect, useState } from 'react';
import api from '../api';

export default function Profile(){
  const [me,setMe]=useState(null);
  const [borrows,setBorrows]=useState([]);
  useEffect(()=>{
    const token = localStorage.getItem('token');
    if(token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    api.get('/users/me').then(r=>setMe(r.data)).catch(()=>{});
    api.get('/borrows').then(r=>setBorrows(r.data)).catch(()=>{});
  },[]);
  if(!me) return <div className="card" style={{maxWidth:600, margin:'24px auto', padding:20}}>Vui lòng đăng nhập</div>
  const doReturn = async (id)=>{ if(!confirm('Xác nhận trả sách?')) return; await api.post(`/borrows/${id}/return`, {}); const r = await api.get('/borrows'); setBorrows(r.data); };
  return (<div style={{maxWidth:900, margin:'24px auto'}}>
    <div className="card">
      <h2>Thông tin cá nhân</h2>
      <div><strong>Họ tên:</strong> {me.HoTen}</div>
      <div><strong>Email:</strong> {me.Email}</div>
      <div><strong>SĐT:</strong> {me.SoDienThoai}</div>
      <div><strong>Địa chỉ:</strong> {me.DiaChi}</div>
    </div>

    <div className="card" style={{marginTop:16}}>
      <h3>Phiếu mượn của tôi</h3>
      {borrows.length === 0 ? <div className="muted">Bạn chưa mượn sách nào.</div> : borrows.map(b=> (
        <div key={b.ID_PhieuMuon} className="list-row">
          <div>
            <div style={{fontWeight:700}}>Mã: {b.ID_PhieuMuon} • {b.TrangThai}</div>
            <div className="muted">Ngày mượn: {new Date(b.NgayMuon).toLocaleDateString()} • Hạn trả: {new Date(b.HanTra).toLocaleDateString()}</div>
            <div style={{marginTop:8}}>
              {b.ChiTietPhieuMuon && b.ChiTietPhieuMuon.map(d=> <div key={d.ID_ChiTietPhieuMuon} className="muted">- {d.Book?.TieuDeSach || d.ID_Sach}</div>)}
            </div>
          </div>
          <div style={{display:'flex',gap:8}}>
            {b.TrangThai !== 'returned' ? <button className="btn" onClick={()=>doReturn(b.ID_PhieuMuon)}>Trả</button> : <div className="muted">Đã trả</div>}
          </div>
        </div>
      ))}
    </div>
  </div>)
}
