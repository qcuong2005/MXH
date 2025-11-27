"use client";
import { useState, useEffect } from "react";
import { X, UserPlus, Trash2, Users, Shield } from "lucide-react";
import Image from "next/image";
import anhmacdinh from "../../../image/anhmacdinh.jpg"; // Đảm bảo đường dẫn import đúng

interface GroupInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedChat: any; // Thông tin group hiện tại
  currentUser: any;
}

export default function GroupInfoModal({
  isOpen,
  onClose,
  selectedChat,
  currentUser,
}: GroupInfoModalProps) {
  // 1. KHAI BÁO TOÀN BỘ HOOKS Ở ĐÂY (TRƯỚC MỌI CÂU LỆNH RETURN)
  const [activeTab, setActiveTab] = useState<"members" | "add">("members");
  const [members, setMembers] = useState<any[]>([]);
  const [newMemberId, setNewMemberId] = useState("");
  const [loading, setLoading] = useState(false);

  // useEffect này LUÔN ĐƯỢC GỌI mỗi lần render, nhưng logic bên trong chỉ chạy khi cần thiết
  useEffect(() => {
    // Chỉ thực hiện logic load dữ liệu khi Modal mở VÀ là Group chat
    if (isOpen && selectedChat?.id && selectedChat.isGroup) {
      
      // TODO: Thay thế bằng API thực tế
      // const fetchMembers = async () => {
      //   try {
      //     const data = await getGroupMembers(selectedChat.id);
      //     setMembers(data);
      //   } catch (error) { console.error(error); }
      // };
      // fetchMembers();

      // Dữ liệu giả (MOCK DATA) để test giao diện
      setMembers([
        { id: currentUser.id, name: "Bạn (Admin)", avatar: currentUser.avatar, role: "admin" },
        { id: 999, name: "Nguyễn Văn A", avatar: null, role: "member" },
        { id: 888, name: "Trần Thị B", avatar: null, role: "member" },
      ]);
    }
  }, [isOpen, selectedChat, currentUser]);

  // 2. LỚP BẢO VỆ (SAFETY CHECK) - ĐẶT SAU TẤT CẢ CÁC HOOKS
  // Nếu Modal không mở hoặc chat hiện tại KHÔNG phải là Group -> Không render gì cả.
  if (!isOpen || !selectedChat?.isGroup) return null;

  // --- CÁC HÀM XỬ LÝ LOGIC ---

  const handleAddMember = async () => {
    if (!newMemberId.trim()) return;
    setLoading(true);
    try {
      console.log(`Thêm user ${newMemberId} vào group ${selectedChat.id}`);
      
      // TODO: Gọi API addMemberToGroup(selectedChat.id, newMemberId)
      // Giả lập delay mạng
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      alert("Đã thêm thành viên thành công!");
      setNewMemberId("");
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra khi thêm thành viên.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    if (!confirm("Bạn có chắc muốn xóa thành viên này khỏi nhóm?")) return;
    try {
      console.log(`Xóa user ${memberId} khỏi group ${selectedChat.id}`);
      
      // TODO: Gọi API removeMemberFromGroup(selectedChat.id, memberId)
      
      // Cập nhật lại danh sách local (Optimistic UI)
      setMembers(members.filter((m) => m.id !== memberId));
    } catch (error) {
      console.error(error);
      alert("Xóa thành viên thất bại.");
    }
  };

  // Helper hiển thị avatar an toàn (tránh lỗi nếu avatar null)
  const getAvatarSrc = (avatar: string | null | undefined) => {
    return avatar || anhmacdinh.src;
  };

  // --- RENDER GIAO DIỆN ---
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      {/* Overlay click to close */}
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="relative bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] z-10">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
          <h3 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
            <Users size={20} className="text-blue-600" /> 
            Quản lý nhóm
          </h3>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-gray-200 rounded-full dark:hover:bg-gray-700 transition-colors text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <button
            onClick={() => setActiveTab("members")}
            className={`flex-1 py-3 text-sm font-medium transition-all relative ${
              activeTab === "members"
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            Danh sách ({members.length})
            {activeTab === "members" && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("add")}
            className={`flex-1 py-3 text-sm font-medium transition-all relative ${
              activeTab === "add"
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            Thêm thành viên
            {activeTab === "add" && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full" />
            )}
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-800">
          
          {/* TAB 1: DANH SÁCH THÀNH VIÊN */}
          {activeTab === "members" && (
            <div className="space-y-2">
              {members.length === 0 ? (
                <p className="text-center text-gray-500 py-8 text-sm">Chưa có thành viên nào.</p>
              ) : (
                members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors group">
                    <div className="flex items-center gap-3">
                      <Image
                        src={getAvatarSrc(member.avatar)}
                        alt={member.name}
                        width={44}
                        height={44}
                        className="w-11 h-11 rounded-full object-cover border border-gray-100 dark:border-gray-600"
                      />
                      <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-1">
                          {member.name}
                          {member.id === currentUser.id && <span className="text-gray-400 font-normal text-xs">(Bạn)</span>}
                        </p>
                        {member.role === 'admin' ? (
                          <span className="text-[10px] bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400 px-2 py-0.5 rounded-full flex items-center w-fit gap-1 mt-0.5 font-medium">
                             <Shield size={10} className="fill-current" /> Admin
                          </span>
                        ) : (
                           <span className="text-[11px] text-gray-500 dark:text-gray-400">Thành viên</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Nút xóa: Hiện khi CurrentUser là Admin VÀ không phải xóa chính mình */}
                    {/* (Logic demo: Hiện nút xóa cho tất cả user khác mình) */}
                    {member.id !== currentUser.id && (
                      <button 
                        onClick={() => handleRemoveMember(member.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Xóa khỏi nhóm"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: THÊM THÀNH VIÊN */}
          {activeTab === "add" && (
            <div className="space-y-5">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex gap-3 items-start">
                <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-full flex-shrink-0">
                  <UserPlus size={18} className="text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                   <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">Mời thành viên mới</h4>
                   <p className="text-xs text-blue-600 dark:text-blue-300 leading-relaxed">
                      Nhập ID hoặc tên người dùng để mời họ tham gia vào nhóm trò chuyện này.
                   </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nhập ID người dùng..."
                  value={newMemberId}
                  onChange={(e) => setNewMemberId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-gray-700 dark:text-white transition-all text-sm shadow-sm"
                />
                <button
                  onClick={handleAddMember}
                  disabled={loading || !newMemberId.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-sm active:scale-95"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Thêm</>
                  )}
                </button>
              </div>
              
              {/* Phần gợi ý (Placeholder) */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Gợi ý từ bạn bè</h4>
                <div className="flex flex-col items-center justify-center py-8 text-center bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
                   <Users size={32} className="text-gray-300 dark:text-gray-600 mb-2" />
                   <p className="text-sm text-gray-500 dark:text-gray-400">Danh sách bạn bè sẽ hiển thị ở đây</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}