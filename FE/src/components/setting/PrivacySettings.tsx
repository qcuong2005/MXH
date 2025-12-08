// // app/settings/components/PrivacySettings.tsx
// "use client";

// import { Save } from "lucide-react";
// import { useState } from "react";

// export default function PrivacySettings() {
//   const [profileVisibility, setProfileVisibility] = useState("public");
//   const [showEmail, setShowEmail] = useState(false);
//   const [showOnlineStatus, setShowOnlineStatus] = useState(true);

//   return (
//     <div className="space-y-6">
//       <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
//         Quyền riêng tư
//       </h2>

//       <div className="bg-white rounded-2xl p-6 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
//         <h3 className="text-xl font-semibold text-gray-900 mb-6 dark:text-gray-100">
//           Cài đặt quyền riêng tư
//         </h3>

//         <div className="space-y-7">

//           {/* Ai có thể xem hồ sơ */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-3 dark:text-gray-300">
//               Ai có thể xem hồ sơ của bạn
//             </label>
//             <select
//               value={profileVisibility}
//               onChange={(e) => setProfileVisibility(e.target.value)}
//               className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
//             >
//               <option value="public">Mọi người</option>
//               <option value="friends">Chỉ bạn bè</option>
//               <option value="private">Chỉ mình tôi</option>
//             </select>
//             <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
//               {profileVisibility === "public" && "Bất kỳ ai cũng có thể xem hồ sơ và bài viết của bạn"}
//               {profileVisibility === "friends" && "Chỉ những người bạn theo dõi và người theo dõi bạn mới xem được"}
//               {profileVisibility === "private" && "Chỉ bạn mới xem được hồ sơ và bài viết"}
//             </p>
//           </div>

//           {/* Hiển thị email */}
//           <div className="flex items-center justify-between py-4">
//             <div>
//               <h4 className="font-semibold text-gray-900 dark:text-gray-100">
//                 Hiển thị địa chỉ email công khai
//               </h4>
//               <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
//                 Cho phép người khác nhìn thấy email của bạn trên hồ sơ
//               </p>
//             </div>
//             <label className="relative inline-flex items-center cursor-pointer">
//               <input
//                 type="checkbox"
//                 checked={showEmail}
//                 onChange={(e) => setShowEmail(e.target.checked)}
//                 className="sr-only peer"
//               />
//               <div className="w-12 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
//             </label>
//           </div>

//           {/* Hiển thị trạng thái online */}
//           <div className="flex items-center justify-between py-4 border-t border-gray-200 dark:border-gray-700">
//             <div>
//               <h4 className="font-semibold text-gray-900 dark:text-gray-100">
//                 Hiển thị trạng thái đang online
//               </h4>
//               <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
//                 Cho mọi người biết khi bạn đang hoạt động trên nền tảng
//               </p>
//             </div>
//             <label className="relative inline-flex items-center cursor-pointer">
//               <input
//                 type="checkbox"
//                 checked={showOnlineStatus}
//                 onChange={(e) => setShowOnlineStatus(e.target.checked)}
//                 className="sr-only peer"
//               />
//               <div className="w-12 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
//             </label>
//           </div>

//         </div>
//       </div>

//       {/* Nút lưu */}
//       <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-700">
//         <button className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-2xl hover:bg-blue-700 transition-all flex items-center gap-3 shadow-lg">
//           <Save className="w-6 h-6" />
//           <span>Lưu thay đổi</span>
//         </button>
//       </div>
//     </div>
//   );
// }

"use client";

import { Save, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

import { updatePrivacySettings } from "@/services/api"; // Import hàm vừa tạo
import { fetchAPI } from "@/lib/api"; // Hàm fetch có sẵn của bạn để lấy info user

export default function PrivacySettings() {
  const [profileVisibility, setProfileVisibility] = useState("public");
  const [showEmail, setShowEmail] = useState(false);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // 1. Lấy cài đặt hiện tại khi mới vào trang
  useEffect(() => {
    const fetchCurrentSettings = async () => {
      try {
        const userId = localStorage.getItem("userId"); // Hoặc lấy từ token decode
        if(!userId) return;

        // Gọi API lấy thông tin user (giả sử endpoint /users/:id trả về cả các field privacy)
        const userData = await fetchAPI(`/users/${userId}`);
        
        if (userData) {
          setProfileVisibility(userData.profile_visibility || "public");
          setShowEmail(userData.is_email_public || false);
          // Lưu ý: is_online có thể là trạng thái realtime, bạn có thể cần 1 field riêng như 'setting_show_online'
          // Ở đây tạm dùng field is_online
          setShowOnlineStatus(userData.is_online ?? true);
        }
      } catch (error) {
        console.error("Lỗi tải cài đặt:", error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchCurrentSettings();
  }, []);

  // 2. Hàm lưu thay đổi
  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Bạn chưa đăng nhập!");
      return;
    }

    try {
      setIsLoading(true);
      await updatePrivacySettings(token, {
        profile_visibility: profileVisibility,
        is_email_public: showEmail,
        show_online_status: showOnlineStatus
      });
      
      alert("Đã lưu cài đặt quyền riêng tư thành công!");
    } catch (error) {
      console.error("Lỗi lưu cài đặt:", error);
      alert("Lưu thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return <div className="p-10 text-center text-gray-500">Đang tải cài đặt...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Quyền riêng tư
      </h2>

      <div className="bg-white rounded-2xl p-6 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 dark:text-gray-100">
          Cài đặt quyền riêng tư
        </h3>

        <div className="space-y-7">

          {/* Ai có thể xem hồ sơ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 dark:text-gray-300">
              Ai có thể xem hồ sơ của bạn
            </label>
            <select
              value={profileVisibility}
              onChange={(e) => setProfileVisibility(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700 outline-none transition-all"
            >
              <option value="public">Mọi người</option>
              <option value="friends">Chỉ bạn bè</option>
              <option value="private">Chỉ mình tôi</option>
            </select>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {profileVisibility === "public" && "Bất kỳ ai cũng có thể xem hồ sơ và bài viết của bạn"}
              {profileVisibility === "friends" && "Chỉ những người bạn theo dõi và người theo dõi bạn mới xem được"}
              {profileVisibility === "private" && "Chỉ bạn mới xem được hồ sơ và bài viết"}
            </p>
          </div>

          {/* Hiển thị email */}
          <div className="flex items-center justify-between py-4">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                Hiển thị địa chỉ email công khai
              </h4>
              <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
                Cho phép người khác nhìn thấy email của bạn trên hồ sơ
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showEmail}
                onChange={(e) => setShowEmail(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:bg-gray-700"></div>
            </label>
          </div>

          {/* Hiển thị trạng thái online */}
          <div className="flex items-center justify-between py-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                Hiển thị trạng thái đang online
              </h4>
              <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
                Cho mọi người biết khi bạn đang hoạt động trên nền tảng
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showOnlineStatus}
                onChange={(e) => setShowOnlineStatus(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:bg-gray-700"></div>
            </label>
          </div>

        </div>
      </div>

      {/* Nút lưu */}
      <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-700">
        <button 
          onClick={handleSave}
          disabled={isLoading}
          className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-2xl hover:bg-blue-700 transition-all flex items-center gap-3 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
          <span>{isLoading ? "Đang lưu..." : "Lưu thay đổi"}</span>
        </button>
      </div>
    </div>
  );
}