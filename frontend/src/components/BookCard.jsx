import React from 'react';
import { useCart } from '../cart';

export default function BookCard({ book, onBorrow, onEdit, onDelete, isAdmin, showMeta = true, showCover = false, coverMode = 'dashboard', selectable = false, selected = false, onSelect }){
  return (<div className={`list-row ${showCover ? 'dash-row' : ''} ${coverMode==='inline' ? 'inline-cover' : ''} ${selected ? 'book-selected' : ''}`}>
    {/* inline-cover mode: cover on the left, main info in center, actions on right */}
    {showCover && coverMode === 'inline' ? (
      <>
        <div className="cover-col">
          {book.coverUrl ? (
            <img src={book.coverUrl} alt={book.TieuDeSach} className="book-cover-img" onError={(e)=>{ e.target.onerror=null; e.target.src=''; }} />
          ) : (
            <div className="cover-frame">Bìa</div>
          )}
        </div>
        <div style={{flex:1,paddingRight:12}}>
    <div className="book-title" style={{fontWeight:700}}>{book.TieuDeSach}</div>
          <div className="muted">{book.ISBN} • {book.NamXuatBan}</div>
          {showMeta ? (
            <>
              <div style={{marginTop:6}}>
                <span className="book-author-italic">{(book.Authors||[]).map(a=> a.HoTen || a.TenTacGia || a.name).filter(Boolean).join(', ')}{book.NamXuatBan ? ` (${book.NamXuatBan})` : ''}</span>
              </div>
              <div style={{marginTop:6}}>
                <div className="book-excerpt">{((book.MoTa||book.Description||book.GioiThieu||'') + '').slice(0,600) || ''}{((book.MoTa||book.Description||book.GioiThieu||'')||'').length > 600 ? '...' : ''}</div>
              </div>
              <div style={{marginTop:6}}>
                <span className="muted" style={{marginRight:6}}>Thể loại:</span>
                <span>{(book.Categories||[]).map(c=> c.TenTheLoai || c.name).filter(Boolean).join(', ')}</span>
              </div>
            </>
          ) : null}
        </div>
        <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:8}}>
          <div className="muted">{book.SoLuongCon} bản</div>
          {isAdmin ? (
            <div style={{display:'flex',gap:8}}>
              <button className="btn" onClick={()=>onEdit && onEdit(book)}>Sửa</button>
              <button className="btn" onClick={()=>onDelete && onDelete(book.ID_Sach)}>Xóa</button>
            </div>
          ) : (
            (book.SoLuongCon||0) > 0 ? (
              <BookCartButton book={book} />
            ) : (
              <div className="out-of-stock">Đã hết</div>
            )
          )}
        </div>
      </>
    ) : (
      <div>
        {showCover && coverMode === 'dashboard' ? (
          <div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
            <div className="cover-frame" style={{width:120,height:160,background:'#f3f4f6',borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',color:'#9ca3af'}}>Bìa</div>
            <div style={{display:'flex',flexDirection:'column',justifyContent:'center',gap:8}}>
              <div className="dash-qty">Số lượng còn: <span style={{fontWeight:600}}>{book.SoLuongCon || 0}</span></div>
              {isAdmin ? (
                <div style={{display:'flex',gap:8}}>
                  <button className="btn" onClick={()=>onEdit && onEdit(book)}>Sửa</button>
                  <button className="btn" onClick={()=>onDelete && onDelete(book.ID_Sach)}>Xóa</button>
                </div>
              ) : (
                (book.SoLuongCon||0) > 0 ? (
                  <div className="dash-action"><BookCartButton book={book} /></div>
                ) : (
                  <div className="dash-action"><div className="out-of-stock">Đã hết</div></div>
                )
              )}
            </div>
          </div>
        ) : null}

  <div className="book-title" style={{fontWeight:700, marginTop: showCover ? 12 : 0}}>{book.TieuDeSach}</div>
        <div className="muted">{book.ISBN} • {book.NamXuatBan}</div>
        {showMeta ? (
          <>
            <div style={{marginTop:6}}>
              <span className="muted" style={{marginRight:6}}>Tác giả:</span>
              <span>{(book.Authors||[]).map(a=> a.HoTen || a.TenTacGia || a.name).filter(Boolean).join(', ')}</span>
            </div>
            <div style={{marginTop:4}}>
              <span className="muted" style={{marginRight:6}}>Thể loại:</span>
              <span>{(book.Categories||[]).map(c=> c.TenTheLoai || c.name).filter(Boolean).join(', ')}</span>
            </div>
          </>
        ) : null}
      </div>
    )}
    {/* right-side actions already handled in inline mode; nothing more here */}
  </div>)
}

function BookCartButton({ book }){
  const cart = useCart();
  const inCart = cart && cart.has(book.ID_Sach);
  return (
    <div style={{display:'flex',gap:8}}>
          {inCart ? (
            <button className="btn secondary" onClick={()=>cart.remove(book.ID_Sach)}>Xóa khỏi giỏ</button>
          ) : (
            <button className="btn" onClick={()=>cart.add(book.ID_Sach)}>Mượn</button>
          )}
    </div>
  );
}
