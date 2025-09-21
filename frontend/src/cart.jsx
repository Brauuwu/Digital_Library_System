import React, { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);

export function useCart(){
  return useContext(CartContext);
}

export default function CartProvider({ children }){
  const [items, setItems] = useState(() => {
    try{ const raw = localStorage.getItem('cart:v1'); return raw ? JSON.parse(raw) : []; }catch(e){ return []; }
  });

  useEffect(()=>{ localStorage.setItem('cart:v1', JSON.stringify(items)); }, [items]);

  const add = (bookId) => setItems(s => s.includes(bookId) ? s : [...s, bookId]);
  const remove = (bookId) => setItems(s => s.filter(x => x !== bookId));
  const clear = () => setItems([]);
  const has = (bookId) => items.includes(bookId);
  const count = () => items.length;

  return (
    <CartContext.Provider value={{ items, add, remove, clear, has, count }}>
      {children}
    </CartContext.Provider>
  );
}
