'use client'

import React, { useState } from "react"
import { Register } from "@/services/api"
import { User, Mail, Lock, FileText, Image as ImageIcon, Heart, Sparkles, MessageCircle, Star, UserCircle, UserCheck, UserX, Eye, EyeOff } from "lucide-react"

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
    bio: "",
    gender: "", // 🆕 thêm trường giới tính
  })

  const [avatar, setAvatar] = useState<File | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  // 🧩 Xử lý khi thay đổi các input text
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatar(file)
    }
  }

  // 🚀 Gửi dữ liệu lên server
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      const formData = new FormData()
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value)
      })

      if (avatar) {
        formData.append("avatar", avatar)
      }

      const res = await Register(formData)

      console.log("Kết quả đăng ký:", res)
      setSuccess("Đăng ký thành công! 🎉")

      // Reset form
      setForm({
        username: "",
        email: "",
        password: "",
        fullName: "",
        bio: "",
        gender: "",
      })
      setAvatar(null)
    } catch (err: any) {
      console.error("Lỗi khi đăng ký:", err)
      setError("Đăng ký thất bại. Vui lòng thử lại!")
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-indigo-400 via-sky-300 to-emerald-300">
      <div className="absolute inset-0 overflow-hidden">
        <Heart className="animate-float text-white/30 size-8 absolute top-10 left-8" />
        <Sparkles className="animate-float-slow text-white/25 size-10 absolute top-24 right-10" />
        <MessageCircle className="animate-float text-white/30 size-9 absolute bottom-16 left-14" />
        <Star className="animate-float-slow text-white/25 size-8 absolute bottom-10 right-8" />
      </div>
      
      {/* Logo VTC Media */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 z-20">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-white drop-shadow-lg tracking-wider">
            VTC Media
          </h1>
          <div className="w-24 h-1 bg-white/80 mx-auto mt-2 rounded-full"></div>
          <p className="text-white/90 text-sm mt-2 font-medium">Tạo tài khoản mới</p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="relative z-10 bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-xl w-full max-w-lg border border-white/40 mt-32"
        encType="multipart/form-data"
      >

        <div className="space-y-5">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 size-5" />
            <input
              type="text"
              name="username"
              placeholder="Tên đăng nhập"
              className="w-full pl-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/90 placeholder-gray-500 shadow-sm"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 size-5" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="w-full pl-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/90 placeholder-gray-500 shadow-sm"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 size-5" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Mật khẩu"
              className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/90 placeholder-gray-500 shadow-sm"
              value={form.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-500"
            >
              {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          </div>

          <div className="relative">
            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 size-5" />
            <input
              type="text"
              name="fullName"
              placeholder="Họ tên đầy đủ"
              className="w-full pl-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/90 placeholder-gray-500 shadow-sm"
              value={form.fullName}
              onChange={handleChange}
            />
          </div>

          <textarea
            name="bio"
            placeholder="Giới thiệu bản thân (bio)"
            className="w-full py-3 px-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/90 placeholder-gray-500 shadow-sm"
            value={form.bio}
            onChange={handleChange}
          />

          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setForm({ ...form, gender: 'Boys' })}
              className={`flex flex-col items-center justify-center py-3 rounded-xl border-2 transition-all ${
                form.gender === 'Boys'
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-600 shadow-md'
                  : 'border-gray-200 bg-white/90 hover:border-indigo-300 hover:shadow-sm'
              }`}
            >
              <UserCheck className="size-6 mb-1" />
              <span className="text-sm font-medium">Nam</span>
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, gender: 'Girls' })}
              className={`flex flex-col items-center justify-center py-3 rounded-xl border-2 transition-all ${
                form.gender === 'Girls'
                  ? 'border-pink-500 bg-pink-50 text-pink-600 shadow-md'
                  : 'border-gray-200 bg-white/90 hover:border-pink-300 hover:shadow-sm'
              }`}
            >
              <UserCircle className="size-6 mb-1" />
              <span className="text-sm font-medium">Nữ</span>
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, gender: 'Other' })}
              className={`flex flex-col items-center justify-center py-3 rounded-xl border-2 transition-all ${
                form.gender === 'Other'
                  ? 'border-purple-500 bg-purple-50 text-purple-600 shadow-md'
                  : 'border-gray-200 bg-white/90 hover:border-purple-300 hover:shadow-sm'
              }`}
            >
              <UserX className="size-6 mb-1" />
              <span className="text-sm font-medium">Khác</span>
            </button>
          </div>

          <div className="relative">
            <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 size-5" />
            <input
              id="avatar"
              type="file"
              name="avatar"
              accept="image/*"
              onChange={handleFileChange}
              className="sr-only"
            />
            <label
              htmlFor="avatar"
              className="flex items-center justify-between w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white/90 shadow-sm cursor-pointer hover:border-indigo-300 hover:shadow"
            >
              <span className="text-gray-800 font-medium">{avatar ? 'Đổi ảnh đại diện' : 'Chọn ảnh đại diện'}</span>
              <span className="text-gray-500 text-sm truncate ml-2">{avatar ? avatar.name : 'Chưa chọn file'}</span>
            </label>
          </div>

          {avatar && (
            <div className="mb-3 flex justify-center">
              <img
                src={URL.createObjectURL(avatar)}
                alt="Avatar preview"
                className="w-24 h-24 rounded-full object-cover border"
              />
            </div>
          )}

          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
          {success && <p className="text-green-600 text-sm text-center">{success}</p>}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-400 text-white font-semibold shadow-lg hover:shadow-xl transition-transform hover:scale-[1.02]"
          >
            Đăng ký
          </button>
        </div>

        <p className="text-sm mt-4 text-center text-gray-700">
          Đã có tài khoản?{' '}
          <a href="/login" className="text-indigo-600 hover:underline">Đăng nhập ngay</a>
        </p>
      </form>
    </div>
  )
}
