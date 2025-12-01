// app/settings/components/AppearanceSettings.tsx
"use client";

import { Save } from "lucide-react";
import { useState } from "react";

export default function AppearanceSettings() {
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("vi");

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Giao diện
      </h2>

      <div className="bg-white rounded-2xl p-6 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 dark:text-gray-100">
          Tùy chỉnh giao diện
        </h3>

        <div className="grid gap-8 max-w-2xl">

          {/* Chế độ sáng/tối */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 dark:text-gray-300">
              Chế độ hiển thị
            </label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
            >
              <option value="light">Chế độ sáng</option>
              <option value="dark">Chế độ tối</option>
              <option value="system">Theo hệ thống</option>
            </select>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {theme === "system" ? "Tự động chuyển theo cài đặt thiết bị của bạn" : ""}
            </p>
          </div>

          {/* Ngôn ngữ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 dark:text-gray-300">
              Ngôn ngữ hiển thị
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English (Anh)</option>
              <option value="en-us">English (Mỹ)</option>
              <option value="zh">中文 (Tiếng Trung)</option>
              <option value="ja">日本語 (Tiếng Nhật)</option>
            </select>
          </div>

        </div>
      </div>

      {/* Nút lưu */}
      <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-700">
        <button className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-2xl hover:bg-blue-700 transition-all flex items-center gap-3 shadow-lg">
          <Save className="w-6 h-6" />
          <span>Lưu thay đổi</span>
        </button>
      </div>
    </div>
  );
}