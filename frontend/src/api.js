// frontend/api.js
import axios from 'axios';

// Tạo instance axios mặc định
const api = axios.create({
  baseURL: 'http://localhost:4000/api', // thay bằng URL backend của bạn nếu khác
});

// Token được lưu trong closure
let token = null;

// Set token cho tất cả request
export function setToken(t) {
  token = t;
  if (t) {
    api.defaults.headers.common['Authorization'] = `Bearer ${t}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

// Lấy token hiện tại
export function getToken() {
  return token;
}

// Các phương thức CRUD / request khác dùng api trực tiếp
export default api;
