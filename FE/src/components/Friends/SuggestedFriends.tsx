// "use client";

// import { useState } from "react";
// import { UserPlus, Check } from "lucide-react";
// import { Socket } from "socket.io-client";
// // import { sendFriendRequestApi } from "@/services/friend"; // <-- 1. KHÔNG CẦN IMPORT NÀY

// interface SuggestionItem {
//   id: number;
//   name: string;
//   username: string;
//   avatar: string;
//   mutualFriends: number;
// }

// interface SuggestedFriendsProps {
//   suggestedFriends: SuggestionItem[];
//   socket: Socket | null;
// }

// const SuggestedFriends = ({
//   suggestedFriends,
//   socket,
// }: SuggestedFriendsProps) => { // <-- 3. XÓA TOKEN
//   const [pendingRequests, setPendingRequests] = useState<number[]>([]);

//   // Handle Add Friend Action
//   const handleAddFriend = (friendId: number) => { // <-- 4. BỎ 'async'
//     if (!socket) {
//       console.error("Socket is NULL. Cannot send friend request.");
//       alert("Lỗi: Kết nối socket chưa sẵn sàng. Hãy kiểm tra lại.");
//       return;
//     }

//     if (pendingRequests.includes(friendId)) {
//       return;
//     }

//     console.log(`Socket emitting 'friends:request' to friendId: ${friendId}`);

//     // 5. CHỈ CẦN GỬI SOCKET EVENT (NHƯ CŨ)
//     // Backend (Gateway) sẽ tự động lưu vào DB
//     socket.emit("friends:request", { friendId });
//     setPendingRequests((prev) => [...prev, friendId]);

//     // 6. XÓA BỎ TOÀN BỘ KHỐI try...catch VÀ API
//   };

//   // Handle Cancel Friend Request Action (Giữ nguyên, đã đúng)
//   const handleCancelRequest = (friendId: number) => {
//     if (!socket) {
//       console.error("Socket is NULL. Cannot cancel request.");
//       alert("Lỗi: Kết nối socket chưa sẵn sàng. Hãy kiểm tra lại.");
//       return;
//     }

//     console.log(`Socket emitting 'friends:cancel' to friendId: ${friendId}`);
//     socket.emit("friends:cancel", { friendId });
//     setPendingRequests((prev) => prev.filter((id) => id !== friendId));
//   };

//   return (
//     <div className="space-y-4">
//       <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Suggestions</h2>
//       {Array.isArray(suggestedFriends) && suggestedFriends.length > 0 ? (
//         suggestedFriends.map((user) => {
//           const isPending = pendingRequests.includes(user.id);
//           return (
//             <div
//               key={user.id}
//               className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between"
//             >
//               <div className="flex items-center space-x-4">
//                 <img
//                   src={user.avatar}
//                   alt={user.name}
//                   className="w-14 h-14 rounded-full object-cover"
//                 />
//                 <div>
//                   <h3 className="font-semibold text-gray-900 dark:text-gray-100">{user.name}</h3>
//                   <p className="text-sm text-gray-500 dark:text-gray-400">{user.username}</p>
//                   <p className="text-xs text-gray-400 dark:text-gray-500">
//                     {user.mutualFriends} mutual friends
//                   </p>
//                 </div>
//               </div>

//               <div className="flex space-x-2">
//                 <button
//                   onClick={() =>
//                     isPending
//                       ? handleCancelRequest(user.id)
//                       : handleAddFriend(user.id)
//                   }
//                   className={`p-2 rounded-lg transition-colors ${
//                     isPending
//                       ? "bg-gray-800 text-white hover:bg-gray-700 dark:hover:bg-gray-600"
//                       : "bg-blue-500 text-white hover:bg-blue-600"
//                   }`}
//                   aria-label={isPending ? "Cancel Request" : "Add Friend"}
//                 >
//                   {isPending ? (
//                     <Check className="w-5 h-5" />
//                   ) : (
//                     <UserPlus className="w-5 h-5" />
//                   )}
//                 </button>
//               </div>
//             </div>
//           );
//         })
//       ) : (
//         <p className="text-gray-500 dark:text-gray-400">No new suggestions.</p>
//       )}
//     </div>
//   );
// };

// export default SuggestedFriends;


"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // 1. Import Router
import { UserPlus, Check, MessageCircle } from "lucide-react"; // 1. Import Icon Message
import { Socket } from "socket.io-client";
import { ensureConversation } from "@/services/message"; // 1. Import API Service

