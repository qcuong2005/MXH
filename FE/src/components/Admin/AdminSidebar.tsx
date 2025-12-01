// components/Admin/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  FileText,
  Flag,
  LogOut,
  Home,     // Thêm icon Home
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

const menuItems = [
  { icon: LayoutDashboard, label: "Tổng quan", href: "/admin" },
  { icon: FileText,        label: "Quản lý Bài viết", href: "/admin/posts" },
  { icon: Users,           label: "Quản lý Người dùng", href: "/admin/users" },
  { icon: MessageSquare,   label: "Quản lý Bình luận", href: "/admin/comments" },
  { icon: Flag,            label: "Báo cáo vi phạm", href: "/admin/reports" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    toast.success("Đã đăng xuất thành công");
    window.location.href = "/login";
  };

  return (
    <>
      {/* Nút mở sidebar trên mobile */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 bg-white rounded-lg shadow-lg"
        >
          {mobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-indigo-600 to-indigo-800 text-white transform transition-transform duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo / Title */}
          <div className="p-6 border-b border-indigo-700">
            <h2 className="text-2xl font-bold text-center">ADMIN PANEL</h2>
          </div>

          {/* Menu chính */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-white text-indigo-700 shadow-lg font-semibold"
                      : "hover:bg-indigo-700 hover:translate-x-1"
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom actions */}
          <div className="p-4 border-t border-indigo-700 space-y-3">
            {/* Nút về trang chủ người dùng */}
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 transition-all shadow-md"
            >
              <Home size={20} />
              <span>Về Trang Chủ</span>
            </Link>

            {/* Nút đăng xuất */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 transition-all shadow-md"
            >
              <LogOut size={20} />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay khi mở trên mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}