"use client";

import { useEffect, useState, useCallback } from "react";
// ... các import giữ nguyên ...
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
  const [activeTab, setActiveTab] = useState("all");
  const [token, setToken] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const { socket } = useSocket();
  const [friends, setFriends] = useState<any[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [suggestedFriends, setSuggestedFriends] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // ... (Giữ nguyên handleSearchChange, filteredFriends...) 
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredFriends = friends.filter((friend) =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredRequests = friendRequests.filter((request) =>
    request.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredSuggestions = suggestedFriends.filter((suggestion) =>
    suggestion.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ... (Giữ nguyên fetchAllFriendsData)
  const fetchAllFriendsData = useCallback(async (authToken: string, currentId?: number) => {
      // ... Code cũ giữ nguyên ...
      if (!authToken) return;
      try {
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

        // Logic gợi ý bạn bè
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

  const handleAcceptRequest = async (requesterId: number) => {
    if (!token || !socket) return;
    socket.emit("friends:accept", { requesterId: requesterId });
    setFriendRequests((prev) => prev.filter((req: any) => req.id !== requesterId));
  };

  const handleRejectRequest = async (requesterId: number) => {
    if (!token || !socket) return;
    socket.emit("friends:reject", { requesterId: requesterId });
    setFriendRequests((prev) => prev.filter((req: any) => req.id !== requesterId));
  };

  // --- HÀM MỚI: Xử lý khi AllFriends xóa thành công ---
  const handleLocalUnfriend = (removedFriendId: number) => {
    // 1. Cập nhật ngay lập tức state friends ở đây
    // Điều này sẽ làm giảm số đếm ở Tab "Tất cả bạn bè" ngay lập tức
    setFriends((prev) => prev.filter((f) => f.id !== removedFriendId));
    
    // 2. (Tùy chọn) Gọi lại fetchAllFriendsData để cập nhật lại danh sách Gợi ý (Suggested)
    // vì người vừa xóa nên hiện lại ở mục gợi ý.
    if (token && currentUserId) {
        // setTimeout nhỏ để backend kịp update DB trước khi fetch lại
        setTimeout(() => fetchAllFriendsData(token, currentUserId), 500);
    }
  };

  // ... (Giữ nguyên các useEffect auth và socket)
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUserId = localStorage.getItem("userId");
    if (!storedToken || !storedUserId) { router.push("/login"); return; }
    setToken(storedToken);
    const uid = parseInt(storedUserId, 10);
    if (!isNaN(uid)) setCurrentUserId(uid); else router.push("/login");
  }, [router]);

  useEffect(() => {
    if (!socket || !token || !currentUserId) return;
    fetchAllFriendsData(token, currentUserId);

    const handleRequestReceived = () => fetchAllFriendsData(token, currentUserId);
    const handleRequestAccepted = () => fetchAllFriendsData(token, currentUserId);
    const handleRequestRejected = () => fetchAllFriendsData(token, currentUserId);
    const handleFriendRemoved = () => fetchAllFriendsData(token, currentUserId); // Cái này xử lý khi NGƯỜI KIA xóa mình

    socket.on("friends:request:received", handleRequestReceived);
    socket.on("friends:accepted", handleRequestAccepted);
    socket.on("friends:rejected", handleRequestRejected);
    socket.on("friends:removed", handleFriendRemoved);

    return () => {
      socket.off("friends:request:received", handleRequestReceived);
      socket.off("friends:accepted", handleRequestAccepted);
      socket.off("friends:rejected", handleRequestRejected);
      socket.off("friends:removed", handleFriendRemoved);
    };
  }, [socket, token, currentUserId, fetchAllFriendsData]);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-4">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Bạn bè</h1>
              <p className="text-gray-600 dark:text-gray-400">Kết nối với những người bạn biết</p>
            </div>
            
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
            
            <div className="mb-6">
              <div className="border-b border-gray-200 dark:border-gray-800">
                <nav className="-mb-px flex space-x-8">
                  {[
                    // Số count này sẽ tự động giảm khi state 'friends' thay đổi
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
            
            {/* TRUYỀN HÀM XỬ LÝ XUỐNG DƯỚI */}
            {activeTab === "all" && (
                <AllFriends 
                    friends={filteredFriends} 
                    onUnfriend={handleLocalUnfriend} 
                />
            )}

            {activeTab === "requests" && (
              <FriendRequests
                friendRequests={filteredRequests}
                handleAcceptRequest={handleAcceptRequest}
                handleRejectRequest={handleRejectRequest}
              />
            )}
            
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