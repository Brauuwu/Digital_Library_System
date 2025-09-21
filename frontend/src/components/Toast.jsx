import React, { createContext, useContext, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }){
  const [toasts,setToasts] = useState([]);
  const push = (t) => { const id = Date.now(); setToasts(s=>[...s, { id, ...t }]); setTimeout(()=> setToasts(s=>s.filter(x=>x.id!==id)), 3000); };
  return (<ToastContext.Provider value={{ push }}>
    {children}
    <div style={{position:'fixed', right:20, top:20, zIndex:1000}}>
      {toasts.map(t=> (
        <div key={t.id} style={{background: t.type==='success' ? '#ecfccb' : '#fee2e2', padding:10, borderRadius:6, marginBottom:8, boxShadow:'0 2px 8px rgba(0,0,0,0.08)'}}>
          <strong style={{display:'block'}}>{t.title || (t.type==='success' ? 'Thành công' : 'Lỗi')}</strong>
          <div>{t.message}</div>
        </div>
      ))}
    </div>
  </ToastContext.Provider>);
}

export function useToast(){ return useContext(ToastContext); }

export default ToastContext;
