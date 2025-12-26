"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Search } from "lucide-react";
import {
  getFriendsApi,
  getPendingFriendRequestsApi,
  getSentFriendRequestsApi,
} from "@/services/friend";
import { fetchAPI } from "@/lib/api";
import AllFriends from "@/components/Friends/AllFriends";
import FriendRequests from "@/components/Friends/FriendRequests";
import SuggestedFriends from "@/components/Friends/SuggestedFriends";
import anhmacdinh from "../../../image/anhmacdinh.jpg";
import { useSocket } from "@/components/SocketContext";

export default function FriendsPage() {
  const router = useRouter();
  const { socket } = useSocket();

  // State quản lý dữ liệu và giao diện
  const [activeTab, setActiveTab] = useState("all");
  const [token, setToken] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [friends, setFriends] = useState<any[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [suggestedFriends, setSuggestedFriends] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Xử lý thay đổi ô tìm kiếm
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Lọc danh sách (Bạn bè, Lời mời, Gợi ý) dựa trên từ khóa tìm kiếm
  const filteredFriends = friends.filter((friend) =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredRequests = friendRequests.filter((request) =>
    request.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredSuggestions = suggestedFriends.filter((suggestion) =>
    suggestion.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Tải toàn bộ dữ liệu bạn bè, lời mời và tính toán danh sách gợi ý
  const fetchAllFriendsData = useCallback(async (authToken: string, currentId?: number) => {
      if (!authToken) return;
      try {
        // Gọi song song các API để tối ưu tốc độ
        const [friendsRes, pendingRes, sentRes, usersRes] = await Promise.all([
          getFriendsApi(authToken),
          getPendingFriendRequestsApi(authToken),
          getSentFriendRequestsApi(authToken),
          fetchAPI("/users", { headers: { Authorization: `Bearer ${authToken}` } }),
        ]);

        const friendsList = friendsRes || [];
        const requestList = pendingRes || [];
        const sentList = sentRes || [];
        const rawUsers = usersRes || [];

        setFriends(friendsList);
        setFriendRequests(requestList);

        // Logic tạo danh sách gợi ý: Loại bỏ bản thân, bạn bè hiện tại và các lời mời đã gửi/nhận
        const excludedIds = new Set<number>();
        if (currentId) excludedIds.add(currentId);
        friendsList.forEach((f: any) => excludedIds.add(f.id));
        requestList.forEach((req: any) => excludedIds.add(req.id));
        sentList.forEach((req: any) => excludedIds.add(req.id));

        const filteredUsers = rawUsers.filter((u: any) => !excludedIds.has(u.id));
        
        const mappedSuggestions = filteredUsers.map((u: any) => ({
          id: u.id,
          name: u.fullName ?? u.name ?? u.username ?? "Người dùng",
          username: u.username ? `@${u.username}` : "",
          avatar: u.avatar ? u.avatar : anhmacdinh.src,
          mutualFriends: 0,
          status: "offline",
        }));
        setSuggestedFriends(mappedSuggestions);
      } catch (error) {
        console.error("Failed to fetch friends data:", error);
      }
  }, []);

  // Xử lý chấp nhận lời mời kết bạn qua Socket
  const handleAcceptRequest = async (requesterId: number) => {
    if (!token || !socket) return;
    socket.emit("friends:accept", { requesterId: requesterId });
    setFriendRequests((prev) => prev.filter((req: any) => req.id !== requesterId));
  };

  // Xử lý từ chối lời mời kết bạn qua Socket
  const handleRejectRequest = async (requesterId: number) => {
    if (!token || !socket) return;
    socket.emit("friends:reject", { requesterId: requesterId });
    setFriendRequests((prev) => prev.filter((req: any) => req.id !== requesterId));
  };

  // Cập nhật UI ngay lập tức khi hủy kết bạn thành công (Optimistic Update)
  const handleLocalUnfriend = (removedFriendId: number) => {
    setFriends((prev) => prev.filter((f) => f.id !== removedFriendId));
    
    // Tải lại dữ liệu để cập nhật danh sách gợi ý (người vừa xóa sẽ xuất hiện lại ở gợi ý)
    if (token && currentUserId) {
        setTimeout(() => fetchAllFriendsData(token, currentUserId), 500);
    }
  };

  // Kiểm tra xác thực người dùng khi component mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUserId = localStorage.getItem("userId");
    if (!storedToken || !storedUserId) { router.push("/login"); return; }
    setToken(storedToken);
    const uid = parseInt(storedUserId, 10);
    if (!isNaN(uid)) setCurrentUserId(uid); else router.push("/login");
  }, [router]);

  // Lắng nghe các sự kiện Realtime từ Socket (nhận lời mời, đồng ý, xóa bạn)
  useEffect(() => {
    if (!socket || !token || !currentUserId) return;
    fetchAllFriendsData(token, currentUserId);

    const refreshData = () => fetchAllFriendsData(token, currentUserId);

    socket.on("friends:request:received", refreshData);
    socket.on("friends:accepted", refreshData);
    socket.on("friends:rejected", refreshData);
    socket.on("friends:removed", refreshData);

    return () => {
      socket.off("friends:request:received", refreshData);
      socket.off("friends:accepted", refreshData);
      socket.off("friends:rejected", refreshData);
      socket.off("friends:removed", refreshData);
    };
  }, [socket, token, currentUserId, fetchAllFriendsData]);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-4">
            
            {/* Tiêu đề trang */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Bạn bè</h1>
              <p className="text-gray-600 dark:text-gray-400">Kết nối với những người bạn biết</p>
            </div>
            
            {/* Thanh tìm kiếm */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm bạn bè..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            
            {/* Tabs chuyển đổi: Tất cả, Lời mời, Gợi ý */}
            <div className="mb-6">
              <div className="border-b border-gray-200 dark:border-gray-800">
                <nav className="-mb-px flex space-x-8">
                  {[
                    { id: "all", label: "Tất cả bạn bè", count: filteredFriends.length }, 
                    { id: "requests", label: "Lời mời kết bạn", count: filteredRequests.length },
                    { id: "suggestions", label: "Gợi ý", count: filteredSuggestions.length },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id  
                          ? "border-blue-500 text-blue-600 dark:text-blue-400"
                          : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-700"
                      }`}
                    >
                      {tab.label} ({tab.count})
                    </button>
                  ))}
                </nav>
              </div>
            </div>
            
            {/* Nội dung Tab: Tất cả bạn bè */}
            {activeTab === "all" && (
                <AllFriends 
                    friends={filteredFriends} 
                    onUnfriend={handleLocalUnfriend} 
                />
            )}

            {/* Nội dung Tab: Lời mời kết bạn */}
            {activeTab === "requests" && (
              <FriendRequests
                friendRequests={filteredRequests}
                handleAcceptRequest={handleAcceptRequest}
                handleRejectRequest={handleRejectRequest}
              />
            )}
            
            {/* Nội dung Tab: Gợi ý kết bạn */}
            {activeTab === "suggestions" && socket && token && (
              <SuggestedFriends
                suggestedFriends={filteredSuggestions}
                socket={socket} 
              />
            )}
            {activeTab === "suggestions" && !socket && (
              <p className="text-gray-500 text-center">Đang kết nối...</p>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}