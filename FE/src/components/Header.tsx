// components/Header.tsx (hoặc app/components/Header.tsx)
"use client";

import { Search, Bell, User, Moon, Sun, Shield } from 'lucide-react';
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDark, setIsDark] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Kiểm tra theme + role khi mount
  useEffect(() => {
    // Theme
    const savedTheme = localStorage.getItem("theme");
    const darkMode = savedTheme === "dark";
    setIsDark(darkMode);
    document.documentElement.classList.toggle("dark", darkMode);

    // Kiểm tra quyền admin
    const role = localStorage.getItem("role");
    setIsAdmin(role === "admin");
  }, []);

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
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-lg ml-0.5">V</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">VTC Media</h1>
          </Link>

          {/* Search Bar
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

          {/* Right Actions */}
          <div className="flex items-center space-x-3">
            {/* Nút Admin - CHỈ HIỆN KHI LÀ ADMIN */}
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <Shield className="w-5 h-5" />
                <span className="hidden xl:inline">Quản trị</span>
              </Link>
            )}

            <button className="relative p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </button>

            <button
              onClick={toggleTheme}
              className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
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
      <header className="lg:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">V</span>
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">VTC Media</span>
          </Link>

          <div className="flex items-center space-x-2">
            {/* Nút Admin trên mobile - nhỏ gọn hơn */}
            {isAdmin && (
              <Link
                href="/admin"
                className="p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-transform hover:scale-110"
                title="Trang quản trị"
              >
                <Shield className="w-5 h-5" />
              </Link>
            )}

            <button className="relative p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <span className="absolute -top-0 -right-0 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                3
              </span>
            </button>

            <button onClick={toggleTheme} className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Thanh tìm kiếm mobile (có thể bật bằng JS nếu cần) */}
        <div className="mt-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-full focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>
      </header>
    </>
  );
}