"use client";

import { Check, X } from "lucide-react";
// Không cần useEffect, useState, hay Socket nữa

interface FriendItem {
  id: number;
  name: string;
  username: string;
  avatar: string;
  mutualFriends: number;
}

interface FriendRequestsProps {
  friendRequests: FriendItem[];
  handleAcceptRequest: (id: number) => void;
  handleRejectRequest: (id: number) => void;
  // Bạn không cần 'socket' ở đây nữa
}

const FriendRequests = ({
  friendRequests, // Dùng trực tiếp prop này
  handleAcceptRequest,
  handleRejectRequest,
}: FriendRequestsProps) => {

  // Không cần 'useState' hay 'useEffect'
  
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Friend Requests</h2>
      {Array.isArray(friendRequests) && friendRequests.length > 0 ? (
        friendRequests.map((request) => (
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
                  <h3 className="font-semibold text-gray-900">{request.name}</h3>
                  <p className="text-sm text-gray-500">{request.username}</p>
                  <p className="text-xs text-gray-400">
                    {request.mutualFriends} mutual friends
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleAcceptRequest(request.id)}
                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleRejectRequest(request.id)}
                  className="p-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500">No friend requests.</p>
      )}
    </div>
  );
};

export default FriendRequests;