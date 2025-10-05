import React, { useEffect, useState } from 'react';
import api from '../api';
import UserForm from '../components/UserForm';
import UserFormModal from '../components/UserFormModal';
import { useToast } from '../components/Toast';
import actionSuccess from '../utils/actionSuccess';

export default function AdminUsers(){
  const [users,setUsers]=useState([]);
  const [editing,setEditing]=useState(null);
  const [form,setForm]=useState({ HoTen:'', Email:'', SoDienThoai:'', DiaChi:'', Password:'', Role:'user' });
  useEffect(()=>{ load(); },[]);
  const load = ()=> api.get('/users').then(r=>setUsers(r.data)).catch(()=>{});
  const toast = useToast();
  const [modalOpen,setModalOpen] = useState(false);
  const startCreate = ()=>{ setEditing(null); setForm({ HoTen:'', Email:'', SoDienThoai:'', DiaChi:'', Password:'', Role:'user' }); setModalOpen(true); };
  const startEdit = (u)=>{ setEditing(u.ID_NguoiDung); setForm({ HoTen:u.HoTen, Email:u.Email, SoDienThoai:u.SoDienThoai, DiaChi:u.DiaChi, Password:'', Role: u.Role||'user' }); setModalOpen(true); };
  const submit = async (formData)=>{
    try{
  if(editing){ await api.put(`/users/${editing}`, formData); actionSuccess(toast, 'Sửa người dùng thành công'); }
  else{ await api.post('/users', formData); actionSuccess(toast, 'Thêm người dùng thành công'); }
      await load(); setEditing(null); setModalOpen(false);
    }catch(err){ toast.push({ type:'error', message: err.response?.data?.error || err.message }); }
  }
  const remove = async (id)=>{ if(!confirm('Xóa người dùng này?')) return; await api.delete(`/users/${id}`); actionSuccess(toast, 'Đã xóa người dùng'); load(); };

  return (<div>
    <div className="page-title"><h2>Người dùng</h2><div className="muted">Quản lý người dùng (Admin)</div></div>
    <div className="card">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
        <strong>Danh sách</strong>
        <button className="btn" onClick={startCreate}>Thêm người dùng</button>
      </div>
      {users.map(u=> (
        <div className="list-row" key={u.ID_NguoiDung}>
          <div>
            <div style={{fontWeight:700}}>{u.HoTen}</div>
            <div className="muted" style={{fontSize:12}}>{u.Email}</div>
          </div>
          <div style={{display:'flex',gap:8}}>
            <div className="muted">{u.Role}</div>
            <button className="btn" onClick={()=>startEdit(u)}>Sửa</button>
            <button className="btn" onClick={()=>remove(u.ID_NguoiDung)}>Xóa</button>
          </div>
        </div>
      ))}
    </div>

    <UserFormModal open={modalOpen} onClose={()=>{ setModalOpen(false); setEditing(null); }} onSave={submit} initial={form} />
  </div>)
}
