import React, { useEffect, useState, useRef } from 'react';

function AuthorDropdown({ authors = [], value = [], onChange }){
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(()=>{
    function onDoc(e){
      if(ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('click', onDoc);
    return ()=>document.removeEventListener('click', onDoc);
  },[]);

  const toggle = () => setOpen(s => !s);

  const toggleId = (id)=>{
    const set = new Set(value || []);
    if(set.has(id)) set.delete(id); else set.add(id);
    onChange(Array.from(set));
  };

  const selectedNames = (value||[]).map(id=>{
    const a = authors.find(x => (x.ID_TacGia||x.id) === id);
    return a ? (a.HoTen || a.TenTacGia || a.Ten || a.name) : '';
  }).filter(Boolean);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div className="input" onClick={toggle} style={{ cursor: 'pointer', minHeight: 40, display: 'flex', alignItems: 'center' }}>
        {selectedNames.length ? selectedNames.join(', ') : <span style={{ color: '#888' }}>-- Chọn tác giả --</span>}
      </div>
      {open && (
        <div style={{ position: 'absolute', zIndex: 40, background: 'white', border: '1px solid #eee', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', padding: 8, marginTop: 6, maxHeight: 240, overflow: 'auto', minWidth: 260 }}>
          {authors.map(a => {
            const id = a.ID_TacGia || a.id;
            const name = a.HoTen || a.TenTacGia || a.Ten || a.name || '';
            return (
              <label key={id} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '6px 4px' }}>
                <input type="checkbox" checked={(value||[]).includes(id)} onChange={()=>toggleId(id)} />
                <span>{name}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CategoryDropdown({ categories = [], value = [], onChange }){
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(()=>{
    function onDoc(e){
      if(ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('click', onDoc);
    return ()=>document.removeEventListener('click', onDoc);
  },[]);

  const toggle = () => setOpen(s => !s);

  const toggleId = (id)=>{
    const set = new Set(value || []);
    if(set.has(id)) set.delete(id); else set.add(id);
    onChange(Array.from(set));
  };

  const selectedNames = (value||[]).map(id=>{
    const a = categories.find(x => (x.ID_TheLoai||x.id) === id);
    return a ? (a.TenTheLoai || a.Ten || a.name) : '';
  }).filter(Boolean);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div className="input" onClick={toggle} style={{ cursor: 'pointer', minHeight: 40, display: 'flex', alignItems: 'center' }}>
        {selectedNames.length ? selectedNames.join(', ') : <span style={{ color: '#888' }}>-- Chọn thể loại --</span>}
      </div>
      {open && (
        <div style={{ position: 'absolute', zIndex: 40, background: 'white', border: '1px solid #eee', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', padding: 8, marginTop: 6, maxHeight: 240, overflow: 'auto', minWidth: 260 }}>
          {categories.map(c => {
            const id = c.ID_TheLoai || c.id;
            const name = c.TenTheLoai || c.Ten || c.name || '';
            return (
              <label key={id} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '6px 4px' }}>
                <input type="checkbox" checked={(value||[]).includes(id)} onChange={()=>toggleId(id)} />
                <span>{name}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PublisherDropdown({ publishers = [], value = null, onChange }){
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(()=>{
    function onDoc(e){
      if(ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('click', onDoc);
    return ()=>document.removeEventListener('click', onDoc);
  },[]);

  const toggle = () => setOpen(s => !s);

  const selectId = (id) => {
    onChange(id);
    setOpen(false);
  };

  const selectedName = (()=>{
    if(!value) return null;
    const p = publishers.find(x => (x.ID_NXB||x.id) === value);
    return p ? (p.TenNXB || p.Ten || p.name) : null;
  })();

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div className="input" onClick={toggle} style={{ cursor: 'pointer', minHeight: 40, display: 'flex', alignItems: 'center' }}>
        {selectedName ? selectedName : <span style={{ color: '#888' }}>-- Chọn nhà xuất bản --</span>}
      </div>
      {open && (
        <div style={{ position: 'absolute', zIndex: 40, background: 'white', border: '1px solid #eee', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', padding: 8, marginTop: 6, maxHeight: 240, overflow: 'auto', minWidth: 260 }}>
          {publishers.map(p => {
            const id = p.ID_NXB || p.id;
            const name = p.TenNXB || p.Ten || p.name || '';
            return (
              <div key={id} style={{ padding: '6px 4px' }}>
                <label style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer' }}>
                  <input type="radio" name="publisher" checked={value === id} onChange={() => selectId(id)} />
                  <span>{name}</span>
                </label>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
import Modal from './Modal';

export default function BookFormModal({ open, onClose, onSave, initial = {}, authors=[], categories=[], publishers=[] }){
  const [form, setForm] = useState({ TieuDeSach:'', ISBN:'', NamXuatBan:'', SoLuongCon:1, authorIds:[], categoryIds:[], ID_NXB: null });
  useEffect(()=>{
    setForm({
      TieuDeSach: initial.TieuDeSach || '',
      ISBN: initial.ISBN || '',
      NamXuatBan: initial.NamXuatBan || '',
      SoLuongCon: initial.SoLuongCon || 1,
      authorIds: initial.authorIds || (initial.Authors||[]).map(a=>a.ID_TacGia) || [],
      categoryIds: initial.categoryIds || (initial.Categories||[]).map(c=>c.ID_TheLoai) || [],
      ID_NXB: initial.ID_NXB || (initial.Publisher && initial.Publisher.ID_NXB) || null
    });
  }, [initial, open]);

  const submit = (e)=>{ e.preventDefault(); onSave(form); };

  return (
    <Modal open={open} onClose={onClose} title={form.TieuDeSach ? 'Sửa sách' : 'Thêm sách'}>
      <form onSubmit={submit}>
        <div className="form-row">
          <input className="input" placeholder="Tiêu đề" value={form.TieuDeSach} onChange={e=>setForm({...form, TieuDeSach:e.target.value})} />
          <input className="input" placeholder="ISBN" value={form.ISBN} onChange={e=>setForm({...form, ISBN:e.target.value})} />
          <input className="input" placeholder="Năm xuất bản" value={form.NamXuatBan} onChange={e=>setForm({...form, NamXuatBan:e.target.value})} />
          <input className="input" placeholder="Số lượng" type="number" value={form.SoLuongCon} onChange={e=>setForm({...form, SoLuongCon: parseInt(e.target.value||0)})} />
        </div>
        <div style={{display:'flex',gap:12}}>
          <div style={{flex:1, position: 'relative'}}>
            <div style={{fontWeight:700, marginBottom:6}}>Chọn tác giả</div>
            <AuthorDropdown
              authors={authors}
              value={form.authorIds || []}
              onChange={(nextIds)=>setForm({...form, authorIds: nextIds})}
            />
          </div>
          <div style={{flex:1}}>
            <div style={{fontWeight:700, marginBottom:6}}>Chọn thể loại</div>
            <CategoryDropdown
              categories={categories}
              value={form.categoryIds || []}
              onChange={(next)=>setForm({...form, categoryIds: next})}
            />
          </div>
          <div style={{flex:1, position: 'relative'}}>
            <div style={{fontWeight:700, marginBottom:6}}>Nhà xuất bản</div>
            <PublisherDropdown
              publishers={publishers}
              value={form.ID_NXB || null}
              onChange={(id)=>setForm({...form, ID_NXB: id})}
            />
          </div>
        </div>
        <div style={{display:'flex',gap:8, marginTop:12}}>
          <button className="btn">Lưu</button>
          <button type="button" className="btn" onClick={onClose}>Hủy</button>
        </div>
      </form>
    </Modal>
  )
}
