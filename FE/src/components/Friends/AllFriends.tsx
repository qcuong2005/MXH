"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical } from "lucide-react";
import anhmacdinh from "../../../image/anhmacdinh.jpg";
import { ensureConversation } from "@/services/message";

interface Friend {
  id: number;
  name: string;
  username: string;
  avatar?: string;
  status?: string;
  mutualFriends?: number;
}

const AllFriends = ({ friends }: { friends: Friend[] }) => {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
console.log(friends)
  // ✅ Lấy token và userId an toàn khi render client
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedId = localStorage.getItem("userId");
    if (storedToken) setToken(storedToken);
    if (storedId) setCurrentUserId(Number(storedId));
  }, []);

  const handleMessageClick = async (otherUserId: number) => {
    if (!token || !currentUserId) {
      alert("Bạn chưa đăng nhập. Vui lòng đăng nhập để nhắn tin!");
      return;
    }

    try {
      // 🔹 Gọi API đảm bảo có hội thoại
      const conversation = await ensureConversation(token, otherUserId);

      if (conversation?.id) {
        // 🔹 Lưu vào localStorage để trang /messages tự lấy ra
        localStorage.setItem("selectedConversationId", conversation.id.toString());
        localStorage.setItem("selectedFriendId", otherUserId.toString());

        // 🔹 Chuyển hướng tới trang tin nhắn chính
        router.push("/messages");
      } else {
        throw new Error("Không lấy được ID hội thoại.");
      }
    } catch (error) {
      console.error("❌ Lỗi khi mở hội thoại:", error);
      alert("Không thể mở hội thoại. Vui lòng thử lại sau!");
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">All Friends</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {friends.map((friend) => (
          <div
            key={friend.id}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition"
          >
            <div className="flex flex-col items-center text-center">
              {/* Avatar */}
              <div className="relative">
                <img
                  src={friend.avatar ? friend.avatar : anhmacdinh.src}
                  alt={friend.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div
                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                    friend.status === "online"
                      ? "bg-green-500"
                      : "bg-gray-400"
                  }`}
                ></div>
              </div>

              {/* Info */}
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mt-2">
                {friend.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{friend.username}</p>
              {friend.mutualFriends !== undefined && (
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {friend.mutualFriends} mutual friends
                </p>
              )}

              {/* Actions */}
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={() => handleMessageClick(friend.id)}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Message
                </button>
                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllFriends;
