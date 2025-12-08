"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react"; // Import thêm icon AlertCircle
import { changePassword } from "@/services/api";


export default function AccountSettings() {
  const [showPassword, setShowPassword] = useState(false);
  
  // State form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // State xử lý
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // State để hiện lỗi ra màn hình

  // Hàm xử lý đổi mật khẩu
  const handleUpdatePassword = async () => {
    // Reset lỗi cũ mỗi khi bấm nút
    setErrorMessage(null);

    // 1. Validate phía Client
    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    if (newPassword.length < 3) {
      setErrorMessage("Mật khẩu mới phải có ít nhất 3 ký tự!");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Mật khẩu xác nhận không khớp!");
      return;
    }

    const token = localStorage.getItem("token"); // hoặc localStoragecon
    if (!token) {
      setErrorMessage("Bạn chưa đăng nhập!");
      return;
    }

    try {
      setIsLoading(true);

      // 2. Gọi API
      const result = await changePassword(token, {
        oldPassword: currentPassword,
        newPassword: newPassword,
        confirmNewPassword: confirmPassword,
      });

      // 3. Thành công
      alert(result.message || "Đổi mật khẩu thành công!");
      
      // Reset form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

    } catch (error: any) {
      

      // --- XỬ LÝ HIỂN THỊ LỖI ---
      let displayError = "Đổi mật khẩu thất bại. Vui lòng thử lại.";

      // Trường hợp 1: Lỗi trả về từ request.ts có dạng: "Error: HTTP error! ... Message: {JSON}"
      if (error?.message && typeof error.message === 'string') {
        // Dùng Regex để tìm phần JSON nằm sau chữ "Message: "
        const match = error.message.match(/Message: ({.*})/);
        
        if (match && match[1]) {
            try {
                // Parse chuỗi JSON đó ra object
                const parsedError = JSON.parse(match[1]);
                // Lấy message từ backend ("Bạn chỉ có thể đổi mật khẩu lại sau 7 ngày nữa.")
                if (parsedError.message) {
                    // Backend đôi khi trả về mảng string (validation pipe) hoặc string đơn
                    displayError = Array.isArray(parsedError.message) 
                        ? parsedError.message.join(", ") 
                        : parsedError.message;
                }
            } catch (e) {
                // Nếu parse lỗi thì dùng nguyên chuỗi gốc
                displayError = error.message; 
            }
        } else if (error.message.includes("400")) {
             // Fallback nếu regex không bắt được nhưng có mã 400
             displayError = error.message; 
        }
      }
      
      // Trường hợp 2: Nếu request.ts trả về object error response chuẩn (Axios style)
      if (error?.response?.data?.message) {
         displayError = Array.isArray(error.response.data.message)
            ? error.response.data.message.join(", ")
            : error.response.data.message;
      }

      // Set lỗi vào state để hiển thị ra UI
      setErrorMessage(displayError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Cài đặt tài khoản
      </h2>

      <div className="bg-white rounded-2xl p-6 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 mb-5 dark:text-gray-100">
          Đổi mật khẩu
        </h3>

        <div className="grid gap-5 max-w-2xl">
          {/* ... (Các ô input giữ nguyên như cũ) ... */}
          
          {/* Mật khẩu hiện tại */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
              Mật khẩu hiện tại
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mật khẩu mới */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
              Mật khẩu mới
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
              placeholder="Tối thiểu 3 ký tự"
            />
          </div>

          {/* Xác nhận mật khẩu mới */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
              Xác nhận mật khẩu mới
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-gray-100 
                ${newPassword && confirmPassword && newPassword !== confirmPassword 
                  ? "border-red-500 focus:ring-red-500" 
                  : "border-gray-300 dark:border-gray-700"}`}
              placeholder="Nhập lại mật khẩu mới"
            />
          </div>
        </div>

        {/* --- KHU VỰC HIỂN THỊ LỖI --- */}
        {errorMessage && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span className="text-sm font-medium">{errorMessage}</span>
          </div>
        )}

        <div className="mt-6">
          <button 
            onClick={handleUpdatePassword}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
            {isLoading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
          </button>
        </div>
      </div>
    </div>
  );
}