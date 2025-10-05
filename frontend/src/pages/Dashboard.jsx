import React, { useEffect, useState, useContext } from 'react';
import api from '../api';
import BookCard from '../components/BookCard';
import { useCart } from '../cartContext';
import { useToast } from '../components/Toast';
import actionSuccess from '../utils/actionSuccess';
import { AuthContext } from '../auth.jsx';

export default function Dashboard(){
  const [categories,setCategories]=useState([]);
  const [q,setQ] = useState('');
  const cart = useCart();
  const toast = useToast();
  const { user } = useContext(AuthContext);
  useEffect(()=>{
    (async ()=>{
      try{
        const r = await api.get('/categories');
        const cats = r.data || [];

        // collect book IDs that are missing Authors or Categories
        const missing = new Set();
        cats.forEach(cat => (cat.Books||[]).forEach(b=>{
          if(!b) return;
          const hasAuthors = Array.isArray(b.Authors) && b.Authors.length>0;
          const hasCats = Array.isArray(b.Categories) && b.Categories.length>0;
          if(!hasAuthors || !hasCats) missing.add(b.ID_Sach);
        }));

        if(missing.size === 0){
          setCategories(cats);
          return;
        }

        // fetch details for missing book IDs in parallel
        const ids = [...missing];
        const results = await Promise.all(ids.map(id => api.get(`/books/${id}`).then(rr=>rr.data).catch(()=>null)));
        const map = {};
        results.forEach(b => { if(b && b.ID_Sach) map[b.ID_Sach] = b; });

        const enriched = cats.map(cat => ({
          ...cat,
          Books: (cat.Books||[]).map(b => map[b.ID_Sach] ? { ...b, ...map[b.ID_Sach] } : b)
        }));

        setCategories(enriched);
      }catch(e){
        // fallback: set whatever we have or empty
        try{ const r = await api.get('/categories'); setCategories(r.data || []); }catch(_){ setCategories([]) }
      }
    })();
  },[]);

  const matches = (b, q)=>{
    if(!q) return true;
    const s = q.toLowerCase();
    if((b.TieuDeSach||'').toLowerCase().includes(s)) return true;
    if((b.ISBN||'').toLowerCase().includes(s)) return true;
    const authors = (b.Authors||[]).map(a=> (a.HoTen||'').toLowerCase()).join(' ');
    if(authors.includes(s)) return true;
    return false;
  };

  return (<div>
    <div className="page-title">
      <h2>Dashboard</h2>
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <div className="muted">Sắp xếp sách theo thể loại</div>
        <input className="input" placeholder="Tìm sách..." value={q} onChange={e=>setQ(e.target.value)} style={{width:260}} />
      </div>
    </div>

    <div style={{display:'flex',flexDirection:'column',gap:18}}>
      {categories.map(cat=> {
        const filtered = (cat.Books||[]).filter(b=> matches(b, q));
        if(filtered.length === 0) return null;
        return (
          <div key={cat.ID_TheLoai} className="card">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div style={{fontWeight:700}}>{cat.TenTheLoai}</div>
                <div className="muted">{filtered.length} sách</div>
              </div>
            </div>
            <div style={{display:'flex',overflowX:'auto',gap:12,marginTop:12}}>
              {filtered.map(b=> (
                <div key={b.ID_Sach} style={{minWidth:280}}>
                  <BookCard
                    book={b}
                    isAdmin={false}
                    showMeta={false}
                    showCover={true}
                    onBorrow={(bookId)=>{
                      if(!user) return toast.push({ type:'error', message: 'Vui lòng đăng nhập để mượn sách' });
                      cart.add(bookId);
                      actionSuccess(toast, 'Đã thêm sách vào giỏ mượn');
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  </div>)
}
