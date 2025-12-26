"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  Users, MessageSquare, FileText, Flag,
  LogOut, Home, Menu, X
} from "lucide-react";
import PostManagement from "@/components/Admin/PostManagement";
import UserManagement from "@/components/Admin/UserManagement";
import CommentManagement from "@/components/Admin/CommentManagement";
import ReportManagement from "@/components/Admin/ReportManagement";

export default function AdminDashboardPage() {
  const router = useRouter();

  // State quản lý trạng thái đóng/mở sidebar trên mobile và tab đang active
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("posts");

  // Kiểm tra quyền Admin khi trang được tải
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token || role !== "admin") {
     
    }
  }, [router]);

  // Xử lý đăng xuất: Xóa token và chuyển hướng về trang đăng nhập
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    toast.success("Đã đăng xuất");
    window.location.href = "/login";
  };

  // Cấu hình danh sách các mục menu trong Sidebar
  const menuItems = [
    { id: "posts",    label: "Quản lý Bài viết", icon: FileText },
    { id: "users",    label: "Quản lý Người dùng", icon: Users },
    { id: "comments", label: "Quản lý Bình luận", icon: MessageSquare },
    { id: "reports",  label: "Báo cáo vi phạm", icon: Flag },
  ];

  // Hàm render component con dựa trên tab đang được chọn
  const renderContent = () => {
    switch (activeTab) {
      case "posts": return <PostManagement />;
      case "users": return <UserManagement />;
      case "comments": return <CommentManagement />;
      case "reports": return <ReportManagement/>;
      default: return <PostManagement />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* --- SIDEBAR --- */}
      
      {/* Nút mở menu trên Mobile */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 bg-white rounded-lg shadow-lg text-indigo-700">
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Container Sidebar chính */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-indigo-700 to-indigo-900 text-white transform transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 shadow-2xl flex flex-col`}>
        <div className="p-6 border-b border-indigo-600">
          <h2 className="text-2xl font-bold text-center tracking-wider">ADMIN PANEL</h2>
        </div>

        {/* Danh sách Menu điều hướng */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileOpen(false); // Đóng sidebar khi chọn trên mobile
                }}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all duration-200 text-left ${
                  isActive 
                    ? "bg-white text-indigo-700 shadow-lg font-bold translate-x-1" 
                    : "hover:bg-indigo-600 hover:translate-x-1 text-indigo-100"
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Các nút chức năng phụ (Về trang chủ, Đăng xuất) */}
        <div className="p-4 border-t border-indigo-600 space-y-3 bg-indigo-900/50">
          <button onClick={() => router.push("/")} className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 transition-all shadow-md text-sm font-medium">
            <Home size={18} /> Về Trang Chủ
          </button>
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-red-500 hover:bg-red-600 transition-all shadow-md text-sm font-medium">
            <LogOut size={18} /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Lớp phủ mờ khi mở menu trên Mobile */}
      {mobileOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setMobileOpen(false)} />}
      
      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 md:ml-64 transition-all duration-300">
        <div className="min-h-screen bg-gray-50">
          <div className="p-3 md:p-5 lg:p-6">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}