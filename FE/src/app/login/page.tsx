'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchAPI } from '@/lib/api'
import { User, Lock, Heart, Sparkles, MessageCircle, Star, Eye, EyeOff } from 'lucide-react'


export default function LoginPage() {
  const router = useRouter()
  const [usernameOrEmail, setUsernameOrEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
    localStorage.setItem('role',data.user.role)
    // ✅ Chuyển hướng về trang chính
    router.push('/')
  } catch (err) {
    console.error(err)
    setError('Không thể kết nối tới server')
  }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-indigo-400 via-sky-300 to-emerald-300">
      <div className="absolute inset-0 overflow-hidden">
        <Heart className="animate-float text-white/40 size-8 absolute top-10 left-8" />
        <Sparkles className="animate-float-slow text-white/25 size-10 absolute top-24 right-10" />
        <MessageCircle className="animate-float text-white/40 size-9 absolute bottom-16 left-14" />
        <Star className="animate-float-slow text-white/25 size-8 absolute bottom-10 right-8" />
      </div>
      
      {/* Logo VTC Media */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 z-20">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-white drop-shadow-lg tracking-wider">
            VTC Media
          </h1>
          <div className="w-24 h-1 bg-white/80 mx-auto mt-2 rounded-full"></div>
          <p className="text-white/90 text-sm mt-2 font-medium">Kết nối mọi người</p>
        </div>
      </div>

      <form
        onSubmit={handleLogin}
        className="relative z-10 bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-xl w-full max-w-md border border-white/40 mt-32"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Chào mừng trở lại</h2>

        <div className="space-y-5">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 size-5" />
            <input
              type="text"
              placeholder="Tên đăng nhập hoặc Email"
              className="w-full pl-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/90 placeholder-gray-500 shadow-sm"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 size-5" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Mật khẩu"
              className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/90 placeholder-gray-500 shadow-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-500"
            >
              {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          </div>

          {error && <p className="text-red-600 text-sm text-center">{error}</p>}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-400 text-white font-semibold shadow-lg hover:shadow-xl transition-transform hover:scale-[1.02]"
          >
            Đăng nhập
          </button>
        </div>

        <p className="text-sm mt-4 text-center text-gray-700">
          Chưa có tài khoản?{' '}
          <a href='/register' className="text-indigo-600 hover:underline">Đăng ký ngay</a>
        </p>
      </form>
    </div>
  )
}
