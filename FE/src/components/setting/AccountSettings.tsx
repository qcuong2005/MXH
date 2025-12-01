
"use client";

import { useState } from "react";
import { Eye, EyeOff, Save, Trash2 } from "lucide-react";

export default function AccountSettings() {
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <div className="space-y-6">
      {/* Tiêu đề */}
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Cài đặt tài khoản
      </h2>

      {/* Form đổi mật khẩu */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 mb-5 dark:text-gray-100">
          Đổi mật khẩu
        </h3>

        <div className="grid gap-5 max-w-2xl">
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
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
              placeholder="Tối thiểu 8 ký tự, có chữ hoa, số và ký tự đặc biệt"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
              placeholder="Nhập lại mật khẩu mới"
            />
            {newPassword && confirmPassword && newPassword !== confirmPassword && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                Mật khẩu xác nhận không khớp!
              </p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <button className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors">
            Cập nhật mật khẩu
          </button>
        </div>
      </div>

      {/* Vùng nguy hiểm - Xóa tài khoản */}
      <div className="bg-red-50 rounded-2xl p-6 border-2 border-red-300 dark:bg-red-900/20 dark:border-red-800">
        <h3 className="text-xl font-bold text-red-800 mb-4 dark:text-red-300">
          Vùng nguy hiểm
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h4 className="text-lg font-semibold text-red-900 dark:text-red-300">
              Xóa tài khoản vĩnh viễn
            </h4>
            <p className="text-sm text-red-700 mt-2 dark:text-red-400 leading-relaxed">
              Khi xóa tài khoản, tất cả bài viết, bình luận, lượt thích và dữ liệu cá nhân sẽ bị xóa hoàn toàn.<br />
              Hành động này <strong>không thể hoàn tác</strong>.
            </p>
          </div>

          <button className="px-6 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-all flex items-center gap-2 shadow-lg whitespace-nowrap">
            <Trash2 className="w-5 h-5" />
            <span>Xóa tài khoản</span>
          </button>
        </div>
      </div>

      {/* Nút lưu chung (nếu muốn dùng chung toàn trang) */}
      <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-700">
        <button className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-2xl hover:bg-blue-700 transition-all flex items-center gap-3 shadow-lg">
          <Save className="w-6 h-6" />
          <span>Lưu tất cả thay đổi</span>
        </button>
      </div>
    </div>
  );
}