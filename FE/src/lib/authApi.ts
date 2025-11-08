// src/lib/authApi.ts
import { setToken } from './auth';
import { API_URL } from './api';

interface LoginPayload {
  email: string;
  password: string;
}

export async function login({ email, password }: LoginPayload) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Đăng nhập thất bại: ${msg}`);
  }

  const data = await res.json();

  // Nếu backend trả token trong "access_token"
  if (data.access_token) {
    setToken(data.access_token);
  } else {
    throw new Error('Không nhận được access_token từ backend');
  }

  return data;
}
