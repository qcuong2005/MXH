"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { 
  Search, RefreshCw, Trash2, AlertCircle, Mail, User as UserIcon 
} from "lucide-react";
import { getAllUser, deleteUserAdmin } from "@/services/admin"; // Import hàm API của bạn
import { User } from "@/types"; // Đảm bảo bạn đã định nghĩa type User
import anhmacdinh from "../../../image/anhmacdinh.jpg"; // Đường dẫn ảnh mặc định

export default function UserManagement() {
  // --- STATE ---
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // --- API FUNCTIONS ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getAllUser();
      // Kiểm tra nếu data trả về đúng là mảng
      if (Array.isArray(data)) {
        setUsers(data);
        toast.success("Đã cập nhật danh sách người dùng");
      } else {
        setUsers([]);
        toast.error("Dữ liệu không đúng định dạng");
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };
  console.log(users)

  const handleDelete = async (userId: number) => {
    if (!confirm("CẢNH BÁO: Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác!")) return;
    
    setDeletingId(userId);
    try {
      await deleteUserAdmin(userId);
      // Cập nhật lại state sau khi xóa thành công mà không cần load lại trang
      setUsers((prev) => prev.filter((u) => (u as any).id !== userId));
      toast.success("Đã xóa người dùng thành công");
    } catch (error) {
      console.error(error);
      toast.error("Xóa thất bại. Có thể do lỗi server hoặc quyền hạn.");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- FILTERING ---
  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase();
    return (
      user.fullName?.toLowerCase().includes(search) ||
      user.username?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search)
    );
  });

  // --- RENDER HELPERS ---
  const renderHeader = () => (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">Quản lý Người dùng</h1>
        <p className="text-gray-600">Tổng cộng: {filteredUsers.length} tài khoản</p>
      </div>

      <div className="flex gap-3 w-full md:w-auto">
        <div className="bg-white rounded-full shadow-md border flex items-center flex-1 md:flex-initial relative">
          <Search className="text-gray-400 ml-4" size={20} />
          <input
            type="text"
            placeholder="Tìm theo tên, email..."
            className="w-full pl-2 pr-4 py-2.5 outline-none text-gray-700 rounded-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={fetchData}
          className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all shadow-md"
          title="Làm mới dữ liệu"
        >
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>
    </div>
  );

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {renderHeader()}

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Thông tin cá nhân</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Liên hệ</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Vai trò / Ngày tạo</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  
                  {/* Cột 1: Avatar & Tên */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      <img
                        className="w-12 h-12 rounded-full object-cover border-2 border-indigo-100"
                        src={user.avatar || anhmacdinh.src}
                        onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/48"; }}
                        alt={user.fullName}
                      />
                      <div>
                        <div className="font-bold text-gray-900 text-base">{user.fullName || "Chưa đặt tên"}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <UserIcon size={12} /> @{user.username || "unknown"}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Cột 2: Email */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Mail size={16} className="text-gray-400" />
                      <span>{user.email}</span>
                    </div>
                  </td>

                  {/* Cột 3: Role & Date */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      {/* Giả sử user có trường role, nếu không có bạn có thể xóa dòng này */}
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full w-fit ${
                        (user as any).role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {(user as any).role || 'User'}
                      </span>
                      <span className="text-xs text-gray-500">
                         {/* Nếu user không có createdAt, dùng Date.now làm fallback hoặc xóa đi */}
                        Đăng ký: {user.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "N/A"}
                      </span>
                    </div>
                  </td>

                  {/* Cột 4: Hành động */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => handleDelete((user as any).id)}
                      disabled={(deletingId as any) === user.id}
                      className="group relative inline-flex items-center justify-center p-2 rounded-full text-red-500 hover:bg-red-50 hover:text-red-700 transition-all"
                      title="Xóa người dùng"
                    >
                      {(deletingId as any) === user.id ? (
                        <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 size={20} />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="p-16 text-center">
              <AlertCircle size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-lg text-gray-500 font-medium">
                {searchTerm ? `Không tìm thấy user nào khớp với "${searchTerm}"` : "Danh sách trống"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}