import React, { useState, useContext } from 'react';
import api, { setToken } from '../api';
import { AuthContext } from '../auth.jsx';
import Alert from '../components/Alert';

export default function Login(){
  const [email,setEmail] = useState('');
  const [pw,setPw] = useState('');
  const [msg,setMsg] = useState('');
  const { setAuth } = useContext(AuthContext);
  const submit = async (e)=>{
    e.preventDefault();
    try{
      const r = await api.post('/auth/login',{ Email: email, Password: pw });
      setAuth(r.data.token, r.data.user);
      setMsg({ type: 'success', text: 'Đăng nhập thành công' });
      // small delay so user sees success
      setTimeout(()=> window.location.href = '/', 700);
    }catch(err){ setMsg(err.response?.data?.message || err.message); }
  }
  return (<div className="card" style={{maxWidth:480, margin:'24px auto'}}>
    <h2>Đăng nhập</h2>
    <form onSubmit={submit}>
      <div className="form-row">
        <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="input" placeholder="Password" type="password" value={pw} onChange={e=>setPw(e.target.value)} />
      </div>
      <div style={{display:'flex',gap:8}}>
        <button className="btn">Đăng nhập</button>
        <div style={{flex:1}}>
          {msg ? (typeof msg === 'string' ? <div className="muted">{msg}</div> : <Alert type={msg.type}>{msg.text}</Alert>) : null}
        </div>
      </div>
    </form>
  </div>)
}
