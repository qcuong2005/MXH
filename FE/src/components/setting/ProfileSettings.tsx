"use client";

import { useEffect, useState } from "react";
import SaveButton from "./SaveButton";
import { fetchAPI } from "@/lib/api";
import { updateUserProfile } from "@/services/api"; // Hoặc đường dẫn chứa hàm api bạn vừa viết

export default function ProfileSettings() {
  // Đổi thành fullName để khớp với backend updateProfile
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // 1. Load thông tin hiện tại của User
  useEffect(() => {
    const loadUserData = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      try {
        const user = await fetchAPI(`/users/${userId}`);
        if (user) {
          setFullName(user.fullName || "");
          setBio(user.bio || "");
        }
      } catch (error) {
        console.error("Lỗi tải thông tin user:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadUserData();
  }, []);

  // 2. Hàm lưu thay đổi
  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Bạn chưa đăng nhập!");
      return;
    }

    setLoading(true);
    try {
      await updateUserProfile(token, {
        fullName: fullName,
        bio: bio,
      });
      alert("Cập nhật hồ sơ thành công! 🎉");
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      alert("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="p-6 text-center text-gray-500">Đang tải thông tin...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Cài đặt hồ sơ
      </h2>

      <div className="bg-white rounded-2xl p-6 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 mb-5 dark:text-gray-100">
          Thông tin cá nhân
        </h3>
        <div className="grid gap-5">
          {/* Full Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
              Tên hiển thị
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
              placeholder="Nhập tên hiển thị của bạn"
            />
          </div>

          {/* Bio Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
              Giới thiệu bản thân
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 resize-none dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
              placeholder="Hãy kể một chút về bạn..."
            />
          </div>
        </div>
      </div>

      {/* Truyền sự kiện onClick vào SaveButton */}
      {/* Lưu ý: Bạn cần sửa file SaveButton.tsx để nhận prop onClick nếu chưa có */}
      <div onClick={handleSave}>
        <SaveButton isLoading={loading} />
      </div>
    </div>
  );
}