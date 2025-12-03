// // components/Header.tsx (hoặc app/components/Header.tsx)
// "use client";

// import { Search, Bell, User, Moon, Sun, Shield, Menu } from "lucide-react";
// import Link from "next/link";
// import { useEffect, useState } from "react";

// export default function Header() {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [isDark, setIsDark] = useState(false);
//   const [isAdmin, setIsAdmin] = useState(false);

//   // Kiểm tra theme + role khi mount
//   useEffect(() => {
//     // Theme
//     const savedTheme = localStorage.getItem("theme");
//     const darkMode = savedTheme === "dark";
//     setIsDark(darkMode);
//     document.documentElement.classList.toggle("dark", darkMode);

//     // Kiểm tra quyền admin
//     const role = localStorage.getItem("role");
//     setIsAdmin(role === "admin");
//   }, []);

//   const toggleTheme = () => {
//     const next = !isDark;
//     setIsDark(next);
//     document.documentElement.classList.toggle("dark", next);
//     localStorage.setItem("theme", next ? "dark" : "light");
//   };

//   return (
//     <>
//       {/* ==================== DESKTOP HEADER ==================== */}
//       <header className="hidden lg:block bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
//         <div className="max-w-7xl mx-auto flex items-center justify-between">
//           {/* Logo */}
//           <Link href="/" className="flex items-center space-x-3">
//             <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
//               <span className="text-white font-black text-lg ml-0.5">V</span>
//             </div>
//             <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
//               VTC Media
//             </h1>
//           </Link>

//           <div className="flex-1 max-w-lg mx-8">
//             <div className="relative">
//               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
//               <input
//                 type="text"
//                 placeholder="Tìm kiếm bài viết, người dùng..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="w-full pl-12 pr-6 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
//               />
//             </div>
//           </div>

//           <div className="flex items-center space-x-3">
//             {/* Nút Admin - CHỈ HIỆN KHI LÀ ADMIN */}
//             {isAdmin && (
//               <Link
//                 href="/admin"
//                 className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
//               >
//                 <Shield className="w-5 h-5" />
//                 <span className="hidden xl:inline">Quản trị</span>
//               </Link>
//             )}

//             <button className="relative p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
//               <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
//               <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
//                 3
//               </span>
//             </button>

//             <button
//               onClick={toggleTheme}
//               className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
//             >
//               {isDark ? (
//                 <Sun className="w-5 h-5" />
//               ) : (
//                 <Moon className="w-5 h-5" />
//               )}
//             </button>

//             <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
//               <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
//                 <User className="w-5 h-5" />
//               </div>
//             </button>
//           </div>
//         </div>
//       </header>

//       {/* ==================== MOBILE HEADER - ĐÃ CÓ NÚT MENU ==================== */}
//       <header className="lg:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 pt-safe-top pb-4 sticky top-0 z-50 backdrop-blur-md bg-white/90 dark:bg-gray-900/90">
//         {/* Phần trên: Nút Menu + Logo + Icons */}
//         <div className="flex items-center justify-between pt-3">
//           {/* Nút Menu */}
//           <button
//             onClick={() =>
//               document.dispatchEvent(new CustomEvent("open-mobile-sidebar"))
//             }
//             className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
//           >
//             <Menu className="w-7 h-7 text-gray-700 dark:text-gray-300" />
//           </button>

//           {/* Logo + tên – nhỏ gọn hơn, chuẩn mobile 2025 */}
//           <Link href="/" className="flex items-center space-x-2.5">
//             {/* Logo nhỏ hơn một chút */}
//             <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
//               <span className="text-white font-black text-xl">V</span>
//             </div>

//             {/* Tên thương hiệu – chữ nhỏ hơn, đẹp hơn */}
//             <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
//               TC Media
//             </h1>
//           </Link>

//           {/* Icons bên phải */}
//           <div className="flex items-center gap-2.5">
//             {isAdmin && (
//               <Link
//                 href="/admin"
//                 className="p-3 bg-gradient-to-br from-red-600 to-pink-600 text-white rounded-full shadow-lg hover:scale-110 transition-transform"
//               >
//                 <Shield className="w-6 h-6" />
//               </Link>
//             )}

//             <button
//               onClick={toggleTheme}
//               className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
//             >
//               {isDark ? (
//                 <Sun className="w-6 h-6 text-yellow-400" />
//               ) : (
//                 <Moon className="w-6 h-6 text-gray-600" />
//               )}
//             </button>

//             <button className="relative p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
//               <Bell className="w-6 h-6 text-gray-600 dark:text-gray-300" />
//               <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
//                 3
//               </span>
//             </button>
//           </div>
//         </div>

//         {/* Thanh tìm kiếm full width */}
//         <div className="relative mt-2" >
//           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
//           <input
//             type="text"
//             placeholder="Tìm kiếm bài viết, người dùng..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="w-full pl-12 pr-5 py-3.5 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 dark:text-gray-200 placeholder-gray-500 transition-all font-medium"
//           />
//         </div>
//       </header>
//     </>
//   );
// }

"use client";

import { Search, Bell, User, Moon, Sun, Shield, Menu } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";

