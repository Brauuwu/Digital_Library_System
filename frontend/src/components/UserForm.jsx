import React from 'react';

export default function UserForm({ form, setForm }){
  return (<div>
    <div className="form-row">
      <input className="input" placeholder="Họ tên" value={form.HoTen} onChange={e=>setForm({...form, HoTen:e.target.value})} />
      <input className="input" placeholder="Email" value={form.Email} onChange={e=>setForm({...form, Email:e.target.value})} />
      <input className="input" placeholder="SĐT" value={form.SoDienThoai} onChange={e=>setForm({...form, SoDienThoai:e.target.value})} />
      <input className="input" placeholder="Địa chỉ" value={form.DiaChi} onChange={e=>setForm({...form, DiaChi:e.target.value})} />
      <input className="input" placeholder="Password (để trống nếu không đổi)" type="password" value={form.Password} onChange={e=>setForm({...form, Password:e.target.value})} />
      <select className="input" value={form.Role} onChange={e=>setForm({...form, Role:e.target.value})}>
        <option value="user">user</option>
        <option value="admin">admin</option>
      </select>
    </div>
  </div>)
}
