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
  PanelLeftClose,
  PanelRightClose,
} from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import anhmacdinh from "../../image/anhmacdinh.jpg";

const navigation = [
  { name: "Home", icon: Home, href: "/", notifications: 0 },
  { name: "Profile", icon: UserCircle, href: "/profile", notifications: 0 },
  {
    name: "Messages",
    icon: MessageSquare,
    href: "/messages",
    notifications: 3,
  },
  { name: "Friends", icon: Users, href: "/friends", notifications: 2 },
  { name: "Saved", icon: Bookmark, href: "/saved", notifications: 0 },
  { name: "Settings", icon: Settings, href: "/settings", notifications: 0 },
];

export default function Sidebar() {
  const [user, setUser] = useState<any>(null);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

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

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <div className={`p-3 border-b border-gray-200 dark:border-gray-800 ${collapsed ? "px-3" : ""}`}>
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${collapsed ? "" : "space-x-3"}`}>
              <a href="/profile" className="relative">
                <div className={`relative w-12 h-12 ${collapsed ? "mx-auto" : ""}`}>
                  <Image
                    src={user?.avatar || anhmacdinh.src}
                    alt="avatar"
                    fill
                    sizes="48px"
                    className="rounded-full object-cover border ring-2 ring-primary-500/20 dark:ring-gray-700 shadow-sm"
                  />
                </div>
              </a>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {user?.fullName || "Ẩn danh"}
                  </h3>
                  <p className="text-xs leading-tight text-gray-500 dark:text-gray-400 truncate">
                    @{user?.email || "no-email"}
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={() => setCollapsed((c) => !c)}
              className="p-2 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm flex-shrink-0"
              aria-label={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
            >
              {collapsed ? (
                <PanelRightClose className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3">
          <ul className="space-y-1.5">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors duration-200 ${
                      isActive
                        ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 ring-1 ring-primary-200 dark:ring-primary-700"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    }`}
                  >
                    <div className={`flex items-center ${collapsed ? "" : "space-x-3"}`}>
                      <div className={`relative ${collapsed ? "mx-auto" : ""}`}>
                        <span className={`inline-flex items-center justify-center ${collapsed ? "p-2" : "p-1.5"} rounded-lg ${
                          isActive ? "bg-primary-100 dark:bg-primary-800/30" : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
                        }`}>
                          <Icon className="w-5 h-5" />
                        </span>
                        {item.notifications > 0 && collapsed && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-semibold shadow-sm">
                            {item.notifications > 9 ? "9" : item.notifications}
                          </span>
                        )}
                      </div>
                      {!collapsed && <span className="font-medium">{item.name}</span>}
                    </div>
                    {item.notifications > 0 && !collapsed && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center font-semibold shadow-sm">
                        {item.notifications > 9 ? "9+" : item.notifications}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("userId");
              window.location.href = "/login";
            }}
            className={`w-full flex items-center ${collapsed ? "" : "space-x-3"} px-3 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 hover:scale-[1.02]`}
          >
            <LogOut className={`w-5 h-5 ${collapsed ? "mx-auto" : ""}`} />
            {!collapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 mobile-bottom-nav z-50 safe-area-bottom">
        <div className="flex items-center justify-around py-2">
          {navigation.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center p-2 min-w-0 flex-1 relative mobile-touch-target ${
                  isActive ? "text-primary-600" : "text-gray-600 dark:text-gray-300"
                }`}
              >
                <div className="relative">
                  <Icon className="w-6 h-6" />
                  {item.notifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center animate-bounce-gentle">
                      {item.notifications}
                    </span>
                  )}
                </div>
                <span className="text-xs mt-1 truncate max-w-full font-medium">
                  {item.name}
                </span>
                {isActive && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary-600 rounded-full animate-slide-up"></div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile Top Header with User Info */}
      <div className="lg:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Image
              src={user?.avatar || anhmacdinh}
              alt="avatar"
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover border"
            />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                {user?.username || "Ẩn danh"}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                @{user?.email || "no-email"}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("userId");
              window.location.href = "/login";
            }}
            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  );
}
