import React, { useEffect, useState, useContext } from 'react';
import api from '../api';
import Modal from '../components/Modal';
import { useToast } from '../components/Toast';
import { Link } from 'react-router-dom';
import { AuthContext } from '../auth.jsx';

export default function AdminBorrows(){
  const [borrows,setBorrows]=useState([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const toast = useToast();
  const { user } = useContext(AuthContext);

  useEffect(()=>{ load(); },[]);
  const load = ()=> {
    const headers = {};
    if (user?.ID_NguoiDung) headers['x-user-id'] = user.ID_NguoiDung;
    if (user?.Role) headers['x-user-role'] = user.Role;
    return api.get('/borrows/all', { headers }).then(r=>setBorrows(r.data)).catch(()=>{});
  };

  const markReturn = async (id)=>{
    if(!confirm('Đánh dấu đã trả?')) return;
    try{
      const headers = {};
      if (user?.ID_NguoiDung) headers['x-user-id'] = user.ID_NguoiDung;
      if (user?.Role) headers['x-user-role'] = user.Role;
      const res = await api.post(`/borrows/${id}/return`, {}, { headers });
      const updated = res.data;
      setBorrows(prev => prev.map(b => b.ID_PhieuMuon === updated.ID_PhieuMuon ? updated : b));
      if(detail && detail.ID_PhieuMuon === updated.ID_PhieuMuon){ setDetail(updated); }
      toast.push({ type: 'success', message: 'Đã đánh dấu trả' });
      // simple UI highlight: add success class to last clicked button via event
      try{ window.dispatchEvent(new Event('action:success')); }catch(e){}
      try { window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'success', message: 'Đã đánh dấu trả' } })); } catch(_) {}
    }catch(err){ console.error(err); toast.push({ type: 'error', message: err.response?.data?.error || err.message }); }
  };
  const openDetail = async (b)=>{
    try{
      const headers = {};
      if (user?.ID_NguoiDung) headers['x-user-id'] = user.ID_NguoiDung;
      if (user?.Role) headers['x-user-role'] = user.Role;
      const res = await api.get(`/borrows/${b.ID_PhieuMuon}`, { headers });
      setDetail(res.data);
    }catch(err){
      // fallback to provided object
      setDetail(b);
    }
    setDetailOpen(true);
  };
  const closeDetail = ()=>{ setDetail(null); setDetailOpen(false); };
  return (<div>
    <div className="page-title"><h2>Quản lý mượn trả</h2><div className="muted">Danh sách phiếu mượn</div></div>
    <div className="card">
      {borrows.map(b=> (
         <div key={b.ID_PhieuMuon} className="list-row">
           <div>
             <div style={{fontWeight:700}}>Mã: {b.ID_PhieuMuon} • {b.TrangThai}</div>
            <div className="muted">Người dùng: {b.NguoiDung?.HoTen || b.ID_NguoiDung} • Ngày mượn: {new Date(b.NgayMuon).toLocaleDateString('en-GB')}</div>
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
           <div>
             <div style={{display:'flex',flexDirection:'column',gap:8}}>
               <button className="btn" onClick={()=>openDetail(b)}>Chi tiết</button>
               {b.TrangThai !== 'returned' ? <button className="btn" onClick={()=>markReturn(b.ID_PhieuMuon)}>Đánh dấu trả</button> : <div className="muted">Đã trả</div>}
             </div>
           </div>
         </div>
       ))}
     </div>
     <Modal open={detailOpen} title={`Phiếu mượn #${detail?.ID_PhieuMuon || ''}`} onClose={closeDetail}>
       {detail ? (
         <div>
           <div><strong>Người dùng:</strong> {detail.NguoiDung?.HoTen || detail.ID_NguoiDung}</div>
           <div><strong>Ngày mượn:</strong> {new Date(detail.NgayMuon).toLocaleDateString('en-GB')}</div>
           <div><strong>Hạn trả:</strong> {new Date(detail.HanTra).toLocaleDateString('en-GB')}</div>
           <div style={{marginTop:12}}>
             <strong>Danh sách sách:</strong>
             <ul style={{marginTop:8}}>
              {(detail.ChiTietPhieuMuon||[]).map(it=> (
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
