"use client";

import { fetchAPI } from "@/lib/api";
import {
  Home,
  User,
  Settings,
  LogOut,
  Users,
  MessageCircle,
  Bookmark,
} from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import anhmacdinh from "../../image/anhmacdinh.jpg";

const navigation = [
  { name: "Home", icon: Home, href: "/", notifications: 0 },
  { name: "Profile", icon: User, href: "/profile", notifications: 0 },
  {
    name: "Messages",
    icon: MessageCircle,
    href: "/messages",
    notifications: 3,
  },
  { name: "Friends", icon: Users, href: "/friends", notifications: 2 },
  { name: "Saved", icon: Bookmark, href: "/saved", notifications: 0 },
  { name: "Settings", icon: Settings, href: "/settings", notifications: 0 },
];

export default function Sidebar() {
  const [user, setUser] = useState<any>(null);
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
      <aside className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col">
        {/* User Profile Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <a href="/profile" >
            <Image
              src={user?.avatar || anhmacdinh.src}
              alt="avatar"
              width={48}
              height={48}
              className="w-12 h-12 rounded-full object-cover border"
            />
            </a>
            <div>
              <h3 className="font-semibold text-gray-900">
                {user?.fullName || "Ẩn danh"}
              </h3>
              <p className="text-sm text-gray-500">
                @{user?.email || "no-email"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? "bg-primary-50 text-primary-700 border-r-2 border-primary-600"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    {item.notifications > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {item.notifications}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("userId");
              window.location.href = "/login";
            }}
            className="w-full flex items-center space-x-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
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
                  isActive ? "text-primary-600" : "text-gray-600"
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
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
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
              <h3 className="font-semibold text-gray-900 text-sm">
                {user?.username || "Ẩn danh"}
              </h3>
              <p className="text-xs text-gray-500">
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
            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  );
}
