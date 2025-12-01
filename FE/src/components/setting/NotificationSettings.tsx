// Ví dụ: NotificationSettings.tsx
"use client";

import { useState } from "react";
import SaveButton from "./SaveButton";

export default function NotificationSettings() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
  });

  const toggle = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Cài đặt thông báo
      </h2>

      <div className="bg-white rounded-2xl p-6 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          Tùy chọn nhận thông báo
        </h3>
        <div className="space-y-6">
          {[
            { key: "email", label: "Thông báo qua Email", desc: "Nhận thông báo quan trọng qua email" },
            { key: "push", label: "Thông báo đẩy", desc: "Nhận ngay trên thiết bị" },
            { key: "sms", label: "Thông báo SMS", desc: "Nhận tin nhắn văn bản" },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between py-3">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">{item.label}</h4>
                <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">{item.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications[item.key as keyof typeof notifications]}
                  onChange={() => toggle(item.key as keyof typeof notifications)}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <SaveButton />
    </div>
  );
}