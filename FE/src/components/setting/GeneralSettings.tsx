// app/settings/components/GeneralSettings.tsx
"use client";

import { Save } from "lucide-react";
import { useState } from "react";

export default function GeneralSettings() {
  const [defaultPrivacy, setDefaultPrivacy] = useState("public");
  const [timezone, setTimezone] = useState("UTC+7");

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Cài đặt chung
      </h2>

      <div className="bg-white rounded-2xl p-6 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 dark:text-gray-100">
          Tùy chọn chung
        </h3>

        <div className="grid gap-8 max-w-2xl">

          {/* Quyền riêng tư mặc định */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 dark:text-gray-300">
              Quyền riêng tư mặc định cho bài viết mới
            </label>
            <select
              value={defaultPrivacy}
              onChange={(e) => setDefaultPrivacy(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
            >
              <option value="public">Công khai (Mọi người)</option>
              <option value="friends">Bạn bè</option>
              <option value="private">Riêng tư (Chỉ mình tôi)</option>
            </select>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Bạn luôn có thể thay đổi riêng cho từng bài viết khi đăng
            </p>
          </div>

          {/* Múi giờ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 dark:text-gray-300">
              Múi giờ
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
            >
              <option value="UTC+7">UTC+7 - Việt Nam, Bangkok, Jakarta</option>
              <option value="UTC+8">UTC+8 - Singapore, Trung Quốc, Úc (Perth)</option>
              <option value="UTC+9">UTC+9 - Nhật Bản, Hàn Quốc</option>
              <option value="UTC+10">UTC+10 - Úc (Sydney, Melbourne)</option>
              <option value="UTC+0">UTC+0 - London, Dublin</option>
              <option value="UTC-5">UTC-5 - New York, Toronto (EST)</option>
              <option value="UTC-8">UTC-8 - Los Angeles, Vancouver (PST)</option>
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