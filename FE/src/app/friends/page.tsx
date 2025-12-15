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
  const [activeTab, setActiveTab] = useState("all");
  const [token, setToken] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const { socket } = useSocket();
  const [friends, setFriends] = useState<any[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [suggestedFriends, setSuggestedFriends] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Logic lọc danh sách theo từ khóa tìm kiếm
  const filteredFriends = friends.filter((friend) =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredRequests = friendRequests.filter((request) =>
    request.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredSuggestions = suggestedFriends.filter((suggestion) =>
    suggestion.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fetchAllFriendsData = useCallback(
    async (authToken: string, currentId?: number) => {
      if (!authToken) return;
      try {
        const [friendsRes, pendingRes, sentRes, usersRes] = await Promise.all([
          getFriendsApi(authToken),
          getPendingFriendRequestsApi(authToken),
          getSentFriendRequestsApi(authToken),
          fetchAPI("/users", {
            headers: { Authorization: `Bearer ${authToken}` },
          }),
        ]);

        const friends = friendsRes || [];
        const friendRequests = pendingRes || [];
        const sentRequests = sentRes || [];
        const rawUsers = usersRes || [];

        setFriends(friends);
        setFriendRequests(friendRequests);

        const excludedIds = new Set<number>();
        if (currentId) excludedIds.add(currentId);
        friends.forEach((friend: any) => excludedIds.add(friend.id));
        friendRequests.forEach((req: any) => excludedIds.add(req.id));
        sentRequests.forEach((req: any) => excludedIds.add(req.id));

        const filteredUsers = rawUsers.filter(
          (u: any) => !excludedIds.has(u.id)
        );

        const mappedSuggestions = filteredUsers.map((u: any) => ({
          id: u.id,
          name: u.fullName ?? u.name ?? u.username ?? "Người dùng", // Đã dịch
          username: u.username ? `@${u.username}` : "",
          avatar: u.avatar ? u.avatar : anhmacdinh.src,
          mutualFriends: 0,
          status: "offline",
        }));

        setSuggestedFriends(mappedSuggestions);
      } catch (error) {
        console.error("Failed to fetch friends data:", error);
      }
    },
    []
  );

  const handleAcceptRequest = async (requesterId: number) => {
    if (!token || !socket) return;
    socket.emit("friends:accept", { requesterId: requesterId });
    setFriendRequests((prev) =>
      prev.filter((req: any) => req.id !== requesterId)
    );
  };

  const handleRejectRequest = async (requesterId: number) => {
    if (!token || !socket) return;
    socket.emit("friends:reject", { requesterId: requesterId });
    setFriendRequests((prev) =>
      prev.filter((req: any) => req.id !== requesterId)
    );
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUserId = localStorage.getItem("userId");

    if (!storedToken || !storedUserId) {
      router.push("/login");
      return;
    }

    setToken(storedToken);

    const uid = parseInt(storedUserId, 10);
    if (!isNaN(uid)) {
      setCurrentUserId(uid);
    } else {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (!socket || !token || !currentUserId) {
      return;
    }

    fetchAllFriendsData(token, currentUserId);

    const handleRequestReceived = (data: any) => {
      console.log("FriendsPage: Socket event: friends:request:received", data);
      fetchAllFriendsData(token, currentUserId);
    };
    const handleRequestAccepted = (data: any) => {
      console.log("FriendsPage: Socket event: friends:accepted", data);
      fetchAllFriendsData(token, currentUserId);
    };
    const handleRequestRejected = (data: any) => {
      console.log("FriendsPage: Socket event: friends:rejected", data);
      fetchAllFriendsData(token, currentUserId);
    };
    const handleFriendRemoved = (data: any) => {
      console.log("FriendsPage: Socket event: friends:removed", data);
      fetchAllFriendsData(token, currentUserId);
    };
    const handleSocketError = (error: any) => {
      console.error("SERVER BÁO LỖI (Socket):", error.message);
    };

    socket.on("friends:request:received", handleRequestReceived);
    socket.on("friends:accepted", handleRequestAccepted);
    socket.on("friends:rejected", handleRequestRejected);
    socket.on("friends:removed", handleFriendRemoved);
    socket.on("friends:error", handleSocketError);

    return () => {
      socket.off("friends:request:received", handleRequestReceived);
      socket.off("friends:accepted", handleRequestAccepted);
      socket.off("friends:rejected", handleRequestRejected);
      socket.off("friends:removed", handleFriendRemoved);
      socket.off("friends:error", handleSocketError);
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
              {/* Đã dịch: Tiêu đề */}
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Bạn bè
              </h1>
              {/* Đã dịch: Mô tả */}
              <p className="text-gray-600 dark:text-gray-400">
                Kết nối với những người bạn biết
              </p>
            </div>
            
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  // Đã dịch: Placeholder
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
                  {/* Đã dịch: Các tab */}
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
            
            {activeTab === "all" && <AllFriends friends={filteredFriends} />}
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