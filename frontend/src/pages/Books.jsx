import React, { useEffect, useState } from 'react';
import api from '../api';
import BookCard from '../components/BookCard';
import BookFormModal from '../components/BookFormModal';
import { useToast } from '../components/Toast';

export default function Books(){
  const [books,setBooks]=useState([]);
  const [q, setQ] = useState('');
  const [me,setMe]=useState(null);
  const [editing,setEditing]=useState(null);
  const [form,setForm]=useState({ TieuDeSach:'', ISBN:'', NamXuatBan:'', SoLuongCon:1 });
  const [filterAuthor,setFilterAuthor]=useState(null);
  const [filterCategory,setFilterCategory]=useState(null);

  useEffect(()=>{ load(); api.get('/users/me').then(r=>setMe(r.data)).catch(()=>{}); },[]);
  const [authors,setAuthors] = useState([]);
  const [categoriesList,setCategoriesList] = useState([]);
  useEffect(()=>{ api.get('/authors').then(r=>setAuthors(r.data)).catch(()=>{}); api.get('/categories').then(r=>setCategoriesList(r.data)).catch(()=>{}); },[]);
  const load = ()=> api.get('/books').then(r=>setBooks(r.data)).catch(()=>{});
  const [modalOpen,setModalOpen] = useState(false);
  // cart-based flow replaces selection
  const startCreate = ()=>{ setEditing(null); setForm({ TieuDeSach:'', ISBN:'', NamXuatBan:'', SoLuongCon:1, authorIds: [], categoryIds: [] }); setModalOpen(true); };
  const startEdit = (b)=>{ setEditing(b.ID_Sach); setForm({ TieuDeSach:b.TieuDeSach, ISBN:b.ISBN, NamXuatBan:b.NamXuatBan, SoLuongCon:b.SoLuongCon, authorIds: (b.Authors||[]).map(a=>a.ID_TacGia), categoryIds: (b.Categories||[]).map(c=>c.ID_TheLoai) }); setModalOpen(true); };
  const submit = async (payload, closeModal=true) =>{ try{
    if(payload.authorIds) payload.authorIds = payload.authorIds;
    if(payload.categoryIds) payload.categoryIds = payload.categoryIds;
    if(editing) await api.put(`/books/${editing}`, payload); else await api.post('/books', payload);
    await load(); setEditing(null); if(closeModal) setModalOpen(false);
    toast.push({ type: 'success', message: editing ? 'Sửa sách thành công' : 'Thêm sách thành công' });
  }catch(err){
    const msg = err.response?.data?.error || err.response?.data?.message || err.message;
    toast.push({ type: 'error', message: msg });
  } };
  const remove = async (id)=>{ if(!confirm('Xóa sách này?')) return; await api.delete(`/books/${id}`); load(); };

  const getAuthors = (b)=> b.Authors || b.TacGias || b.TacGia || b.Author || [];
  const getCategories = (b)=> b.Categories || b.TheLoais || b.TheLoai || b.Categories || [];

  const toast = useToast();
  const borrowBook = async (bookId)=>{
    if(!me) return toast.push({ type:'error', message: 'Vui lòng đăng nhập để mượn sách' });
    try{
      const now = new Date();
      const NgayMuon = now.toISOString();
      const HanTraDate = new Date(now.getTime() + 14*24*60*60*1000);
      const HanTra = HanTraDate.toISOString();
      await api.post('/borrows', { NgayMuon, HanTra, items: [ { ID_Sach: bookId } ] });
      toast.push({ type:'success', message: 'Mượn sách thành công' });
      load();
    }catch(err){ toast.push({ type:'error', message: err.response?.data?.error || err.response?.data?.message || err.message }); }
  };


  const matches = (b, q)=>{
    if(!q) return true;
    const s = (q||'').toString().toLowerCase();
    if((b.TieuDeSach||'').toString().toLowerCase().includes(s)) return true;
    if((b.ISBN||'').toString().toLowerCase().includes(s)) return true;
    const authors = getAuthors(b) || [];
    if(authors.find(a=> (a.TenTacGia||a.name||'').toString().toLowerCase().includes(s))) return true;
    return false;
  };

  const visibleBooks = books.filter(b=>{
    if(!matches(b, q)) return false;
    if(filterAuthor){ const authors = getAuthors(b); if(!authors.find(a=> a.ID_TacGia === filterAuthor || a.ID === filterAuthor || a.id === filterAuthor)) return false; }
    if(filterCategory){ const cats = getCategories(b); if(!cats.find(c=> c.ID_TheLoai === filterCategory || c.ID === filterCategory || c.id === filterCategory)) return false; }
    return true;
  });

  return (<div>
    <div className="page-title"><h2>Sách</h2><div className="muted">Danh sách sách trong thư viện</div></div>
    <div className="card">
      <div className="books-search-row" style={{display:'flex', gap:8, marginBottom:12, alignItems:'center'}}>
        <input className="input books-search-input" placeholder="Tìm sách theo tên, ISBN hoặc tác giả..." value={q} onChange={e=>setQ(e.target.value)} />
        <button className="btn books-search-clear" onClick={()=>setQ('')}>Xoá</button>
      </div>
      {me && me.Role === 'admin' ? <div style={{display:'flex', justifyContent:'flex-end', marginBottom:12}}><button className="btn" onClick={startCreate}>Thêm sách</button></div> : null}
      {visibleBooks.map(b=> (
        <BookCard key={b.ID_Sach} book={b} onBorrow={borrowBook} onEdit={startEdit} onDelete={remove} isAdmin={me && me.Role==='admin'} showCover={true} coverMode={'inline'} />
      ))}
    </div>

    {me && me.Role === 'admin' ? (
      <>
        <BookFormModal open={modalOpen} onClose={()=>{ setModalOpen(false); setEditing(null); }} onSave={submit} initial={form} authors={authors} categories={categoriesList} />
      </>
    ) : null}
  </div>)
}
