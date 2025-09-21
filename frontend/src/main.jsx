import React, { useContext } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Books from './pages/Books'
import Categories from './pages/Categories'
import Profile from './pages/Profile'
import AdminUsers from './pages/AdminUsers'
import AdminBorrows from './pages/AdminBorrows'
import './styles.css'
import AuthProvider, { AuthContext } from './auth.jsx'
import { ToastProvider } from './components/Toast'
import CartProvider, { useCart } from './cart'
import CartPage from './pages/Cart'

function Header(){
  const { user, setAuth } = useContext(AuthContext);
  const cart = useCart && useCart();
  const logout = ()=>{ setAuth(null, null); window.location.href = '/'; };
  return (<header className="app-header">
    <div className="header-inner">
      <div className="brand">
        <div className="logo">PT</div>
        <div>
          <div style={{fontWeight:700}}>Thư viện số</div>
          <div className="muted" style={{fontSize:12}}>Hệ thống quản lý Thư viện</div>
        </div>
      </div>
      <nav className="nav">
        <div className="nav-left">
          <Link to="/">Dashboard</Link>
          <Link to="/books">Sách</Link>
          {user && user.Role === 'admin' ? <Link to="/admin/users">Người dùng</Link> : null}
          {user && user.Role === 'admin' ? <Link to="/admin/borrows">Mượn trả</Link> : null}
        </div>
        <div className="nav-right">
          {user ? <a onClick={logout} style={{cursor:'pointer'}}>Đăng xuất</a> : <><Link to="/login">Đăng nhập</Link><Link to="/register">Đăng ký</Link></>}
          <Link to="/cart" style={{marginLeft:12, position:'relative'}} aria-label="Phiếu mượn">
            <span style={{display:'inline-block', padding:6, borderRadius:6, background:'#ef4444', color:'#fff', fontWeight:700}}>{cart ? cart.count() : 0}</span>
          </Link>
          {user ? (
            <Link to="/profile" className="nav-link user-link" style={{display:'inline-flex',alignItems:'center',gap:8, marginLeft:12}}>
              <div className="avatar" style={{width:36,height:36,borderRadius:18, background:'#0ea5a4', color:'#fff', display:'inline-flex', alignItems:'center', justifyContent:'center', fontWeight:700}}>{user && user.HoTen ? user.HoTen.split(' ').map(p=>p[0]).slice(-2).join('') : 'U'}</div>
            </Link>
          ) : null}
        </div>
      </nav>
    </div>
  </header>)
}

function App(){
  return (
    <BrowserRouter>
      <Header />
      <div className="container">
        <Routes>
          <Route path="/" element={<Dashboard/>} />
          <Route path="/books" element={<Books/>} />
          <Route path="/cart" element={<CartPage/>} />
          <Route path="/profile" element={<Profile/>} />
          <Route path="/admin/users" element={<AdminUsers/>} />
          <Route path="/admin/borrows" element={<AdminBorrows/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/register" element={<Register/>} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <ToastProvider>
      <CartProvider>
      <App />
      </CartProvider>
    </ToastProvider>
  </AuthProvider>
)
