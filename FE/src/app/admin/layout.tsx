export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Chỉ chừa chỗ cho sidebar, không can thiệp vào content */}

        {/* ĐỂ TRỐNG HOÀN TOÀN → để AdminDashboardPage tự xử lý padding */}
        {children}
  
    </div>
  );
}