"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import anhmacdinh from "../../../image/anhmacdinh.jpg";
import { X, Search } from "lucide-react";
import { createGroupApi } from "@/services/group";
import { getToken } from "@/lib/auth";
import { Group } from "@/types";
// 1. Import API lấy bạn bè
import { getFriendsApi } from "@/services/friend";

interface CreateGroupModalProps {
  onClose: () => void;
  onGroupCreated: (newGroup: Group) => void;
}

interface User {
  id: number;
  username: string;
  name?: string; // Thêm name để hiển thị tên đầy đủ nếu có
  fullName?: string; // Đề phòng API trả về fullName
  avatar?: string;
}

export default function CreateGroupModal({ onClose, onGroupCreated }: CreateGroupModalProps) {
  const [friends, setFriends] = useState<User[]>([]); // Đổi tên state thành friends cho đúng ngữ nghĩa
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [groupName, setGroupName] = useState("");
  const [moderation, setModeration] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // Thêm tìm kiếm cho tiện

  // State cho ảnh đại diện (avatar)
  const [avatarImage, setAvatarImage] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // 2. SỬ DỤNG API LẤY BẠN BÈ THAY VÌ LẤY TOÀN BỘ USER
  useEffect(() => {
    const fetchFriends = async () => {
      const token = getToken();
      if (!token) return;

      try {
        const res = await getFriendsApi(token);
        // Map dữ liệu về đúng chuẩn User interface nếu cần
        setFriends(res as any);
      } catch (err) {
        console.error("Lỗi tải danh sách bạn bè:", err);
      }
    };
    fetchFriends();
  }, []);

  const handleToggleUser = (userId: number) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarImage(file);
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleCreateGroup = async () => {
    if (!groupName.trim()) { setError("Tên nhóm không được để trống."); return; }
    if (selectedUsers.length === 0) { setError("Bạn phải chọn ít nhất 1 thành viên."); return; }
    const token = getToken();
    if (!token) { setError("Bạn chưa đăng nhập."); return; }

    setLoading(true);
    setError("");

    try {
      const dto = {
        name: groupName,
        member_ids: selectedUsers,
        moderation,
      };

      const newGroup = await createGroupApi(token, dto, avatarImage || undefined);

      onGroupCreated(newGroup);

      onClose();
      setGroupName("");
      setSelectedUsers([]);
      setModeration(false);
      setAvatarImage(null);
      setAvatarPreview(null);
    } catch (err: any) {
      setError(err.message || "Lỗi tạo nhóm");
    } finally {
      setLoading(false);
    }
  };

  // Logic lọc bạn bè theo tìm kiếm
  const filteredFriends = friends.filter(user => {
    const name = user.name || user.fullName || user.username || "";
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // --- UI ---
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">Tạo Nhóm Mới</h1>
          <button onClick={onClose} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors">
            <X size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-5 space-y-5 overflow-y-auto custom-scrollbar">
          {/* Tên nhóm */}
          <div>
            <label htmlFor="groupName" className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Tên nhóm</label>
            <input
              id="groupName"
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 outline-none transition-all"
              placeholder="Ví dụ: Nhóm học tập..."
            />
          </div>

          {/* Ảnh đại diện */}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Ảnh đại diện (Tùy chọn)</label>
            <div className="flex items-center space-x-4">
               <div className="relative w-16 h-16 rounded-full border border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-800">
                 {avatarPreview ? (
                   <Image src={avatarPreview} alt="Preview" fill className="object-cover" />
                 ) : (
                   <span className="text-xs text-gray-400 text-center">No Img</span>
                 )}
               </div>
               <input
                id="avatarInput"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
            </div>
          </div>

          {/* Moderation */}
          <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
            <input
              id="moderation"
              type="checkbox"
              checked={moderation}
              onChange={(e) => setModeration(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="moderation" className="ml-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">
              Bật chế độ kiểm duyệt (Admin duyệt thành viên mới)
            </label>
          </div>

          {/* Chọn thành viên */}
          <div>
            <h2 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Chọn thành viên ({selectedUsers.length})
            </h2>
            
            {/* Thanh tìm kiếm bạn bè */}
            <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                <input 
                    type="text" 
                    placeholder="Tìm bạn bè..." 
                    className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 outline-none focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="border rounded-lg dark:border-gray-700 max-h-48 overflow-y-auto custom-scrollbar">
              {filteredFriends.length === 0 ? (
                <p className="p-4 text-center text-sm text-gray-500">
                   {searchTerm ? "Không tìm thấy bạn bè nào." : "Bạn chưa có bạn bè nào."}
                </p>
              ) : (
                filteredFriends.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleToggleUser(user.id)}
                    className={`flex items-center justify-between p-2.5 cursor-pointer transition-colors ${
                       selectedUsers.includes(user.id) 
                       ? "bg-blue-50 dark:bg-blue-900/20" 
                       : "hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Image
                        src={user.avatar || anhmacdinh}
                        width={32}
                        height={32}
                        alt="avatar"
                        className="rounded-full object-cover w-8 h-8"
                      />
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {user.name || user.fullName || user.username}
                      </span>
                    </div>

                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                         selectedUsers.includes(user.id)
                         ? "bg-blue-500 border-blue-500 text-white"
                         : "border-gray-300 dark:border-gray-600"
                    }`}>
                      {selectedUsers.includes(user.id) && <span className="text-xs">✓</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {error && (
             <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                 {error}
             </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-xl flex justify-end gap-3">
            <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            >
                Hủy
            </button>
            <button
                onClick={handleCreateGroup}
                disabled={loading}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
                {loading ? "Đang tạo..." : "Tạo nhóm"}
            </button>
        </div>
      </div>
    </div>
  );
}