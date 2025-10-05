// frontend/components/BookCard.jsx
import React from 'react';
import { useCart } from '../cartContext';
import { Link } from 'react-router-dom';

export default function BookCard({
  book,
  onBorrow,
  onEdit,
  onDelete,
  isAdmin = false,
  showCover = false,
  coverMode = 'inline'
}) {
  const cart = useCart();
  const inCart = cart.has(book.ID_Sach);

  // Chuẩn hóa tác giả nếu không có
  const authors = book.Authors || book.AuthorsList || [];
  const authorNames = authors.map(a => a.HoTen || a.TenTacGia).join(', ');

  return (
    <div className={`list-row ${showCover ? 'dash-row' : ''} ${coverMode==='inline' ? 'inline-cover' : ''}`}>
      {showCover && (
        <div className="cover-col">
          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={book.TieuDeSach}
              className="book-cover-img"
            />
          ) : (
            <div className="book-cover-img cover-frame"></div>
          )}
        </div>
      )}

      <div style={{ flex: 1, paddingLeft: showCover ? 12 : 0 }}>
        <div style={{ fontWeight: 700 }}>{book.TieuDeSach}</div>
        {authorNames && <div className="muted">{authorNames}</div>}
        <div className="muted">
          {book.SoLuongCon != null ? `${book.SoLuongCon} bản` : ''}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          alignItems: 'flex-end',
        }}
      >
        <Link to={`/books/${book.ID_Sach}`} className="btn secondary">Xem</Link>

        {isAdmin ? (
          <>
            <button className="btn" onClick={() => onEdit && onEdit(book)}>
              Sửa
            </button>
            <button
              className="btn"
              onClick={() => onDelete && onDelete(book.ID_Sach)}
            >
              Xóa
            </button>
          </>
        ) : book.SoLuongCon > 0 ? (
          <button
            className={`btn ${inCart ? 'secondary' : ''}`}
            onClick={() =>
              inCart ? cart.remove(book.ID_Sach) : onBorrow(book.ID_Sach)
            }
          >
            {inCart ? 'Xóa khỏi giỏ' : 'Mượn'}
          </button>
        ) : (
          <div className="out-of-stock">Đã hết</div>
        )}
      </div>
    </div>
  );
}
