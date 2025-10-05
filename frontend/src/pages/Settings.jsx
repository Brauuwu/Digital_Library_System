import React, { useEffect, useState } from 'react';
import api from '../api';
import { useToast } from '../components/Toast';
import actionSuccess from '../utils/actionSuccess';

export default function Settings() {
  const [me, setMe] = useState(null);
  const [form, setForm] = useState({ HoTen: '', Email: '', SoDienThoai: '', DiaChi: '' });
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const toast = useToast();

  useEffect(() => {
    api.get('/users/me').then(r => {
      setMe(r.data);
      setForm({
        HoTen: r.data.HoTen || '',
        Email: r.data.Email || '',
        SoDienThoai: r.data.SoDienThoai || '',
        DiaChi: r.data.DiaChi || ''
      });
    }).catch(() => {});
  }, []);

  if (!me) return <div className="card" style={{ maxWidth: 600, margin: '24px auto', padding: 20 }}>Vui lòng đăng nhập</div>;

  const submit = async (e) => {
    e.preventDefault();
    try {
      const r = await api.put(`/users/me`, form);
      setMe(r.data);
      setForm({ HoTen: r.data.HoTen || '', Email: r.data.Email || '', SoDienThoai: r.data.SoDienThoai || '', DiaChi: r.data.DiaChi || '' });
      actionSuccess(toast, 'Cập nhật thông tin thành công');
    } catch (err) {
      toast.push({ type: 'error', message: err.response?.data?.error || err.message });
    }
  };

  const changePw = async (e) => {
    e.preventDefault();
    if (!pw || pw !== pw2) {
      toast.push({ type: 'error', message: 'Mật khẩu không khớp' });
      return;
    }
    try {
      // send to /users/me so backend will hash and update
      await api.put(`/users/me`, { Password: pw });
      actionSuccess(toast, 'Đổi mật khẩu thành công');
      setPw(''); setPw2('');
    } catch (err) {
      toast.push({ type: 'error', message: err.response?.data?.error || err.message });
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '24px auto' }}>
      <div className="card">
        <h2>Cài đặt tài khoản</h2>
        <form onSubmit={submit}>
          <div className="form-row">
            <input className="input" placeholder="Họ tên" value={form.HoTen} onChange={e => setForm({ ...form, HoTen: e.target.value })} />
            <input className="input" placeholder="Email" value={form.Email} onChange={e => setForm({ ...form, Email: e.target.value })} />
            <input className="input" placeholder="SĐT" value={form.SoDienThoai} onChange={e => setForm({ ...form, SoDienThoai: e.target.value })} />
            <input className="input" placeholder="Địa chỉ" value={form.DiaChi} onChange={e => setForm({ ...form, DiaChi: e.target.value })} />
          </div>
          <button className="btn">Lưu thay đổi</button>
        </form>
      </div>
      <div className="card" style={{ marginTop: 16 }}>
        <h3>Đổi mật khẩu</h3>
        <form onSubmit={changePw}>
          <div className="form-row">
            <input className="input" placeholder="Mật khẩu mới" type="password" value={pw} onChange={e => setPw(e.target.value)} />
            <input className="input" placeholder="Nhập lại mật khẩu" type="password" value={pw2} onChange={e => setPw2(e.target.value)} />
          </div>
          <button className="btn">Đổi mật khẩu</button>
        </form>
      </div>
    </div>
  );
}
