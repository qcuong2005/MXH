"use client";

import { fetchAPI } from "@/lib/api";
import {
  Home,
  UserCircle,
  Settings,
  LogOut,
  Users,
  MessageSquare,
  Bookmark,
  Menu,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import anhmacdinh from "../../image/anhmacdinh.jpg";


const navigation = [
  { name: "Home", icon: Home, href: "/", },
  { name: "Profile", icon: UserCircle, href: "/profile",  },
  {
    name: "Messages",
    icon: MessageSquare,
    href: "/messages",
  
  },
  { name: "Friends", icon: Users, href: "/friends", },
  { name: "Saved", icon: Bookmark, href: "/saved",},
  { name: "Settings", icon: Settings, href: "/settings", },
];

export default function Sidebar() {
  const [user, setUser] = useState<any>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleOpen = () => setIsMobileSidebarOpen(true);
    document.addEventListener("open-mobile-sidebar", handleOpen);
    return () =>
      document.removeEventListener("open-mobile-sidebar", handleOpen);
  }, []);

  useEffect(() => {
    async function getUser() {
      try {
        const id = localStorage.getItem("userId");
        if (!id) return;
        const data = await fetchAPI(`/users/${id}`);
        setUser(data);
      } catch (error) {
        console.error("Lỗi lấy thông tin người dùng:", error);
      }
    }
    getUser();
  }, []);

  const closeMobileSidebar = () => setIsMobileSidebarOpen(false);

  return (
    <>
      {/* ==================== DESKTOP SIDEBAR (giữ nguyên) ==================== */}
      <aside className="hidden lg:flex w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-col h-screen">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-3">
            <a href="/profile">
              <Image
                src={user?.avatar || anhmacdinh.src}
                alt="avatar"
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover border"
              />
            </a>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {user?.fullName || "Ẩn danh"}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                @{user?.email || "no-email"}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 overflow-y-auto">
          <ul className="space-y-1.5">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={clsx(
                      "w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors",
                      isActive
                        ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border-r-2 border-primary-600"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    {(item as any).notifications > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {(item as any).notifications}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("userId");
              window.location.href = "/login";
            }}
            className="w-full flex items-center space-x-3 px-3 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* ==================== MOBILE: Chỉ dùng Drawer Sidebar (đã bỏ bottom nav) ==================== */}

      {/* ==================== MOBILE TOP BAR (chỉ có nút Menu) ==================== */}
      <div className="lg:hidden fixed top-0 left-0 right-0 ...">...</div>

      {/* Đẩy nội dung xuống để không bị top bar che */}
      <div className="lg:hidden h-16" />
      {/* XÓA HẾT ĐOẠN NÀY */}

      {/* THAY BẰNG ĐOẠN NÀY - SIÊU SẠCH & ĐÚNG CHUẨN */}

      {/* Chỉ để lại Mobile Drawer + Backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 z-40 lg:hidden backdrop-blur-sm"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Mobile Sidebar Drawer - z-index cao nhất */}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-[60] transition-transform duration-300 ease-in-out lg:hidden shadow-2xl",
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between safe-area-top">
          <div className="flex items-center space-x-3">
            <Image
              src={user?.avatar || anhmacdinh.src}
              alt="avatar"
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover border"
            />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                {user?.fullName || "Ẩn danh"}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                @{user?.email || "no-email"}
              </p>
            </div>
          </div>
          <button onClick={closeMobileSidebar} className="p-2">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Navigation - CĂN SÁT PHÍA TRÊN (chuẩn app lớn 2025) */}
        <nav className="p-4 pt-2 overflow-y-auto">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={closeMobileSidebar}
                    className={clsx(
                      "flex items-center justify-between px-4 py-3.5 rounded-xl text-base font-medium transition-all active:scale-95",
                      isActive
                        ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 shadow-sm"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                  >
                    <div className="flex items-center space-x-4">
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </div>
                    {(item as any).notifications > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2.5 py-1 min-w-6">
                        {(item as any).notifications}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 safe-area-bottom">
          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("userId");
              closeMobileSidebar();
              window.location.href = "/login";
            }}
            className="w-full flex items-center space-x-3 px-3 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all mobile-touch-target"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

    </>
  );
}
