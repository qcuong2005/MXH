// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { toast } from "react-hot-toast";
// import {
//   LayoutDashboard,
//   Users,
//   MessageSquare,
//   FileText,
//   Flag,
//   LogOut,
//   Home,
//   Menu,
//   X,
// } from "lucide-react";
// import PostManagement from "@/components/Admin/PostManagement";
// import UserManagement from "@/components/Admin/UserManagement";
// import CommentManagement from "@/components/Admin/CommentManagement";

// export default function AdminDashboardPage() {
//   const router = useRouter();
//   const [mobileOpen, setMobileOpen] = useState(false);

//   // Mặc định vào tab 'comments' để bạn kiểm tra giao diện luôn, sau này đổi lại 'posts'
//   const [activeTab, setActiveTab] = useState<string>("comments");

//   // Auth Check
//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     const role = localStorage.getItem("role");
//     if (!token || role !== "admin") {
//       // Comment lại dòng này nếu muốn test giao diện mà lười đăng nhập
//       // toast.error("Truy cập bị từ chối!");
//       router.push(token ? "/" : "/login");
//     }
//   }, [router]);

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("role");
//     toast.success("Đã đăng xuất");
//     window.location.href = "/login";
//   };

//   const menuItems = [
//     { id: "posts", label: "Quản lý Bài viết", icon: FileText },
//     { id: "users", label: "Quản lý Người dùng", icon: Users },
//     { id: "comments", label: "Quản lý Bình luận", icon: MessageSquare },
//     { id: "reports", label: "Báo cáo vi phạm", icon: Flag },
//   ];

//   // --- QUAN TRỌNG: SỬA LẠI HÀM RENDER ---
//   // Bỏ hoàn toàn các thẻ <div> bọc ngoài. Để Component tự xử lý layout.
//   const renderContent = () => {
//     switch (activeTab) {
//       case "posts":
//         return <PostManagement />;
//       case "users":
//         return <UserManagement />; // Bỏ thẻ div bao ngoài
//       case "comments":
//         return <CommentManagement />; // Bỏ thẻ div bao ngoài
//       case "reports":
//         return (
//           <div className="p-10 text-center text-gray-500">
//             Quản lý Báo cáo (Đang phát triển)
//           </div>
//         );
//       default:
//         return <PostManagement />;
//     }
//   };

//   return (
//     <div className="h-screen bg-gray-100 flex overflow-hidden">
//       {/* --- SIDEBAR --- */}

//       {/* Mobile Toggle */}
//       <div className="fixed top-4 left-4 z-50 md:hidden">
//         <button
//           onClick={() => setMobileOpen(!mobileOpen)}
//           className="p-2 bg-white rounded-lg shadow-lg text-indigo-700"
//         >
//           {mobileOpen ? <X size={24} /> : <Menu size={24} />}
//         </button>
//       </div>

//       {/* Sidebar Container */}
//       <aside
//         className={`fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-indigo-700 to-indigo-900 text-white transform transition-transform duration-300 ${
//           mobileOpen ? "translate-x-0" : "-translate-x-full"
//         } md:translate-x-0 shadow-2xl flex flex-col`}
//       >
//         <div className="p-6 border-b border-indigo-600">
//           <h2 className="text-2xl font-bold text-center tracking-wider">
//             ADMIN PANEL
//           </h2>
//         </div>

//         <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
//           {menuItems.map((item) => {
//             const Icon = item.icon;
//             const isActive = activeTab === item.id;
//             return (
//               <button
//                 key={item.id}
//                 onClick={() => {
//                   setActiveTab(item.id);
//                   setMobileOpen(false);
//                 }}
//                 className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all duration-200 text-left ${
//                   isActive
//                     ? "bg-white text-indigo-700 shadow-lg font-bold translate-x-1"
//                     : "hover:bg-indigo-600 hover:translate-x-1 text-indigo-100"
//                 }`}
//               >
//                 <Icon size={20} />
//                 <span>{item.label}</span>
//               </button>
//             );
//           })}
//         </nav>

