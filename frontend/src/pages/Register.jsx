import React, { useState, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../auth.jsx';
import Alert from '../components/Alert';

export default function Register(){
  const [form,setForm] = useState({ HoTen:'', Email:'', SoDienThoai:'', DiaChi:'', Password:'' });
  const [msg,setMsg] = useState('');
  const { setAuth } = useContext(AuthContext);
  const submit = async (e)=>{
    e.preventDefault();
    try{
      const r = await api.post('/auth/register', form);
      // after register, automatically login
      const login = await api.post('/auth/login', { Email: form.Email, Password: form.Password });
      setAuth(login.data.token, login.data.user);
      setMsg({ type: 'success', text: 'Đăng ký thành công — đang chuyển hướng...' });
      setTimeout(()=> window.location.href = '/', 900);
    }catch(err){ setMsg(err.response?.data?.message || err.response?.data?.error || err.message); }
  }
  return (<div className="card" style={{maxWidth:600, margin:'24px auto'}}>
    <h2>Đăng ký</h2>
    <form onSubmit={submit}>
      <div className="form-row">
        <input className="input" placeholder="Họ tên" value={form.HoTen} onChange={e=>setForm({...form, HoTen: e.target.value})} />
        <input className="input" placeholder="Email" value={form.Email} onChange={e=>setForm({...form, Email: e.target.value})} />
        <input className="input" placeholder="SĐT" value={form.SoDienThoai} onChange={e=>setForm({...form, SoDienThoai: e.target.value})} />
        <input className="input" placeholder="Địa chỉ" value={form.DiaChi} onChange={e=>setForm({...form, DiaChi: e.target.value})} />
        <input className="input" placeholder="Password" type="password" value={form.Password} onChange={e=>setForm({...form, Password: e.target.value})} />
      </div>
      <div style={{display:'flex',gap:8}}>
        <button className="btn">Đăng ký</button>
        <div style={{flex:1}}>
          {msg ? (typeof msg === 'string' ? <div className="muted">{msg}</div> : <Alert type={msg.type}>{msg.text}</Alert>) : null}
        </div>
      </div>
    </form>
  </div>)
}