import { getNotificationsApi } from "@/services/notification";
import Notifications from "./Notifications/Notifications";
import { Notification } from "@/types";
import { useSocket } from "./SocketContext";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDark, setIsDark] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // --- STATE CHO THÔNG BÁO ---
  const [currentUser, setCurrentUser] = useState<{ id: number; token: string } | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  // --- REFS: Bao cả button + popup ---
  const notifRef = useRef<HTMLDivElement>(null);
  const mobileNotifRef = useRef<HTMLDivElement>(null);

  const { socket } = useSocket();

  // 1. Load theme, role, user từ localStorage + tự động cập nhật khi login
  useEffect(() => {
    const syncUser = () => {
      const savedTheme = localStorage.getItem("theme");
      const darkMode = savedTheme === "dark";
      setIsDark(darkMode);
      document.documentElement.classList.toggle("dark", darkMode);

      const role = localStorage.getItem("role");
      setIsAdmin(role === "admin");

      const token = localStorage.getItem("access_token");
      const userId = localStorage.getItem("user_id");

      if (token && userId) {
        setCurrentUser({ id: Number(userId), token });
      } else {
        setCurrentUser(null);
      }
    };

    syncUser(); // Chạy ngay khi mount
    window.addEventListener("storage", syncUser);

    return () => window.removeEventListener("storage", syncUser);
  }, []);

  // 2. Lấy số thông báo chưa đọc + socket realtime
  useEffect(() => {
    if (!currentUser || !socket) return;

    const fetchInitialUnreadCount = async () => {
      try {
        const data = await getNotificationsApi(currentUser.token, currentUser.id);
        const count = data.filter((n: Notification) => !n.is_read).length;
        setUnreadCount(count);
      } catch (error) {
        console.error("Lỗi tải thông báo:", error);
      }
    };

    fetchInitialUnreadCount();

    const handleNewNotification = (newNotif: Notification) => {
      console.log("Header nhận socket:", newNotif);
    if (newNotif.user_id === currentUser.id && !newNotif.is_read) {
    setUnreadCount((prev) => prev + 1);
  }
    };

    socket.on("new_notification", handleNewNotification);
    return () => socket.off("new_notification", handleNewNotification);
  }, [currentUser, socket]);

  // 3. Click chuông: mở/đóng popup
  const toggleNotifications = () => {
    if (!showNotifications) {
      setUnreadCount(0); // Reset badge khi mở
    }
    setShowNotifications((prev) => !prev);
  };

  // 4. Đóng popup khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const clickedInsideDesktop = notifRef.current?.contains(target);
      const clickedInsideMobile = mobileNotifRef.current?.contains(target);

      if (!clickedInsideDesktop && !clickedInsideMobile) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Toggle dark mode
  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <>
      {/* ==================== DESKTOP HEADER ==================== */}
      <header className="hidden lg:block bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-lg ml-0.5">V</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">VTC Media</h1>
          </Link>

          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm bài viết, người dùng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <Shield className="w-5 h-5" />
                <span className="hidden xl:inline">Quản trị</span>
              </Link>
            )}

            {/* NOTIFICATION DESKTOP */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={toggleNotifications}
                className="relative p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Vào thẳng thông báo - không kiểm tra đăng nhập */}
              {showNotifications && (
                <div className="absolute top-14 right-0 z-50 w-[420px] shadow-2xl bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <Notifications currentUser={currentUser} />
                </div>
              )}
            </div>

            <button onClick={toggleTheme} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
              {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5" />}
            </button>

            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                <User className="w-5 h-5" />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* ==================== MOBILE HEADER ==================== */}
      <header className="lg:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 pt-safe-top pb-4 sticky top-0 z-50 backdrop-blur-md bg-white/90 dark:bg-gray-900/90">
        <div className="flex items-center justify-between pt-3">
          <button
            onClick={() => document.dispatchEvent(new CustomEvent("open-mobile-sidebar"))}
            className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <Menu className="w-7 h-7 text-gray-700 dark:text-gray-300" />
          </button>

          <Link href="/" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-xl">V</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">TC Media</h1>
          </Link>

          <div className="flex items-center gap-2.5">
            {isAdmin && (
              <Link href="/admin" className="p-3 bg-gradient-to-br from-red-600 to-pink-600 text-white rounded-full shadow-lg hover:scale-110 transition-transform">
                <Shield className="w-6 h-6" />
              </Link>
            )}

            <button onClick={toggleTheme} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
              {isDark ? <Sun className="w-6 h-6 text-yellow-400" /> : <Moon className="w-6 h-6 text-gray-600" />}
            </button>

            {/* NOTIFICATION MOBILE */}
            <div className="relative" ref={mobileNotifRef}>
              <button
                onClick={toggleNotifications}
                className="relative p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <Bell className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Vào thẳng thông báo - không kiểm tra đăng nhập */}
              {showNotifications && (
                <div className="absolute top-16 -right-4 z-50 w-[360px] max-w-[92vw] shadow-2xl bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <Notifications currentUser={currentUser}  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="relative mt-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm kiếm bài viết, người dùng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-5 py-3.5 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 dark:text-gray-200 placeholder-gray-500 transition-all font-medium"
          />
        </div>
      </header>
    </>
  );
}