interface SuggestionItem {
  id: number;
  name: string;
  username: string;
  avatar: string;
  mutualFriends: number;
}

interface SuggestedFriendsProps {
  suggestedFriends: SuggestionItem[];
  socket: Socket | null;
}

const SuggestedFriends = ({
  suggestedFriends,
  socket,
}: SuggestedFriendsProps) => {
  const router = useRouter(); // 2. Hook Router
  const [pendingRequests, setPendingRequests] = useState<number[]>([]);
  
  // 3. State cho Auth (để xử lý nhắn tin)
  const [token, setToken] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // 4. Lấy token và userId khi mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedId = localStorage.getItem("userId");
    if (storedToken) setToken(storedToken);
    if (storedId) setCurrentUserId(Number(storedId));
  }, []);

  // 5. Hàm xử lý click Message (Giống hệt AllFriends)
  const handleMessageClick = async (otherUserId: number) => {
    if (!token || !currentUserId) {
      alert("Bạn chưa đăng nhập. Vui lòng đăng nhập để nhắn tin!");
      return;
    }

    try {
      const conversation = await ensureConversation(token, otherUserId);

      if (conversation?.id) {
        localStorage.setItem("selectedConversationId", conversation.id.toString());
        localStorage.setItem("selectedFriendId", otherUserId.toString());
        router.push("/messages");
      } else {
        throw new Error("Không lấy được ID hội thoại.");
      }
    } catch (error) {
      console.error("❌ Lỗi khi mở hội thoại:", error);
      alert("Không thể mở hội thoại. Vui lòng thử lại sau!");
    }
  };

  // Handle Add Friend Action
  const handleAddFriend = (friendId: number) => {
    if (!socket) {
      console.error("Socket is NULL. Cannot send friend request.");
      alert("Lỗi: Kết nối socket chưa sẵn sàng. Hãy kiểm tra lại.");
      return;
    }
    if (pendingRequests.includes(friendId)) return;

    console.log(`Socket emitting 'friends:request' to friendId: ${friendId}`);
    socket.emit("friends:request", { friendId });
    setPendingRequests((prev) => [...prev, friendId]);
  };

  // Handle Cancel Friend Request Action
  const handleCancelRequest = (friendId: number) => {
    if (!socket) {
      console.error("Socket is NULL. Cannot cancel request.");
      alert("Lỗi: Kết nối socket chưa sẵn sàng. Hãy kiểm tra lại.");
      return;
    }

    console.log(`Socket emitting 'friends:cancel' to friendId: ${friendId}`);
    socket.emit("friends:cancel", { friendId });
    setPendingRequests((prev) => prev.filter((id) => id !== friendId));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Suggestions</h2>
      {Array.isArray(suggestedFriends) && suggestedFriends.length > 0 ? (
        suggestedFriends.map((user) => {
          const isPending = pendingRequests.includes(user.id);
          const profileUrl = `/profile?userId=${user.id}`;

          return (
            <div
              key={user.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <Link href={profileUrl} className="shrink-0">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-14 h-14 rounded-full object-cover hover:opacity-90 transition-opacity cursor-pointer"
                  />
                </Link>

                <div>
                  <Link href={profileUrl} className="hover:underline decoration-blue-500">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 cursor-pointer">
                      {user.name}
                    </h3>
                  </Link>
                  
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user.username}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {user.mutualFriends} mutual friends
                  </p>
                </div>
              </div>

              <div className="flex space-x-2">
                {/* 6. Nút Message Mới Thêm */}
                <button
                  onClick={() => handleMessageClick(user.id)}
                  className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                  title="Message"
                >
                  <MessageCircle className="w-5 h-5" />
                </button>

                {/* Nút Add/Cancel Friend cũ */}
                <button
                  onClick={() =>
                    isPending
                      ? handleCancelRequest(user.id)
                      : handleAddFriend(user.id)
                  }
                  className={`p-2 rounded-lg transition-colors ${
                    isPending
                      ? "bg-gray-800 text-white hover:bg-gray-700 dark:hover:bg-gray-600"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                  aria-label={isPending ? "Cancel Request" : "Add Friend"}
                >
                  {isPending ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <UserPlus className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          );
        })
      ) : (
        <p className="text-gray-500 dark:text-gray-400">No new suggestions.</p>
      )}
    </div>
  );
};

export default SuggestedFriends;