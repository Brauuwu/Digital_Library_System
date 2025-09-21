import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:4000/api' });

export function setToken(token){
  api.defaults.headers.common['Authorization'] = token ? `Bearer ${token}` : undefined;
}

export default api;
