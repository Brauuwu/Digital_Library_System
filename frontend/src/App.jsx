import React, { useContext, useEffect, useRef, useState } from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import { AuthContext } from "./auth.jsx";
import "./styles.css";
import logoImg from "./img/logo.png";

// Pages
import Dashboard from "./pages/Dashboard.jsx";
import Books from "./pages/Books.jsx";
import BookDetail from "./pages/BookDetail.jsx";
import Authors from "./pages/Authors.jsx";
import AuthorDetail from "./pages/AuthorDetail.jsx";
import Categories from "./pages/Categories.jsx";
import Publishers from "./pages/Publishers.jsx";
import PublisherDetail from "./pages/PublisherDetail.jsx";
import Cart from "./pages/Cart.jsx";
import Profile from "./pages/Profile.jsx";
import Settings from "./pages/Settings.jsx";
import AdminBorrows from "./pages/AdminBorrows.jsx";
import AdminUsers from "./pages/AdminUsers.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import NotFound from "./pages/NotFound.jsx";

function App() {
  const { user, setAuth } = useContext(AuthContext);
  // notification popups
  const [notifs, setNotifs] = useState([]);

  const logout = () => {
    setAuth(null, null);
    window.location.href = "/";
  };

  // Track last clicked .btn and listen for a global success event to toggle success state
  const lastClickedRef = useRef(null);
  useEffect(() => {
    const onDocClick = (e) => {
      try {
        const btn = e.target.closest && e.target.closest('.btn');
        if (btn) lastClickedRef.current = btn;
      } catch (err) {
        // ignore
      }
    };

    const onSuccess = () => {
      const btn = lastClickedRef.current;
      if (!btn) return;
      btn.classList.add('success');
      // remove success state after 3s
      setTimeout(() => btn.classList.remove('success'), 3000);
      lastClickedRef.current = null;
    };

    document.addEventListener('click', onDocClick);
    window.addEventListener('action:success', onSuccess);
    // listen for custom notify events { detail: { type, message } }
    const onNotify = (e) => {
      const d = e.detail || {};
      const id = Date.now() + Math.random();
      setNotifs(prev => [...prev, { id, type: d.type || 'info', message: d.message || '' }]);
      // auto remove after 3s
      setTimeout(() => setNotifs(prev => prev.filter(n => n.id !== id)), 3000);
    };
    window.addEventListener('notify', onNotify);
    return () => {
      document.removeEventListener('click', onDocClick);
      window.removeEventListener('action:success', onSuccess);
      window.removeEventListener('notify', onNotify);
    };
  }, []);

  return (
    <div className={user?.Role === 'admin' ? 'has-sidebar' : ''}>
      {/* notification popups */}
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 9999 }}>
        {notifs.map(n => (
          <div key={n.id} style={{
            marginBottom: 8,
            padding: '8px 12px',
            background: n.type === 'error' ? '#fdecea' : n.type === 'warning' ? '#fff4e5' : '#e6ffed',
            color: '#111',
            borderRadius: 6,
            boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
            minWidth: 220,
          }}>
            {n.message}
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="app-header">
        <div className="header-inner">
          <div className="brand">
            {/* image logo (keeps similar scale to previous emoji) */}
            <img src={logoImg} alt="logo" style={{ width: 36, height: 36, objectFit: 'contain' }} />
            <div className="brand-name">Thư viện số PTIT</div>
          </div>
          <nav className="nav nav-left">
            <Link to="/">Trang chủ</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/books">Sách</Link>
            <Link to="/authors">Tác giả</Link>
            <Link to="/categories">Thể loại</Link>
            <Link to="/publishers">NXB</Link>
            <Link to="/cart">Phiếu mượn</Link>
          </nav>
          <nav className="nav nav-right">
            {user ? (
              <>
                <Link to="/profile" className="user-link">
                  👤 <span className="nav-username">{user.HoTen}</span>
                </Link>
                <Link to="/settings">⚙️ Cài đặt</Link>
                <button className="btn secondary" onClick={logout}>
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link to="/login">Đăng nhập</Link>
                <Link to="/register">Đăng ký</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Admin sidebar (left) - visible only for admin users */}
      {user?.Role === 'admin' && (
        <aside className="sidebar" aria-label="Admin navigation">
          <nav>
            <Link to="/admin/borrows" className="sidebar-link">Quản lý Mượn/Trả</Link>
            <Link to="/admin/users" className="sidebar-link">Quản lý Người dùng</Link>
          </nav>
        </aside>
      )}

      {/* Main content */}
      <main className="container">
        <Routes>
          <Route
            path="/"
            element={
              <div className="homepage">
                <h2>📚 Hệ thống quản lý thư viện số</h2>
                <div className="icons-grid">
                  <Link to="/books" className="icon-card">📖<span>Sách</span></Link>
                  <Link to="/authors" className="icon-card">✍️<span>Tác giả</span></Link>
                  <Link to="/categories" className="icon-card">📂<span>Thể loại</span></Link>
                  <Link to="/publishers" className="icon-card">🏢<span>NXB</span></Link>
                  <Link to="/cart" className="icon-card">🛒<span>Phiếu mượn</span></Link>
                  <Link to="/profile" className="icon-card">👤<span>Hồ sơ</span></Link>
                  <Link to="/settings" className="icon-card">⚙️<span>Cài đặt</span></Link>
                </div>
              </div>
            }
          />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/books" element={<Books />} />
          <Route path="/books/:id" element={<BookDetail />} />
          <Route path="/authors" element={<Authors />} />
          <Route path="/authors/:id" element={<AuthorDetail />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/publishers" element={<Publishers />} />
          <Route path="/publishers/:id" element={<PublisherDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/settings" element={user ? <Settings /> : <Navigate to="/login" />} />
          <Route path="/admin/borrows" element={user?.Role === "admin" ? <AdminBorrows /> : <Navigate to="/" />} />
          <Route path="/admin/users" element={user?.Role === "admin" ? <AdminUsers /> : <Navigate to="/" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="footer">© 2025 Library System</footer>
    </div>
  );
}

export default App;
