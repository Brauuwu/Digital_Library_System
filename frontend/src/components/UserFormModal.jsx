import React, { useEffect, useState } from 'react';
import Modal from './Modal';
import UserForm from './UserForm';

export default function UserFormModal({ open, onClose, onSave, initial = {} }){
  const [form, setForm] = useState({ HoTen:'', Email:'', SoDienThoai:'', DiaChi:'', Password:'', Role:'user' });
  useEffect(()=>{ setForm({ HoTen: initial.HoTen || '', Email: initial.Email || '', SoDienThoai: initial.SoDienThoai || '', DiaChi: initial.DiaChi || '', Password: '', Role: initial.Role || 'user' }); }, [initial, open]);
  const submit = (e)=>{ e.preventDefault(); onSave(form); };
  return (
    <Modal open={open} onClose={onClose} title={form.HoTen ? 'Sửa người dùng' : 'Thêm người dùng'}>
      <form onSubmit={submit}>
        <UserForm form={form} setForm={setForm} />
        <div style={{display:'flex',gap:8}}>
          <button className="btn">Lưu</button>
          <button type="button" className="btn" onClick={onClose}>Hủy</button>
        </div>
      </form>
    </Modal>
  )
}
