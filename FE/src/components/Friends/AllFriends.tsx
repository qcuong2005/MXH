"use client";

import { MoreVertical } from "lucide-react";

const AllFriends = ({ friends }: { friends: any[] }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">All Friends</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {friends.map((friend) => (
          <div key={friend.id} className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <img
                  src={friend.avatar}
                  alt={friend.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div
                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                    friend.status === "online" ? "bg-green-500" : "bg-gray-400"
                  }`}
                ></div>
              </div>
              <h3 className="font-semibold text-gray-900 mt-2">{friend.name}</h3>
              <p className="text-sm text-gray-500">{friend.username}</p>
              <p className="text-xs text-gray-400">{friend.mutualFriends} mutual friends</p>
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
};

export default AllFriends;
