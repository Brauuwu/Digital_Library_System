import React from 'react'

export default function Alert({ type='error', children }){
  const bg = type === 'success' ? '#e6fffa' : '#fff1f2';
  const border = type === 'success' ? '#b2f5ea' : '#fecaca';
  const color = type === 'success' ? '#065f46' : '#991b1b';
  return (
    <div style={{background:bg, border:`1px solid ${border}`, color, padding:12, borderRadius:8, marginBottom:12}}>
      {children}
    </div>
  )
}
