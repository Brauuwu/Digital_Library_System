import React, { createContext, useState, useEffect } from 'react';
import api, { setToken as setApiToken } from './api';

export const AuthContext = createContext({ user: null, token: null, setAuth: ()=>{} });

export function AuthProvider({ children }){
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(null);

  useEffect(()=>{
    const t = localStorage.getItem('token');
    if(t){
      setApiToken(t);
      setTokenState(t);
      // fetch current user
      api.get('/users/me').then(r=> setUser(r.data)).catch(()=>{ setUser(null); setApiToken(null); localStorage.removeItem('token'); });
    }
  },[]);

  const setAuth = (t, userObj)=>{
    if(t){
      localStorage.setItem('token', t);
      setApiToken(t);
      setTokenState(t);
    }else{
      localStorage.removeItem('token');
      setApiToken(null);
      setTokenState(null);
    }
    setUser(userObj || null);
  };

  return (<AuthContext.Provider value={{ user, token, setAuth }}>
    {children}
  </AuthContext.Provider>);
}

export default AuthProvider;
