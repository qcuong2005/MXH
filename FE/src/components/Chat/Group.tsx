"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import anhmacdinh from "../../../image/anhmacdinh.jpg";
import { X } from "lucide-react";
import { fetchAPI } from "@/lib/api";
import { createGroupApi } from "@/services/group";
import { getToken } from "@/lib/auth";
import { Group } from "@/types";

interface CreateGroupModalProps {
  onClose: () => void;
  onGroupCreated: (newGroup: Group) => void;
}

interface User {
  id: number;
  username: string;
  avatar?: string;
}

export default function CreateGroupModal({ onClose, onGroupCreated }: CreateGroupModalProps) {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [groupName, setGroupName] = useState("");
  const [moderation, setModeration] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 👈 XÓA: State cho coverImage và imagePreview (không cần nữa)

  // 👈 GIỮ: State cho ảnh đại diện (avatar)
  const [avatarImage, setAvatarImage] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // (useEffect fetchAllUsers giữ nguyên)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetchAPI("/users");
        setAllUsers(res);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  // (handleToggleUser giữ nguyên)
  const handleToggleUser = (userId: number) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  // 👈 GIỮ: Handler cho ảnh đại diện
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

  // 👈 GIỮ: Cleanup preview cho avatar
  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  // 👈 XÓA: Handler và cleanup cho coverImage (không cần nữa)
  
  // (handleCreateGroup đã cập nhật - CHỈ avatarImage)
  const handleCreateGroup = async () => {
    // (Validation giữ nguyên)
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

      // Gọi API (hỗ trợ FormData chỉ với avatar)
      const newGroup = await createGroupApi(token, dto, avatarImage); 

      // (Realtime) Báo cho 'cha' (ChatPage) biết
      onGroupCreated(newGroup);

      // (Đóng modal và reset form)
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

  // --- UI ---
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-lg flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h1 className="text-2xl font-bold">Tạo Nhóm Mới</h1>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Tên nhóm */}
          <div>
            <label htmlFor="groupName" className="block text-sm font-medium mb-1">Tên nhóm:</label>
            <input
              id="groupName"
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
              placeholder="Nhập tên nhóm..."
            />
          </div>

          {/* 👈 GIỮ: Input chọn ảnh đại diện (avatar) */}
          <div>
            <label htmlFor="avatarInput" className="block text-sm font-medium mb-1">Ảnh đại diện nhóm (Tùy chọn):</label>
            <input
              id="avatarInput"
              type="file"
              accept="image/png, image/jpeg, image/gif"
              onChange={handleAvatarChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          {/* Preview ảnh đại diện */}
          {avatarPreview && (
            <div className="mt-2">
              <Image
                src={avatarPreview}
                alt="Xem trước ảnh đại diện"
                width={100}
                height={100}
                className="w-24 h-24 object-cover rounded-full border mx-auto"
              />
            </div>
          )}

          {/* 👈 XÓA: Input và preview cho ảnh bìa (không cần nữa) */}

          {/* Moderation */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={moderation}
                onChange={(e) => setModeration(e.target.checked)}
              />
              <span>Bật chế độ kiểm duyệt</span>
            </label>
          </div>

          <h2 className="text-lg font-semibold mb-2">Chọn thành viên:</h2>

          {/* USER LIST */}
          <div className="flex-1 overflow-y-auto border rounded-md max-h-64">
            {allUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="flex items-center space-x-3">
                  <Image
                    src={user.avatar || anhmacdinh}
                    width={40}
                    height={40}
                    alt="avatar"
                    className="rounded-full object-cover"
                  />
                  <span>{user.username}</span>
                </div>

                <button
                  onClick={() => handleToggleUser(user.id)}
                  className={`p-2 rounded-full text-white ${
                    selectedUsers.includes(user.id)
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  {selectedUsers.includes(user.id) ? "✓" : "+"}
                </button>
              </div>
            ))}
          </div>

          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t dark:border-gray-700">
          <button
            onClick={handleCreateGroup}
            disabled={loading}
            className="w-full p-3 bg-green-600 text-white rounded-md font-bold hover:bg-green-700 disabled:bg-gray-400"
          >
            {loading ? "Đang tạo..." : `Tạo nhóm (${selectedUsers.length + 1} thành viên)`}
          </button>
        </div>
      </div>
    </div>
  );
}