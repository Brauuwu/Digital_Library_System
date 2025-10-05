import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../cartContext';
import api from '../api';
import BookCard from '../components/BookCard';
import { useToast } from '../components/Toast';
import actionSuccess from '../utils/actionSuccess';
import { AuthContext } from '../auth.jsx';

export default function CartPage() {
  const cart = useCart();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  // Safe wrappers: some pages may not provide a toast context
  const pushToast = (t) => {
    try {
      if (toast && typeof toast.push === 'function') return toast.push(t);
    } catch (_) { /* ignore */ }
    // fallback to alert for visibility
    if (t && typeof t === 'object') {
      alert((t.type ? `[${t.type}] ` : '') + (t.message || JSON.stringify(t)));
    } else {
      alert(String(t));
    }
  };
  const safeActionSuccess = (tst, msg) => {
    try {
      if (typeof actionSuccess === 'function') return actionSuccess(tst, msg);
    } catch (_) { /* ignore */ }
    // fallback visual
    alert(msg);
  };

  useEffect(() => {
    if (!cart?.items?.length) return setBooks([]);
    Promise.all(cart.items.map(id =>
      api.get(`/books/${id}`).then(r => r.data).catch(() => null)
    )).then(setBooks);
  }, [cart.items]);

  const clearAll = () => { if(!confirm('Xóa tất cả sách?')) return; cart.clear(); };
  const checkout = async () => {
    console.log('[checkout] clicked, items=', cart.items);
    if(!cart.items.length) {
      pushToast({ type:'error', message:'Phiếu mượn rỗng' });
      return;
    }
    try {
      setLoading(true);
      const now = new Date();
      const NgayMuon = now.toISOString();
      const HanTra = new Date(now.getTime()+14*24*60*60*1000).toISOString();

      const payload = {
        ID_NguoiDung: user?.ID_NguoiDung ?? null,
        NgayMuon,
        HanTra,
        items: cart.items.map(id=>({ID_Sach:id}))
      };

      console.log('[checkout] sending payload', payload, 'user=', user);
      // include auth headers so backend can attribute the borrow to the current user
      const headers = {};
      if (user?.ID_NguoiDung) headers['x-user-id'] = user.ID_NguoiDung;
      if (user?.Role) headers['x-user-role'] = user.Role;

      const res = await api.post('/borrows/create', payload, { headers });

      console.log('[checkout] response', res.data);
      const data = res.data || {};
      const created = data.borrow || data; // support older responses
      const successIds = (created?.items || []).map(i => i.ID_Sach);

      // If API returned no items but provided skipped, treat as partial/no-op
      if ((!successIds || successIds.length === 0) && data.skipped && data.skipped.length) {
        const skippedMsg = data.skipped.map(s => (s?.ID_Sach ? `${s.ID_Sach} (${s.reason||'không khả dụng'})` : s)).join(', ');
        pushToast({ type: 'warning', message: `Không có sách khả dụng: ${skippedMsg}` });
        alert(`Không có sách khả dụng: ${skippedMsg}`);
        try { window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'warning', message: `Không có sách khả dụng: ${skippedMsg}` } })); } catch(_) {}
        return;
      }

      // If server returned skipped undefined/empty => all requested items were borrowed
      const skipped = data.skipped || [];
      if (!skipped || skipped.length === 0) {
        if (typeof cart.clear === 'function') cart.clear();
        safeActionSuccess(toast, 'Tạo phiếu mượn thành công');
        pushToast({ type: 'success', message: 'Mượn tất cả thành công' });
        try { window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'success', message: 'Mượn tất cả thành công' } })); } catch(_) {}
        navigate('/profile');
        return;
      }

      // Partial success: remove only successfully-borrowed items, keep skipped in cart
      if (successIds && successIds.length > 0) {
        if (typeof cart.remove === 'function') {
          successIds.forEach(id => cart.remove(id));
        } else if (typeof cart.setItems === 'function') {
          const remaining = (cart.items || []).filter(id => !successIds.includes(id));
          cart.setItems(remaining);
        } else {
          // fallback: clear and re-add skipped
          const remaining = cart.items.filter(id => !successIds.includes(id));
          if (typeof cart.clear === 'function') cart.clear();
          if (remaining.length > 0 && typeof cart.add === 'function') remaining.forEach(id => cart.add(id));
        }
      }

      safeActionSuccess(toast, 'Tạo phiếu mượn (một phần) thành công');
      const skippedMsg = skipped.map(s => (s?.ID_Sach ? `${s.ID_Sach} (${s.reason||'không khả dụng'})` : s)).join(', ');
      pushToast({ type: 'warning', message: `Một số sách không khả dụng: ${skippedMsg}` });
      alert(`Một số sách không khả dụng: ${skippedMsg}`);
      try { window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'warning', message: `Một số sách không khả dụng: ${skippedMsg}` } })); } catch(_) {}
    } catch(err) {
      console.error('[checkout] failed:', err);
      const serverMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      alert('Lỗi khi mượn: ' + serverMsg);
      console.error('[checkout] error', err.response?.data || err);
      pushToast({ type:'error', message: serverMsg });
      try { window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'error', message: serverMsg } })); } catch(_) {}
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-title"><h2>Phiếu mượn</h2><div className="muted">Các sách bạn muốn mượn</div></div>
      <div className="card">
        <div style={{display:'flex', justifyContent:'space-between', marginBottom:12}}>
          <div>Items: {cart.count()}</div>
          <div style={{display:'flex', gap:8}}>
            <button className="btn" onClick={clearAll} disabled={cart.count()===0 || loading}>Xóa tất cả</button>
            <button className="btn" onClick={checkout} disabled={cart.count()===0 || loading}>
              {loading ? 'Đang xử lý...' : 'Mượn tất cả'}
            </button>
          </div>
        </div>
        {books.length===0 ? <div className="muted">Phiếu mượn rỗng!</div> :
          books.map(b => <BookCard key={b.ID_Sach} book={b} showCover coverMode="inline" />)}
      </div>
    </div>
  );
}
