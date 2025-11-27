// src/lib/api.ts
import { getToken } from './auth';

 export const API_URL = "http://localhost:5000";
  // export const API_URL = "http://222.255.117.234:5000";

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = getToken();

  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(`API error: ${res.status} - ${message}`);
  }

  return res.json();
}
