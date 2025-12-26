"use client";

import { Check, X } from "lucide-react";
import Link from "next/link";

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
}

const FriendRequests = ({
  friendRequests,
  handleAcceptRequest,
  handleRejectRequest,
}: FriendRequestsProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Lời mời kết bạn
      </h2>
      
      {Array.isArray(friendRequests) && friendRequests.length > 0 ? (
        friendRequests.map((request) => {
          const profileUrl = `/profile?userId=${request.id}`;

          return (
            <div
              key={request.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Avatar có link đến trang cá nhân */}
                  <Link href={profileUrl} className="shrink-0">
                    <img
                      src={request.avatar}
                      alt={request.name}
                      className="w-12 h-12 rounded-full object-cover hover:opacity-90 transition-opacity cursor-pointer"
                    />
                  </Link>

                  <div>
                    {/* Tên người dùng có link đến trang cá nhân */}
                    <Link
                      href={profileUrl}
                      className="hover:underline decoration-blue-500"
                    >
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 cursor-pointer">
                        {request.name}
                      </h3>
                    </Link>

                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {request.username}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {request.mutualFriends} bạn chung
                    </p>
                  </div>
                </div>

                {/* Các nút hành động: Chấp nhận / Từ chối */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAcceptRequest(request.id)}
                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    title="Chấp nhận"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRejectRequest(request.id)}
                    className="p-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                    title="Từ chối"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <p className="text-gray-500 dark:text-gray-400">
          Không có lời mời kết bạn nào.
        </p>
      )}
    </div>
  );
};

export default FriendRequests;