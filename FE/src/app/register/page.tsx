"use client";

import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Register } from "@/services/api";
import {
  User,
  Mail,
  Lock,
  FileText,
  Image as ImageIcon,
  Heart,
  Sparkles,
  MessageCircle,
  Star,
  Eye,
  EyeOff,
  UserCheck,
  UserCircle,
  UserX,
} from "lucide-react";

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
    bio: "",
    gender: "",
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setAvatar(e.target.files[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading("Đang xử lý...");

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (avatar) formData.append("avatar", avatar);

      await Register(formData);

      toast.dismiss(loadingToast);
      toast.success("Đăng ký thành công! Đang chuyển hướng...", {
        duration: 2000,
      });

      setTimeout(() => {
        window.location.href = "/login";
      }, 1800);
    } catch (err: any) {
      toast.dismiss(loadingToast);
      console.log("Chi tiết lỗi:", err);

      let msg = "Đã có lỗi xảy ra. Vui lòng thử lại!";

      // Xử lý lỗi: Ưu tiên check object response trước
      if (err?.response?.data?.message) {
        const serverMessage = err.response.data.message;
        msg = Array.isArray(serverMessage) ? serverMessage[0] : serverMessage;
      } 
      // Xử lý lỗi: Check chuỗi string chứa JSON (Trường hợp của bạn)
      else if (err?.message && typeof err.message === "string") {
        try {
          // Tìm đoạn JSON trong chuỗi lỗi
          const jsonMatch = err.message.match(/\{.*\}/);
          if (jsonMatch) {
            const parsedError = JSON.parse(jsonMatch[0]);
            if (parsedError.message) {
              msg = Array.isArray(parsedError.message)
                ? parsedError.message[0]
                : parsedError.message;
            }
          }
        } catch (e) {
          // Nếu parse thất bại thì giữ nguyên msg mặc định
        }
      }

      toast.error(msg);
    }
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />

      {/* Background */}
      <div className="min-h-screen relative flex flex-col items-center justify-center bg-gradient-to-br from-indigo-400 via-sky-300 to-emerald-300 overflow-hidden px-4 py-8">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <Heart className="absolute top-10 left-8 text-white/30 animate-float" size={48} />
          <Sparkles className="absolute top-24 right-10 text-white/25 animate-float-slow" size={56} />
          <MessageCircle className="absolute bottom-16 left-14 text-white/30 animate-float" size={52} />
          <Star className="absolute bottom-10 right-8 text-white/25 animate-float-slow" size={48} />
        </div>

        {/* Logo */}
        <div className="relative z-20 text-center mb-6 lg:mb-4">
          <h1 className="text-5xl lg:text-5xl font-extrabold text-white drop-shadow-2xl tracking-wider">
            VTC Media
          </h1>
          <div className="w-32 h-1 bg-white/80 mx-auto mt-3 rounded-full"></div>
          <p className="text-white/90 text-lg mt-3 font-medium">
            Tạo tài khoản mới
          </p>
        </div>

        {/* Form Card */}
        <div className="relative z-10 w-full max-w-5xl mx-auto px-0 sm:px-6">
          <form
            onSubmit={handleSubmit}
            className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 
                       p-6 sm:p-8 lg:p-6 
                       max-w-lg sm:max-w-2xl md:max-w-3xl lg:max-w-3xl 
                       mx-auto"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-2xl font-bold text-center text-gray-800 mb-8 lg:mb-6">
              Bắt đầu hành trình
            </h2>

            {/* Grid layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-5">
              {/* Cột trái */}
              <div className="space-y-5 lg:space-y-4">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 lg:w-4 lg:h-4" size={20} />
                  <input
                    type="text"
                    name="username"
                    placeholder="Tên đăng nhập"
                    required
                    value={form.username}
                    onChange={handleChange}
                    className="w-full pl-12 pr-5 py-4 lg:py-2.5 bg-white/70 border border-gray-300 rounded-xl lg:rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 transition text-base lg:text-sm"
                  />
                </div>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 lg:w-4 lg:h-4" size={20} />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    className="w-full pl-12 pr-5 py-4 lg:py-2.5 bg-white/70 border border-gray-300 rounded-xl lg:rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300 transition text-base lg:text-sm"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 lg:w-4 lg:h-4" size={20} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Mật khẩu"
                    required
                    value={form.password}
                    onChange={handleChange}
                    className="w-full pl-12 pr-14 py-4 lg:py-2.5 bg-white/70 border border-gray-300 rounded-xl lg:rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 transition text-base lg:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-600"
                  >
                    {showPassword ? <EyeOff size={20} className="lg:w-4 lg:h-4" /> : <Eye size={20} className="lg:w-4 lg:h-4" />}
                  </button>
                </div>

                <div className="relative">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 lg:w-4 lg:h-4" size={20} />
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Họ tên đầy đủ"
                    value={form.fullName}
                    onChange={handleChange}
                    className="w-full pl-12 pr-5 py-4 lg:py-2.5 bg-white/70 border border-gray-300 rounded-xl lg:rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300 transition text-base lg:text-sm"
                  />
                </div>
              </div>

              {/* Cột phải */}
              <div className="space-y-5 lg:space-y-4">
                <textarea
                  name="bio"
                  placeholder="Giới thiệu (tùy chọn)"
                  rows={3}
                  value={form.bio}
                  onChange={handleChange}
                  className="w-full p-4 lg:p-3 bg-white/70 border border-gray-300 rounded-xl lg:rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300 resize-none text-base lg:text-sm"
                />

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2 lg:mb-1">Giới tính</p>
                  <div className="grid grid-cols-3 gap-3 lg:gap-2">
                    {[
                      { value: "Boys", icon: UserCheck, label: "Nam", color: "indigo" },
                      { value: "Girls", icon: UserCircle, label: "Nữ", color: "pink" },
                      { value: "Other", icon: UserX, label: "Khác", color: "purple" },
                    ].map(({ value, icon: Icon, label, color }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, gender: value }))}
                        className={`flex flex-col items-center py-3 lg:py-2 rounded-xl lg:rounded-lg border-2 transition-all text-sm lg:text-xs
                          ${form.gender === value
                            ? `border-${color}-500 bg-${color}-50 text-${color}-700 shadow-md scale-105`
                            : "border-gray-300 hover:border-gray-400"
                          }`}
                      >
                        <Icon className="size-6 lg:size-5 mb-1" />
                        <span className="font-medium">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="avatar"
                    className="flex flex-row lg:flex-row items-center justify-center gap-3 p-3 lg:p-2 border-2 border-dashed border-gray-300 rounded-xl lg:rounded-lg cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition"
                  >
                    <ImageIcon className="text-indigo-600" size={28} />
                    <span className="text-gray-700 font-medium text-sm lg:text-xs truncate max-w-[150px]">
                      {avatar ? avatar.name : "Chọn ảnh đại diện"}
                    </span>
                  </label>
                  
                  {avatar && (
                    <div className="mt-2 hidden lg:flex justify-center">
                       <p className="text-xs text-green-600 font-bold">Đã tải lên ảnh đại diện</p>
                    </div>
                  )}

                  {avatar && (
                    <div className="mt-4 flex lg:hidden justify-center">
                      <img
                        src={URL.createObjectURL(avatar)}
                        alt="preview"
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Nút submit */}
            <button
              type="submit"
              className="w-full mt-8 lg:mt-6 py-4 lg:py-3 bg-gradient-to-r from-indigo-600 to-emerald-500 text-white text-lg lg:text-base font-bold rounded-2xl lg:rounded-xl shadow-xl hover:shadow-2xl active:scale-98 transition"
            >
              Tạo tài khoản
            </button>

            <p className="text-center mt-6 lg:mt-4 text-gray-600 text-sm lg:text-xs">
              Đã có tài khoản?{" "}
              <a href="/login" className="text-indigo-600 font-bold hover:underline">
                Đăng nhập ngay
              </a>
            </p>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(10deg); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 10s ease-in-out infinite; }
      `}</style>
    </>
  );
}