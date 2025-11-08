'use client'

import React, { useState } from "react"
import { Register } from "@/services/api"

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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md w-96"
        encType="multipart/form-data"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Đăng ký</h2>

        <input
          type="text"
          name="username"
          placeholder="Tên đăng nhập"
          className="w-full mb-3 p-2 border rounded"
          value={form.username}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          className="w-full mb-3 p-2 border rounded"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Mật khẩu"
          className="w-full mb-3 p-2 border rounded"
          value={form.password}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="fullName"
          placeholder="Họ tên đầy đủ"
          className="w-full mb-3 p-2 border rounded"
          value={form.fullName}
          onChange={handleChange}
        />

        <textarea
          name="bio"
          placeholder="Giới thiệu bản thân (bio)"
          className="w-full mb-3 p-2 border rounded"
          value={form.bio}
          onChange={handleChange}
        />

        {/* 🆕 Chọn giới tính */}
        <select
          name="gender"
          className="w-full mb-3 p-2 border rounded bg-white"
          value={form.gender}
          onChange={handleChange}
          required
        >
          <option value="">-- Chọn giới tính --</option>
          <option value="Boys">Nam</option>
          <option value="Girls">Nữ</option>
          <option value="Other">Khác</option>
        </select>

        {/* 🖼️ Upload avatar */}
        <input
          type="file"
          name="avatar"
          accept="image/*"
          className="w-full mb-3"
          onChange={handleFileChange}
        />

        {avatar && (
          <div className="mb-3 flex justify-center">
            <img
              src={URL.createObjectURL(avatar)}
              alt="Avatar preview"
              className="w-24 h-24 rounded-full object-cover border"
            />
          </div>
        )}

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        {success && <p className="text-green-500 text-sm mb-2">{success}</p>}

        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition-all"
        >
          Đăng ký
        </button>

        <p className="text-sm mt-3 text-center">
          Đã có tài khoản?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Đăng nhập ngay
          </a>
        </p>
      </form>
    </div>
  )
}
