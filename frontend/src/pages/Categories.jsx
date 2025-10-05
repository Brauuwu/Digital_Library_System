// frontend/pages/Categories.jsx
import React, { useEffect, useState } from "react";
import api from "../api";
import BookCard from "../components/BookCard";

export default function Categories() {
  const [cats, setCats] = useState([]);

  // Load danh sách thể loại
  const load = async () => {
    try {
      const res = await api.get("/categories");
      setCats(res.data || []);
    } catch (e) {
      setCats([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <div className="page-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2>Thể loại</h2>
          <div className="muted">Quản lý các thể loại sách</div>
        </div>
      </div>

      {/* Danh sách thể loại */}
      {cats.map((c) => (
        <div key={c.ID_TheLoai} className="card" style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3>
              {c.TenTheLoai}{" "}
              <span className="muted" style={{ fontSize: 12 }}>
                ({(c.Books || []).length} sách)
              </span>
            </h3>
          </div>
          {(c.Books || []).length === 0 ? (
            <div className="muted">Chưa có sách cho thể loại này.</div>
          ) : (
            (c.Books || []).map((b) => (
              <BookCard key={b.ID_Sach} book={b} isAdmin={false} />
            ))
          )}
        </div>
      ))}
    </div>
  );
}
