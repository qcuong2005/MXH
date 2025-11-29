// src/lib/api.ts
import { getToken } from './auth';

export const API_URL = "http://localhost:5000";
// export const API_URL = "http://222.255.117.234:5000";

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = getToken();

  // 1. Tạo headers mặc định
  const headers: any = {
    'Content-Type': 'application/json', // Mặc định là JSON
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // 2. FIX LỖI UPLOAD: Nếu body là FormData, phải XOÁ Content-Type
  // Để trình duyệt tự động set là "multipart/form-data; boundary=..."
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers, // Sử dụng headers đã xử lý ở trên
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(`API error: ${res.status} - ${message}`);
  }

  return res.json();
}