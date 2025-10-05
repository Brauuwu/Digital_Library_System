import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cart')||'[]'); }
    catch { return []; }
  });

  useEffect(() => { localStorage.setItem('cart', JSON.stringify(items)); }, [items]);

  const add = (id) => { if (!items.includes(id)) setItems([...items, id]); };
  const remove = (id) => { setItems(items.filter(x => x!==id)); };
  const clear = () => setItems([]);
  const has = (id) => items.includes(id);
  const count = () => items.length;

  return (
    <CartContext.Provider value={{ items, add, remove, clear, has, count }}>
      {children}
    </CartContext.Provider>
  );
}


export function useCart() { return useContext(CartContext); }
