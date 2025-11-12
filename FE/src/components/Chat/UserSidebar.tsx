"use client";
import Image from "next/image";
import anhmacdinh from "../../../image/anhmacdinh.jpg";
import { Users } from "lucide-react";
import UserSearch from "@/components/Chat/UserSearch";
import { useState } from "react";

export default function UserSidebar({ users, selectedChat, setSelectedChat }: any) {
  const [searchTerm, setSearchTerm] = useState("");
  const filteredUsers = users.filter((u: any) =>
    (u.name || u.username || "").toLowerCase().includes(searchTerm.toLowerCase())
  );
console.log(users)
  return (
    <div className="w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Messages</h1>
        <button className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
          <Users className="w-5 h-5" />
        </button>
      </div>
      <UserSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <div className="flex-1 overflow-y-auto">
        {filteredUsers.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center mt-4">Không có người dùng nào khác</p>
        ) : (
          filteredUsers.map((u: any) => {
            const isUnread = u.unreadCount > 0;
            const displayMessage = u.lastMessage?.trim() || "Bắt đầu trò chuyện";
            return (
              <div
                key={u.id}
                onClick={() => setSelectedChat(u)}
                className={`p-4 cursor-pointer border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                  selectedChat?.id === u.id ? "bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-500 dark:border-blue-400" : ""
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Image
                      src={u.avatar || anhmacdinh.src}
                      alt={u.fullName || "user"}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                        u.status === "online" ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex items-center">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {u.name || u.username || "Người dùng"}
                      </h3>
                      <p
                        className={`text-sm mt-1 line-clamp-2 break-words ${
                          isUnread ? "text-black dark:text-white font-semibold" : "text-gray-500 dark:text-gray-400"
                        }`}
                        title={u.lastMessage || ""}
                      >
                        {displayMessage}
                      </p>
                    </div>
                    {isUnread && (
                      <span className="inline-block w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2"></span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}