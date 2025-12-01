// app/(admin)/layout.tsx

import AdminSidebar from "@/components/Admin/AdminSidebar";


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 ml-0 md:ml-64">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}