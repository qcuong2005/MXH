"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Users, Search, UserPlus, Check, X, MoreVertical } from "lucide-react";

export default function FriendsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  // Mock data for friends
  const friends = [
    {
      id: 1,
      name: "John Doe",
      username: "@johndoe",
      avatar: "/api/placeholder/60/60",
      mutualFriends: 12,
      status: "online",
    },
    {
      id: 2,
      name: "Jane Smith",
      username: "@janesmith",
      avatar: "/api/placeholder/60/60",
      mutualFriends: 8,
      status: "offline",
    },
    {
      id: 3,
      name: "Mike Johnson",
      username: "@mikej",
      avatar: "/api/placeholder/60/60",
      mutualFriends: 15,
      status: "online",
    },
  ];

  const friendRequests = [
    {
      id: 4,
      name: "Sarah Wilson",
      username: "@sarahw",
      avatar: "/api/placeholder/60/60",
      mutualFriends: 5,
    },
    {
      id: 5,
      name: "David Brown",
      username: "@davidb",
      avatar: "/api/placeholder/60/60",
      mutualFriends: 3,
    },
  ];

  const suggestedFriends = [
    {
      id: 6,
      name: "Emily Davis",
      username: "@emilyd",
      avatar: "/api/placeholder/60/60",
      mutualFriends: 7,
    },
    {
      id: 7,
      name: "Alex Taylor",
      username: "@alext",
      avatar: "/api/placeholder/60/60",
      mutualFriends: 4,
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "requests":
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Friend Requests
            </h2>
            {friendRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-lg p-4 border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={request.avatar}
                      alt={request.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {request.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {request.username}
                      </p>
                      <p className="text-xs text-gray-400">
                        {request.mutualFriends} mutual friends
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                      <Check className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case "suggestions":
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Suggested Friends
            </h2>
            {suggestedFriends.map((friend) => (
              <div
                key={friend.id}
                className="bg-white rounded-lg p-4 border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={friend.avatar}
                      alt={friend.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {friend.name}
                      </h3>
                      <p className="text-sm text-gray-500">{friend.username}</p>
                      <p className="text-xs text-gray-400">
                        {friend.mutualFriends} mutual friends
                      </p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2">
                    <UserPlus className="w-4 h-4" />
                    <span>Add Friend</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">All Friends</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {friends.map((friend) => (
                <div
                  key={friend.id}
                  className="bg-white rounded-lg p-4 border border-gray-200"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="relative">
                      <img
                        src={friend.avatar}
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
                    <h3 className="font-semibold text-gray-900 mt-2">
                      {friend.name}
                    </h3>
                    <p className="text-sm text-gray-500">{friend.username}</p>
                    <p className="text-xs text-gray-400">
                      {friend.mutualFriends} mutual friends
                    </p>
                    <div className="flex space-x-2 mt-3">
                      <button className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors">
                        Message
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-4">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Friends</h1>
              <p className="text-gray-600">Connect with people you know</p>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search friends..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  {[
                    { id: "all", label: "All Friends", count: friends.length },
                    {
                      id: "requests",
                      label: "Requests",
                      count: friendRequests.length,
                    },
                    {
                      id: "suggestions",
                      label: "Suggestions",
                      count: suggestedFriends.length,
                    },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {tab.label} ({tab.count})
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Content */}
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
