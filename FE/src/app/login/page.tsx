'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchAPI } from '@/lib/api'


export default function LoginPage() {
  const router = useRouter()
  const [usernameOrEmail, setUsernameOrEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
    const data = await fetchAPI('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernameOrEmail, password }),
    })

    console.log(data)

    if (!data.access_token) {
      setError(data.message || 'Sai tài khoản hoặc mật khẩu')
      return
    }

    // ✅ Lưu token JWT vào localStorage
    localStorage.setItem('token', data.access_token)
    localStorage.setItem('userId', data.user.id)
    localStorage.setItem('username',data.user.username)
    // ✅ Chuyển hướng về trang chính
    router.push('/')
  } catch (err) {
    console.error(err)
    setError('Không thể kết nối tới server')
  }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded-xl shadow-md w-80"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Đăng nhập</h2>

        <input
          type="text"
          placeholder="Tên đăng nhập hoặc Email"
          className="w-full mb-3 p-2 border rounded"
          value={usernameOrEmail}
          onChange={(e) => setUsernameOrEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Mật khẩu"
          className="w-full mb-3 p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
        >
          Đăng nhập
        </button>
        <p>Bạn chưa có tài khoảng ?<a href='/register'>Đăng kí ngay</a></p>
      </form>
    </div>
  )
}
