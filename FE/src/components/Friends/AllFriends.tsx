"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MoreVertical, Trash2, X, Users, UserCheck } from "lucide-react";
import anhmacdinh from "../../../image/anhmacdinh.jpg";
import { ensureConversation } from "@/services/message";
import { removeFriendApi, getFriendCountApi, getMutualFriendCountApi } from "@/services/friend"; 

interface Friend {
  id: number;
  name: string;
  username: string;
  avatar?: string;
  status?: string;
  mutualFriends?: number;
}

// 1. Thêm prop onUnfriend để giao tiếp với component cha
interface AllFriendsProps {
  friends: Friend[];
  onUnfriend?: (friendId: number) => void;
}

const AllFriends = ({ friends, onUnfriend }: AllFriendsProps) => {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // Local state để update UI ngay lập tức khi xóa
  const [friendList, setFriendList] = useState<Friend[]>(friends);
  
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // State lưu trữ số liệu (Cache)
  const [friendCounts, setFriendCounts] = useState<Record<number, number>>({});
  const [mutualCounts, setMutualCounts] = useState<Record<number, number>>({});

  // Đồng bộ props friends vào state local khi cha thay đổi (ví dụ khi search)
  useEffect(() => {
    setFriendList(friends);
  }, [friends]);

  // Lấy token và xử lý click outside menu
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedId = localStorage.getItem("userId");
    if (storedToken) setToken(storedToken);
    if (storedId) setCurrentUserId(Number(storedId));

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target && 
        !target.closest(".dropdown-menu") && 
        !target.closest(".menu-trigger")
      ) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Gọi API lấy số lượng bạn bè và bạn chung (Chạy song song)
  useEffect(() => {
    if (!token || friendList.length === 0) return;

    const fetchAllCounts = async () => {
      const requests = friendList.map(async (friend) => {
        // Kiểm tra xem đã có dữ liệu chưa để tránh gọi lại
        const needFriendCount = friendCounts[friend.id] === undefined;
        const needMutualCount = mutualCounts[friend.id] === undefined;

        if (!needFriendCount && !needMutualCount) return;

        try {
          const [friendRes, mutualRes] = await Promise.all([
             needFriendCount ? getFriendCountApi(token, friend.id) : Promise.resolve(null),
             needMutualCount ? getMutualFriendCountApi(token, friend.id) : Promise.resolve(null)
          ]);

          if (friendRes) {
            setFriendCounts(prev => ({ ...prev, [friend.id]: friendRes.count }));
          }
          if (mutualRes) {
             setMutualCounts(prev => ({ ...prev, [friend.id]: mutualRes.count }));
          }
        } catch (error) {
          console.error(`Lỗi lấy dữ liệu cho user ${friend.id}`, error);
        }
      });
      
      await Promise.allSettled(requests);
    };

    fetchAllCounts();
  }, [friendList, token]);

  const handleMessageClick = async (otherUserId: number) => {
    if (!token || !currentUserId) {
       alert("Bạn chưa đăng nhập!"); return;
    }
    try {
      const conversation = await ensureConversation(token, otherUserId);
      if (conversation?.id) {
        localStorage.setItem("selectedConversationId", conversation.id.toString());
        localStorage.setItem("selectedFriendId", otherUserId.toString());
        router.push("/messages");
      }
    } catch (error) { console.error(error); }
  };

  const handleUnfriend = async (friendId: number, friendName: string) => {
    if (!token) return;
    if (!window.confirm(`Hủy kết bạn với ${friendName}?`)) return;

    setIsLoading(true);
    try {
      await removeFriendApi(token, friendId);
      
      // 1. Cập nhật UI ở component này (xóa card)
      setFriendList((prev) => prev.filter((f) => f.id !== friendId));
      
      // 2. Báo lên cha để cập nhật số đếm ở Tab (Quan trọng)
      if (onUnfriend) {
        onUnfriend(friendId);
      }

      setOpenMenuId(null);
      alert("Đã hủy kết bạn thành công.");
    } catch (error) {
      console.error(error);
      alert("Lỗi khi hủy kết bạn.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Tiêu đề phụ (Optional) */}
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Danh sách ({friendList.length})
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {friendList.map((friend) => {
          const profileUrl = `/profile?userId=${friend.id}`;
          const isMenuOpen = openMenuId === friend.id;
          
          const friendCount = friendCounts[friend.id];
          const mutualCount = mutualCounts[friend.id];

          return (
            <div
              key={friend.id}
              // Z-index: Card đang mở menu sẽ nổi lên trên (z-50)
              className={`bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition relative overflow-visible ${
                isMenuOpen ? "z-50" : "z-0"
              }`}
            >
              <div className="flex flex-col items-center text-center">
                {/* Avatar */}
                <div className="relative">
                  <Link href={profileUrl}>
                    <img
                      src={friend.avatar ? friend.avatar : anhmacdinh.src}
                      alt={friend.name}
                      className="w-16 h-16 rounded-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    />
                  </Link>
                </div>

                {/* Name */}
                <Link href={profileUrl} className="hover:underline decoration-blue-500">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mt-2 cursor-pointer">
                    {friend.name}
                  </h3>
                </Link>

                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{friend.username}</p>
                
                {/* Stats Section */}
                <div className="flex flex-col items-center gap-1 text-xs text-gray-500 dark:text-gray-400 min-h-[40px] justify-center">
                  {/* Số bạn bè */}
                  <div className="flex items-center gap-1">
                    <Users size={12} className="text-blue-500" />
                    <span>
                      {friendCount !== undefined ? `${friendCount} bạn bè` : "..."}
                    </span>
                  </div>
                  
                  {/* Số bạn chung */}
                  <div className="flex items-center gap-1">
                      <UserCheck size={12} className="text-green-500"/>
                      <span>
                        {mutualCount !== undefined ? `${mutualCount} bạn chung` : "..."}
                      </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 mt-3 w-full justify-center relative">
                  <button
                    onClick={() => handleMessageClick(friend.id)}
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors flex-1 max-w-[120px]"
                  >
                    Message
                  </button>

                  {/* Menu Button */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(isMenuOpen ? null : friend.id);
                      }}
                      className="menu-trigger p-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors h-full flex items-center justify-center w-8"
                    >
                      {isMenuOpen ? <X size={16} /> : <MoreVertical size={16} className="text-gray-600 dark:text-gray-300" />}
                    </button>

                    {/* Dropdown Content */}
                    {isMenuOpen && (
                      <div
                        className="dropdown-menu absolute right-0 top-full mt-2 w-40 bg-white dark:bg-gray-800 rounded-md shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in fade-in zoom-in-95 duration-100 z-[9999]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          disabled={isLoading}
                          onClick={() => handleUnfriend(friend.id, friend.name)}
                          className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left gap-2"
                        >
                          <Trash2 size={16} />
                          <span className="font-medium">
                            {isLoading ? "Đang xử lý..." : "Hủy kết bạn"}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AllFriends;