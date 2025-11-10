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

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Messages</h1>
        <button className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
          <Users className="w-5 h-5" />
        </button>
      </div>
      <UserSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <div className="flex-1 overflow-y-auto">
        {filteredUsers.length === 0 ? (
          <p className="text-gray-500 text-center mt-4">Không có người dùng nào khác</p>
        ) : (
          filteredUsers.map((u: any) => (
            <div
              key={u.id}
              onClick={() => setSelectedChat(u)}
              className={`p-4 cursor-pointer border-b border-gray-100 hover:bg-gray-50 ${
                selectedChat?.id === u.id ? "bg-blue-50 border-r-2 border-blue-500" : ""
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Image
                    src={u.avatar || anhmacdinh.src}
                    alt={u.name || "user"}
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
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {u.name || u.username || "Người dùng"}
                  </h3>
                  <p className="text-sm text-gray-600 truncate mt-1">{u.lastMessage}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
