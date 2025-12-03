"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast"; // Import Toast
import { fetchAPI } from "@/lib/api";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Heart,
  Sparkles,
  MessageCircle,
  Star,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Hiện loading
    const loadingToast = toast.loading("Đang đăng nhập...");

    try {
      const data = await fetchAPI("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernameOrEmail, password }),
      });

      // Kiểm tra nếu API trả về data nhưng không có access_token (trường hợp backend không throw lỗi mà trả về 200 kèm lỗi)
      if (!data.access_token) {
        throw new Error(JSON.stringify(data)); // Ném lỗi xuống catch để xử lý chung
      }

      // 2. Lưu thông tin vào LocalStorage
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("username", data.user.username);
      localStorage.setItem("role", data.user.role); // Nếu có role
      window.dispatchEvent(new Event("user-logged-in"));
      // 3. Thông báo thành công
      toast.dismiss(loadingToast);
      toast.success("Đăng nhập thành công!", { duration: 2000 });

      // 4. Chuyển hướng
      setTimeout(() => {
        router.push("/"); // Chuyển về trang chủ hoặc Dashboard
      }, 1000);

    } catch (err: any) {
      toast.dismiss(loadingToast);
      console.log("Lỗi đăng nhập:", err);

      let msg = "Sai tài khoản hoặc mật khẩu!";

      // --- LOGIC XỬ LÝ LỖI MẠNH MẼ (Copy từ Register) ---
      
      // Trường hợp 1: Lỗi trả về dạng Object chuẩn
      if (err?.response?.data?.message) {
        const serverMessage = err.response.data.message;
        msg = Array.isArray(serverMessage) ? serverMessage[0] : serverMessage;
      } 
      // Trường hợp 2: Lỗi trả về dạng String chứa JSON (Lỗi HTTP Error string)
      else if (err?.message && typeof err.message === "string") {
        try {
          const jsonMatch = err.message.match(/\{.*\}/);
          if (jsonMatch) {
            const parsedError = JSON.parse(jsonMatch[0]);
            // Ưu tiên lấy message từ JSON parse được
            if (parsedError.message) {
               msg = Array.isArray(parsedError.message) ? parsedError.message[0] : parsedError.message;
            }
          } 
        } catch (e) {
          // Nếu không parse được thì giữ nguyên msg mặc định hoặc msg gốc nếu ngắn
           if(err.message.length < 100) msg = err.message;
        }
      }

      toast.error(msg);
    }
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />

      <div className="min-h-screen bg-gradient-to-br from-indigo-400 via-sky-300 to-emerald-300 flex flex-col items-center justify-center px-6 relative overflow-hidden">
        
        {/* Background icons */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <Heart className="absolute top-10 left-8 text-white/30 animate-float" size={48} />
          <Sparkles className="absolute top-24 right-10 text-white/20 animate-float-slow" size={56} />
          <MessageCircle className="absolute bottom-32 left-12 text-white/25 animate-float" size={52} />
          <Star className="absolute bottom-16 right-8 text-white/30 animate-float-slow" size={44} />
        </div>

        {/* Logo + Slogan */}
        <div className="text-center mb-10 lg:mb-6 -mt-10 relative z-10">
          <h1 className="text-6xl lg:text-5xl font-black text-white drop-shadow-2xl tracking-tight">
            VTC Media
          </h1>
          <p className="text-white/90 text-lg font-medium mt-3 tracking-wider">
            Kết nối mọi người
          </p>
        </div>

        {/* Card đăng nhập – Responsive: To ở mobile, Gọn ở Laptop */}
        <div className="w-full relative z-10
                        max-w-sm lg:max-w-md 
                        bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 
                        p-8 lg:p-6">
          
          <h2 className="text-2xl lg:text-xl font-bold text-gray-800 text-center mb-8 lg:mb-6">
            Chào mừng trở lại
          </h2>

          <form onSubmit={handleLogin} className="space-y-5 lg:space-y-4">
            
            {/* Input Username/Email */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600">
                <User className="w-5 h-5 lg:w-4 lg:h-4" />
              </div>
              <input
                type="text"
                placeholder="Tên đăng nhập hoặc Email"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                // Mobile: py-4, text-base | Laptop: py-3, text-sm
                className="w-full pl-12 pr-5 py-4 lg:py-3 bg-gray-50/80 border border-gray-200 rounded-2xl lg:rounded-xl text-gray-800 placeholder-gray-500 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-base lg:text-sm"
                required
              />
            </div>

            {/* Input Password */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600">
                <Lock className="w-5 h-5 lg:w-4 lg:h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                // Mobile: py-4, text-base | Laptop: py-3, text-sm
                className="w-full pl-12 pr-12 py-4 lg:py-3 bg-gray-50/80 border border-gray-200 rounded-2xl lg:rounded-xl text-gray-800 placeholder-gray-500 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-base lg:text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-600"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 lg:w-4 lg:h-4" />
                ) : (
                  <Eye className="w-5 h-5 lg:w-4 lg:h-4" />
                )}
              </button>
            </div>

            {/* Quên mật khẩu */}
            <div className="flex justify-end">
              <a href="#" className="text-sm lg:text-xs text-indigo-600 font-semibold hover:underline">
                Quên mật khẩu?
              </a>
            </div>

            {/* Nút Đăng nhập */}
            <button
              type="submit"
              // Mobile: py-4, text-lg | Laptop: py-3, text-base
              className="w-full py-4 lg:py-3 mt-4 bg-gradient-to-r from-indigo-600 to-blue-500 text-white text-lg lg:text-base font-bold rounded-2xl lg:rounded-xl shadow-lg hover:shadow-xl active:scale-98 transition-all duration-200"
            >
              Đăng nhập
            </button>
          </form>

          {/* Đăng ký */}
          <p className="text-center mt-6 lg:mt-5 text-gray-600 text-sm lg:text-xs font-medium">
            Chưa có tài khoản?{" "}
            <a
              href="/register"
              className="text-indigo-600 font-bold hover:underline"
            >
              Đăng ký ngay
            </a>
          </p>
        </div>

        {/* Khoảng trống dưới cùng */}
        <div className="h-10" />
      </div>
    </>
  );
}