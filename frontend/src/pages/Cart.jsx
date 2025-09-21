import React, { useEffect, useState } from 'react';
import { useCart } from '../cart';
import api from '../api';
import BookCard from '../components/BookCard';
import { useToast } from '../components/Toast';

export default function Cart(){
  const cart = useCart();
  const [books, setBooks] = useState([]);
  const toast = useToast();

  useEffect(()=>{ if(!cart) return; const ids = cart.items || []; if(ids.length===0){ setBooks([]); return; } Promise.all(ids.map(id => api.get(`/books/${id}`).then(r=>r.data).catch(()=>null))).then(setBooks); }, [cart && cart.items]);

  const remove = (id)=>{ cart.remove(id); };
  const clear = ()=>{ if(!confirm('Xóa tất cả sách trong phiếu mượn?')) return; cart.clear(); };

  const checkout = async ()=>{
    if(!cart || cart.items.length===0) return toast.push({ type:'error', message: 'Phiếu mượn trống' });
    try{
      const now = new Date();
      const NgayMuon = now.toISOString();
      const HanTra = new Date(now.getTime() + 14*24*60*60*1000).toISOString();
      const items = cart.items.map(id => ({ ID_Sach: id }));
      await api.post('/borrows', { NgayMuon, HanTra, items });
      toast.push({ type:'success', message: 'Tạo phiếu mượn thành công' });
      cart.clear();
    }catch(err){ toast.push({ type:'error', message: err.response?.data?.error || err.response?.data?.message || err.message }); }
  };

  return (<div>
    <div className="page-title"><h2>Phiếu mượn</h2><div className="muted">Các sách bạn muốn mượn</div></div>
    <div className="card">
      <div style={{display:'flex', justifyContent:'space-between', marginBottom:12}}>
        <div>Items: {cart ? cart.count() : 0}</div>
        <div style={{display:'flex', gap:8}}>
          <button className="btn" onClick={clear} disabled={!(cart && cart.count()>0)}>Xóa tất cả</button>
          <button className="btn" onClick={checkout} disabled={!(cart && cart.count()>0)}>Mượn tất cả</button>
        </div>
      </div>

  {(books||[]).length === 0 ? <div className="muted">Phiếu mượn rỗng</div> : books.map(b => <div key={b?.ID_Sach} style={{marginBottom:8}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div style={{flex:1}}>
            <div style={{fontWeight:700}}>{b?.TieuDeSach}</div>
            <div className="muted">{b?.Authors?.map(a=>a.HoTen).join(', ')}</div>
          </div>
          <div style={{display:'flex', gap:8}}>
            <button className="btn" onClick={()=>remove(b.ID_Sach)}>Xóa</button>
          </div>
        </div>
      </div>)}
    </div>
  </div>);
}
