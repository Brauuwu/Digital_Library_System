import React, { useEffect, useState } from 'react';
import Modal from './Modal';

export default function BookFormModal({ open, onClose, onSave, initial = {}, authors=[], categories=[] }){
  const [form, setForm] = useState({ TieuDeSach:'', ISBN:'', NamXuatBan:'', SoLuongCon:1, authorIds:[], categoryIds:[] });
  useEffect(()=>{ setForm({ TieuDeSach: initial.TieuDeSach || '', ISBN: initial.ISBN || '', NamXuatBan: initial.NamXuatBan || '', SoLuongCon: initial.SoLuongCon || 1, authorIds: initial.authorIds || (initial.Authors||[]).map(a=>a.ID_TacGia) || [], categoryIds: initial.categoryIds || (initial.Categories||[]).map(c=>c.ID_TheLoai) || [] }); }, [initial, open]);

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
          <div style={{flex:1}}>
            <div style={{fontWeight:700, marginBottom:6}}>Chọn tác giả</div>
            <div style={{display:'flex', flexWrap:'wrap', gap:8}}>
              {authors.map(a=> (
                <label key={a.ID_TacGia} style={{display:'inline-flex', alignItems:'center', gap:6}}>
                  <input type="checkbox" checked={(form.authorIds||[]).includes(a.ID_TacGia)} onChange={e=>{
                    const next = new Set(form.authorIds||[]);
                    if(e.target.checked) next.add(a.ID_TacGia); else next.delete(a.ID_TacGia);
                    setForm({...form, authorIds: Array.from(next)});
                  }} /> {a.TenTacGia}
                </label>
              ))}
            </div>
          </div>
          <div style={{flex:1}}>
            <div style={{fontWeight:700, marginBottom:6}}>Chọn thể loại</div>
            <div style={{display:'flex', flexWrap:'wrap', gap:8}}>
              {categories.map(c=> (
                <label key={c.ID_TheLoai} style={{display:'inline-flex', alignItems:'center', gap:6}}>
                  <input type="checkbox" checked={(form.categoryIds||[]).includes(c.ID_TheLoai)} onChange={e=>{
                    const next = new Set(form.categoryIds||[]);
                    if(e.target.checked) next.add(c.ID_TheLoai); else next.delete(c.ID_TheLoai);
                    setForm({...form, categoryIds: Array.from(next)});
                  }} /> {c.TenTheLoai}
                </label>
              ))}
            </div>
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
