import React, { useEffect, useState } from 'react';
import api from '../api';
import BookCard from '../components/BookCard';
import BookFormModal from '../components/BookFormModal';
import { useToast } from '../components/Toast';
import actionSuccess from '../utils/actionSuccess';
import { useCart } from '../cartContext';

export default function Books() {
  const [books, setBooks] = useState([]);
  const [me, setMe] = useState(null);
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ TieuDeSach:'', ISBN:'', NamXuatBan:'', SoLuongCon:1 });
  const [modalOpen, setModalOpen] = useState(false);
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const toast = useToast();
  const cart = useCart();

  useEffect(() => {
    loadBooks();
    api.get('/users/me').then(r => setMe(r.data)).catch(()=>{});
    api.get('/authors').then(r => setAuthors(r.data)).catch(()=>{});
    api.get('/categories').then(r => setCategories(r.data)).catch(()=>{});
    api.get('/publishers').then(r => setPublishers(r.data)).catch(()=>{});
  }, []);

  const loadBooks = () => api.get('/books').then(r=>setBooks(r.data)).catch(()=>{});

  const startCreate = () => {
    setEditing(null);
    setForm({ TieuDeSach:'', ISBN:'', NamXuatBan:'', SoLuongCon:1, authorIds:[], categoryIds:[], ID_NXB: null });
    setModalOpen(true);
  };

  const startEdit = (b) => {
    setEditing(b.ID_Sach);
    setForm({
      TieuDeSach: b.TieuDeSach,
      ISBN: b.ISBN,
      NamXuatBan: b.NamXuatBan,
      SoLuongCon: b.SoLuongCon,
      authorIds: (b.Authors||[]).map(a=>a.ID_TacGia),
      categoryIds: (b.Categories||[]).map(c=>c.ID_TheLoai),
      ID_NXB: b.Publisher ? b.Publisher.ID_NXB : null
    });
    setModalOpen(true);
  };

  const submit = async (payload) => {
    try {
      if(editing) await api.put(`/books/${editing}`, payload);
      else await api.post('/books', payload);
      loadBooks();
      setEditing(null);
      setModalOpen(false);
  actionSuccess(toast, editing ? 'Sửa sách thành công' : 'Thêm sách thành công');
    } catch(err) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message;
      toast.push({ type:'error', message: msg });
    }
  };

  const remove = async (id) => {
    if(!confirm('Xóa sách này?')) return;
    await api.delete(`/books/${id}`);
    loadBooks();
  };

  const borrowBook = async (bookId) => {
  if(!me) return toast.push({ type:'error', message: 'Vui lòng đăng nhập để mượn sách' });
    cart.add(bookId);
  actionSuccess(toast, 'Đã thêm sách vào giỏ mượn');
  };

  const filteredBooks = books.filter(b => {
    const s = q.toLowerCase();
    if(!q) return true;
    if(b.TieuDeSach.toLowerCase().includes(s)) return true;
    if(b.ISBN.toLowerCase().includes(s)) return true;
    if((b.Authors||[]).some(a=> (a.HoTen||a.TenTacGia||'').toLowerCase().includes(s))) return true;
    return false;
  });

  return (
    <div>
      <div className="page-title"><h2>Sách</h2><div className="muted">Danh sách sách trong thư viện</div></div>
      <div className="card">
        <div style={{display:'flex', gap:8, marginBottom:12}}>
          <input className="input" placeholder="Tìm sách..." value={q} onChange={e=>setQ(e.target.value)} />
          <button className="btn" onClick={()=>setQ('')}>Xoá</button>
        </div>

        {me?.Role==='admin' && <div style={{display:'flex', justifyContent:'flex-end', marginBottom:12}}>
          <button className="btn" onClick={startCreate}>Thêm sách</button>
        </div>}

        {filteredBooks.map(b => (
          <BookCard
            key={b.ID_Sach}
            book={b}
            onBorrow={borrowBook}
            onEdit={startEdit}
            onDelete={remove}
            isAdmin={me?.Role==='admin'}
            showCover
            coverMode="inline"
          />
        ))}

        {modalOpen && me?.Role==='admin' && (
          <BookFormModal open={modalOpen} onClose={()=>{setModalOpen(false); setEditing(null);}} onSave={submit} initial={form} authors={authors} categories={categories} publishers={publishers} />
        )}
      </div>
    </div>
  );
}
