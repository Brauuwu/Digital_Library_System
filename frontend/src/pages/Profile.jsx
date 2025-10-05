import React, { useEffect, useState, useContext } from 'react';
import api from '../api';
import Modal from '../components/Modal';
import { useToast } from '../components/Toast';
import { Link } from 'react-router-dom';
import { AuthContext } from '../auth.jsx';

export default function Profile(){
  const [me,setMe]=useState(null);
  const [borrows,setBorrows]=useState([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const toast = useToast();
  const { user } = useContext(AuthContext);

  useEffect(()=>{
    const token = localStorage.getItem('token');
    if(token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    api.get('/users/me').then(r=>setMe(r.data)).catch(()=>{});
    const headers = {};
    if (user?.ID_NguoiDung) headers['x-user-id'] = user.ID_NguoiDung;
    if (user?.Role) headers['x-user-role'] = user.Role;
    api.get('/borrows', { headers }).then(r=>{
      // server returns array of borrow objects with ChiTietPhieuMuon
      setBorrows(r.data || []);
    }).catch(()=>{});
  },[]);
  if(!me) return <div className="card" style={{maxWidth:600, margin:'24px auto', padding:20}}>Vui lòng đăng nhập</div>
  const doReturn = async (id)=>{
    if(!confirm('Xác nhận trả sách?')) return;
    try{
      const headers = {};
      if (user?.ID_NguoiDung) headers['x-user-id'] = user.ID_NguoiDung;
      if (user?.Role) headers['x-user-role'] = user.Role;
      const res = await api.post(`/borrows/${id}/return`, {}, { headers });
      // update local borrows list with returned borrow
      const updated = res.data;
      setBorrows(prev => prev.map(b => b.ID_PhieuMuon === updated.ID_PhieuMuon ? updated : b));
      if(detail && detail.ID_PhieuMuon === updated.ID_PhieuMuon){ setDetail(updated); }
      toast.push({ type: 'success', message: 'Đã đánh dấu trả' });
      try{ window.dispatchEvent(new Event('action:success')); }catch(e){}
      try { window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'success', message: 'Đã đánh dấu trả' } })); } catch(_) {}
    }catch(err){ console.error(err); }
  };
  // fetch borrow detail from backend and open modal
  const openDetail = async (b)=>{
    try{
      const headers = {};
      if (user?.ID_NguoiDung) headers['x-user-id'] = user.ID_NguoiDung;
      if (user?.Role) headers['x-user-role'] = user.Role;
      const res = await api.get(`/borrows/${b.ID_PhieuMuon}`, { headers });
      setDetail(res.data);
      setDetailOpen(true);
    }catch(err){
      console.error('Failed to fetch borrow detail', err);
      // fallback to provided object if API fails
      setDetail(b);
      setDetailOpen(true);
      try { window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'error', message: 'Không thể tải chi tiết phiếu mượn' } })); } catch(_) {}
    }
  }

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
              {(b.ChiTietPhieuMuon && b.ChiTietPhieuMuon.length > 0) ? (
                <ul style={{margin:0, paddingLeft:18}}>
                  {b.ChiTietPhieuMuon.map(d=> (
                    <li key={d.ID_Sach || `${b.ID_PhieuMuon}-${d.ID_Sach}`} className="muted">
                      <Link to={`/books/${d.ID_Sach}`}>{d.TieuDeSach || `Sách #${d.ID_Sach}`}</Link>
                    </li>
                  ))}
                </ul>
              ) : <div className="muted">(Không có sách)</div>}
            </div>
          </div>
          <div style={{display:'flex',gap:8,flexDirection:'column'}}>
            <button className="btn" onClick={()=>openDetail(b)}>Chi tiết</button>
            {b.TrangThai !== 'returned' ? <button className="btn" onClick={()=>doReturn(b.ID_PhieuMuon)}>Trả</button> : <div className="muted">Đã trả</div>}
          </div>
        </div>
      ))}
    </div>
    <Modal open={detailOpen} title={`Phiếu mượn #${detail?.ID_PhieuMuon || ''}`} onClose={()=>{ setDetail(null); setDetailOpen(false); }}>
      {detail ? (
        <div>
          <div><strong>Ngày mượn:</strong> {new Date(detail.NgayMuon).toLocaleDateString()}</div>
          <div><strong>Hạn trả:</strong> {new Date(detail.HanTra).toLocaleDateString()}</div>
          <div style={{marginTop:12}}>
            <strong>Danh sách sách:</strong>
            <ul style={{marginTop:8}}>
                {(detail.ChiTietPhieuMuon || []).map(it => (
                  <li key={it.ID_Sach || `${detail.ID_PhieuMuon}-${it.ID_Sach}`}>
                    <div>{it.TieuDeSach || `Sách #${it.ID_Sach}`}</div>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      ) : null}
    </Modal>
  </div>)
}
