import React, { useState, useContext } from "react";
import api, { setToken } from "../api";
import { AuthContext } from "../auth.jsx";
import Alert from "../components/Alert";

export default function Login() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState(null);
  const { setAuth } = useContext(AuthContext);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const r = await api.post("/auth/login", { Email: email, Password: pw });

      // Lưu token + user
      const user = { ...r.data.user, token: r.data.token };
      setAuth(r.data.token, r.data.user);

      setMsg({ type: "success", text: "Đăng nhập thành công" });
      setTimeout(() => (window.location.href = "/"), 700);
    } catch (err) {
      setMsg({
        type: "error",
        text: err.response?.data?.message || err.message,
      });
    }
  };

  return (
    <div
      style={{
        minHeight: "80vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px",
      }}
    >
      <div className="auth-container">
        <h2>Đăng nhập</h2>
        <form onSubmit={submit}>
          <div className="form-row">
            <label>Email</label>
            <input
              type="email"
              className="input"
              placeholder="Nhập email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-row">
            <label>Mật khẩu</label>
            <input
              type="password"
              className="input"
              placeholder="Nhập mật khẩu"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
            />
          </div>
          <button type="submit" className="btn">
            Đăng nhập
          </button>

          {msg && (
            <div style={{ marginTop: "12px" }}>
              {typeof msg === "string" ? (
                <div style={{ fontSize: "0.9rem", color: "#dc2626" }}>{msg}</div>
              ) : (
                <Alert type={msg.type}>{msg.text}</Alert>
              )}
            </div>
          )}
        </form>
        <div style={{ marginTop: "12px", textAlign: "center" }}>
          <a href="/register">Chưa có tài khoản? Đăng ký</a>
        </div>
      </div>
    </div>
  );
}