//         <div className="p-4 border-t border-indigo-600 space-y-3 bg-indigo-900/50">
//           <button
//             onClick={() => router.push("/")}
//             className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 transition-all shadow-md text-sm font-medium"
//           >
//             <Home size={18} /> Về Trang Chủ
//           </button>
//           <button
//             onClick={handleLogout}
//             className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-red-500 hover:bg-red-600 transition-all shadow-md text-sm font-medium"
//           >
//             <LogOut size={18} /> Đăng xuất
//           </button>
//         </div>
//       </aside>

//       {/* Overlay Mobile */}
//       {mobileOpen && (
//         <div
//           className="fixed inset-0 bg-black/50 z-30 md:hidden"
//           onClick={() => setMobileOpen(false)}
//         />
//       )}

//       {/* --- MAIN CONTENT AREA --- */}
//       {/* FIX LỖI LỆCH TẠI ĐÂY:
//          1. h-screen: Chiều cao bằng màn hình
//          2. overflow-hidden: Ẩn thanh cuộn của trang cha (để bảng bên trong tự cuộn)
//          3. p-4: Giảm padding xuống 4 để có không gian rộng hơn
//       */}
//       <main className="flex-1 md:ml-64 transition-all duration-300">
//         {/* Thay vì p-4 h-screen overflow-hidden ở đây */}
//         <div className="min-h-screen bg-gray-50">
//           {/* Padding lớn hơn, đều cả 4 cạnh, responsive */}
//           <div className="p-6 md:p-8 lg:p-10 xl:p-12">{renderContent()}</div>
//         </div>
//       </main>
//     </div>
//   );
// }

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

export default function AdminDashboardPage() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("posts"); // Default to posts

  // Auth Check
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token || role !== "admin") {
      // toast.error("Truy cập bị từ chối!");
      // router.push(token ? "/" : "/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    toast.success("Đã đăng xuất");
    window.location.href = "/login";
  };

  const menuItems = [
    { id: "posts",     label: "Quản lý Bài viết", icon: FileText },
    { id: "users",     label: "Quản lý Người dùng", icon: Users },
    { id: "comments",  label: "Quản lý Bình luận", icon: MessageSquare },
    { id: "reports",   label: "Báo cáo vi phạm", icon: Flag },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "posts": return <PostManagement />;
      case "users": return <UserManagement />;
      case "comments": return <CommentManagement />;
      case "reports": return <div className="p-10 text-center text-gray-500">Quản lý Báo cáo (Đang phát triển)</div>;
      default: return <PostManagement />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* --- SIDEBAR --- */}
      
      {/* Mobile Toggle */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 bg-white rounded-lg shadow-lg text-indigo-700">
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-indigo-700 to-indigo-900 text-white transform transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 shadow-2xl flex flex-col`}>
        <div className="p-6 border-b border-indigo-600">
          <h2 className="text-2xl font-bold text-center tracking-wider">ADMIN PANEL</h2>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileOpen(false);
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

        <div className="p-4 border-t border-indigo-600 space-y-3 bg-indigo-900/50">
          <button onClick={() => router.push("/")} className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 transition-all shadow-md text-sm font-medium">
            <Home size={18} /> Về Trang Chủ
          </button>
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-red-500 hover:bg-red-600 transition-all shadow-md text-sm font-medium">
            <LogOut size={18} /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Overlay Mobile */}
      {mobileOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setMobileOpen(false)} />}

      {/* --- MAIN CONTENT AREA --- */}
      {/* This is the critical part for alignment.
         md:ml-64: Adds a left margin equal to the sidebar width (16rem/64) on desktop.
         w-full: Ensures the main container takes the full remaining width.
         min-h-screen: Ensures the background covers the full height.
         p-4 md:p-8: Adds padding inside the content area.
      */}
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