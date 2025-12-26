"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, Check, MessageCircle } from "lucide-react";
import { Socket } from "socket.io-client";
import { ensureConversation } from "@/services/message";

interface SuggestionItem {
  id: number;
  name: string;
  username: string;
  avatar: string;
  mutualFriends: number;
}

interface SuggestedFriendsProps {
  suggestedFriends: SuggestionItem[];
  socket: Socket | null;
}

const SuggestedFriends = ({
  suggestedFriends,
  socket,
}: SuggestedFriendsProps) => {
  const router = useRouter();
  const [pendingRequests, setPendingRequests] = useState<number[]>([]);
  
  // State lưu thông tin xác thực để xử lý nhắn tin
  const [token, setToken] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // Lấy token và userId khi component mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedId = localStorage.getItem("userId");
    if (storedToken) setToken(storedToken);
    if (storedId) setCurrentUserId(Number(storedId));
  }, []);

  // Xử lý chuyển hướng đến trang nhắn tin
  const handleMessageClick = async (otherUserId: number) => {
    if (!token || !currentUserId) {
      alert("Bạn chưa đăng nhập. Vui lòng đăng nhập để nhắn tin!");
      return;
    }

    try {
      // Tạo hoặc lấy hội thoại tồn tại
      const conversation = await ensureConversation(token, otherUserId);

      if (conversation?.id) {
        // Lưu cache để trang Message tự động mở hội thoại này
        localStorage.setItem("selectedConversationId", conversation.id.toString());
        localStorage.setItem("selectedFriendId", otherUserId.toString());
        router.push("/messages");
      } else {
        throw new Error("Không lấy được ID hội thoại.");
      }
    } catch (error) {
      console.error("❌ Lỗi khi mở hội thoại:", error);
      alert("Không thể mở hội thoại. Vui lòng thử lại sau!");
    }
  };

  // Gửi lời mời kết bạn qua Socket
  const handleAddFriend = (friendId: number) => {
    if (!socket) {
      alert("Lỗi kết nối. Vui lòng thử lại sau.");
      return;
    }
    if (pendingRequests.includes(friendId)) return;

    socket.emit("friends:request", { friendId });
    setPendingRequests((prev) => [...prev, friendId]);
  };

  // Hủy lời mời kết bạn (khi đã ấn gửi trước đó)
  const handleCancelRequest = (friendId: number) => {
    if (!socket) {
      alert("Lỗi kết nối. Vui lòng thử lại sau.");
      return;
    }

    socket.emit("friends:cancel", { friendId });
    setPendingRequests((prev) => prev.filter((id) => id !== friendId));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Gợi ý kết bạn
      </h2>
      
      {Array.isArray(suggestedFriends) && suggestedFriends.length > 0 ? (
        suggestedFriends.map((user) => {
          const isPending = pendingRequests.includes(user.id);
          const profileUrl = `/profile?userId=${user.id}`;

          return (
            <div
              key={user.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                {/* Avatar dẫn đến trang cá nhân */}
                <Link href={profileUrl} className="shrink-0">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-14 h-14 rounded-full object-cover hover:opacity-90 transition-opacity cursor-pointer"
                  />
                </Link>

                <div>
                  {/* Tên hiển thị dẫn đến trang cá nhân */}
                  <Link href={profileUrl} className="hover:underline decoration-blue-500">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 cursor-pointer">
                      {user.name}
                    </h3>
                  </Link>
                  
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user.username}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {user.mutualFriends} bạn chung
                  </p>
                </div>
              </div>

              <div className="flex space-x-2">
                {/* Nút Nhắn tin */}
                <button
                  onClick={() => handleMessageClick(user.id)}
                  className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                  title="Nhắn tin"
                >
                  <MessageCircle className="w-5 h-5" />
                </button>

                {/* Nút Kết bạn / Hủy yêu cầu */}
                <button
                  onClick={() =>
                    isPending
                      ? handleCancelRequest(user.id)
                      : handleAddFriend(user.id)
                  }
                  className={`p-2 rounded-lg transition-colors ${
                    isPending
                      ? "bg-gray-800 text-white hover:bg-gray-700 dark:hover:bg-gray-600"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                  title={isPending ? "Hủy lời mời" : "Thêm bạn bè"}
                >
                  {isPending ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <UserPlus className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          );
        })
      ) : (
        <p className="text-gray-500 dark:text-gray-400">
          Không có gợi ý mới nào.
        </p>
      )}
    </div>
  );
};

export default SuggestedFriends;