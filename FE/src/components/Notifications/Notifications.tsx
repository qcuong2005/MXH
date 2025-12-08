// "use client";

// import React, { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import {
//   getNotificationsApi,
//   markNotificationAsReadApi,
//   markAllNotificationsAsReadApi,
// } from "@/services/notification";
// import { ensureConversation } from "@/services/message";
// import { Notification, NotificationType } from "@/types";
// import {
//   Heart,
//   MessageCircle,
//   UserPlus,
//   Bell,
//   CheckCheck,
//   PhoneIncoming,
//   UserCheck,
//   MessageSquare,
// } from "lucide-react";
// import { useSocket } from "../SocketContext";
// import PostModal from "../Posts/PostModal";
// // Import ảnh mặc định (đảm bảo đường dẫn này đúng với project của bạn)
// import anhmacdinh from "../../../image/anhmacdinh.jpg";

// interface Props {
//   currentUser: { id: number; token: string } | null;
// }

// export default function Notifications({ currentUser }: Props) {
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const [loading, setLoading] = useState(true);

//   // State quản lý việc mở Modal xem bài viết
//   const [viewPostId, setViewPostId] = useState<number | null>(null);

//   const router = useRouter();
//   const { socket } = useSocket();

//   // 1. Load thông báo ban đầu
//   useEffect(() => {
//     const fetchNotifications = async () => {
//       if (!currentUser) {
//         setLoading(false);
//         return;
//       }
//       try {
//         const data = await getNotificationsApi(
//           currentUser.token,
//           currentUser.id
//         );
//         if (Array.isArray(data)) {
//           setNotifications(
//             data.sort(
//               (a: any, b: any) =>
//                 new Date(b.created_at).getTime() -
//                 new Date(a.created_at).getTime()
//             )
//           );
//         }
//       } catch (error) {
//         console.error("❌ [Notifications] Lỗi gọi API:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchNotifications();
//   }, [currentUser]);

//   // 2. Lắng nghe Socket Realtime
//   useEffect(() => {
//     if (!socket || !currentUser) return;

//     const handleNewNotification = (notification: Notification) => {
//       // Chỉ nhận thông báo của chính mình
//       if (Number(notification.user_id) !== Number(currentUser.id)) return;

//       setNotifications((prev) => {
//         // Tránh trùng lặp
//         if (prev.some((n) => n.id === notification.id)) return prev;
//         return [notification, ...prev];
//       });
//     };

//     socket.on("new_notification", handleNewNotification);

//     return () => {
//       socket.off("new_notification", handleNewNotification);
//     };
//   }, [socket, currentUser]);

//   // 3. Xử lý click vào thông báo
//   const handleItemClick = async (notif: Notification) => {
//     if (!currentUser) return;

//     // --- A. Đánh dấu đã đọc (Optimistic update) ---
//     if (!notif.is_read) {
//       setNotifications((prev) =>
//         prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
//       );
//       markNotificationAsReadApi(currentUser.token, notif.id).catch(
//         console.error
//       );
//     }

//     // === CASE 1: Like hoặc Comment -> Mở PostModal ===
//     if (
//       notif.type === NotificationType.NEW_LIKE ||
//       notif.type === NotificationType.NEW_COMMENT
//     ) {
//       // Tìm ID bài viết từ các trường có thể trả về
//       const postId =
//         (notif as any).entity_id ??
//         (notif as any).post_id ??
//         (notif as any).target_id ??
//         (notif as any).resource_id;

//       if (!postId) {
//         console.error("Không tìm thấy ID bài viết trong notification:", notif);
//         return;
//       }

//       // Set ID để hiển thị Modal
//       setViewPostId(Number(postId));
//       return;
//     }

//     // === CASE 2: Tin nhắn ===
//     if (notif.type === NotificationType.NEW_MESSAGE) {
//       try {
//         const conversation = await ensureConversation(
//           currentUser.token,
//           notif.sender_id
//         );
//         if (conversation?.id) {
//           localStorage.setItem(
//             "selectedConversationId",
//             conversation.id.toString()
//           );
//           localStorage.setItem("selectedFriendId", notif.sender_id.toString());
//           router.push("/messages");
//         } else {
//           router.push(`/profile?userId=${notif.sender_id}`);
//         }
//       } catch (error) {
//         console.error("Lỗi tin nhắn:", error);
//         router.push(`/profile?userId=${notif.sender_id}`);
//       }
//       return;
//     }

//     // === CASE 3: Các loại khác (Follower, Friend Request...) ===
//     if (
//       notif.type === NotificationType.NEW_FOLLOWER ||
//       notif.type === NotificationType.FRIEND_REQUEST ||
//       notif.type === NotificationType.FRIEND_ACCEPT
//     ) {
//       router.push(`/profile?userId=${notif.sender_id}`);
//       return;
//     }
//   };

//   // 4. Đánh dấu tất cả đã đọc
//   const handleMarkAllRead = async () => {
//     if (!currentUser) return;
//     setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
//     await markAllNotificationsAsReadApi(
//       currentUser.token,
//       currentUser.id
//     ).catch(console.error);
//   };

//   // Helper render icon nhỏ
//   const renderIcon = (type: NotificationType) => {
//     switch (type) {
//       case NotificationType.NEW_LIKE:
//         return <Heart className="w-3.5 h-3.5 text-white fill-current" />;
//       case NotificationType.NEW_COMMENT:
//         return <MessageCircle className="w-3.5 h-3.5 text-white fill-current" />;
//       case NotificationType.NEW_FOLLOWER:
//         return <UserPlus className="w-3.5 h-3.5 text-white" />;
//       case NotificationType.FRIEND_REQUEST:
//         return <UserPlus className="w-3.5 h-3.5 text-white" />;
//       case NotificationType.FRIEND_ACCEPT:
//         return <UserCheck className="w-3.5 h-3.5 text-white" />;
//       case NotificationType.INCOMING_CALL:
//         return <PhoneIncoming className="w-3.5 h-3.5 text-white" />;
//       case NotificationType.NEW_MESSAGE:
//         return <MessageSquare className="w-3.5 h-3.5 text-white" />;
//       default:
//         return <Bell className="w-3.5 h-3.5 text-white" />;
//     }
//   };

//   // Helper màu nền icon
//   const getIconBg = (type: NotificationType) => {
//     switch (type) {
//       case NotificationType.NEW_LIKE:
//         return "bg-red-500";
//       case NotificationType.NEW_COMMENT:
//         return "bg-blue-500";
//       case NotificationType.NEW_FOLLOWER:
//         return "bg-green-500";
//       case NotificationType.FRIEND_REQUEST:
//         return "bg-indigo-500";
//       case NotificationType.FRIEND_ACCEPT:
//         return "bg-teal-500";
//       case NotificationType.INCOMING_CALL:
//         return "bg-orange-500";
//       case NotificationType.NEW_MESSAGE:
//         return "bg-sky-500";
//       default:
//         return "bg-gray-500";
//     }
//   };

//   if (loading) {
//     return (
//       <div className="p-8 text-center text-gray-500 dark:text-gray-400">
//         <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto mb-2"></div>
//         Đang tải...
//       </div>
//     );
//   }

//   return (
//     <>
//       <div className="flex flex-col max-h-[70vh]">
//         {/* Header */}
//         <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-900 sticky top-0 z-10">
//           <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">
//             Thông báo
//           </h3>
//           {notifications.length > 0 && currentUser && (
//             <button
//               onClick={handleMarkAllRead}
//               className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors"
//             >
//               <CheckCheck size={14} /> Đánh dấu đã đọc
//             </button>
//           )}
//         </div>

//         {/* List Notifications */}
//         <div className="overflow-y-auto flex-1 custom-scrollbar bg-white dark:bg-gray-900">
//           {notifications.length === 0 ? (
//             <div className="flex flex-col items-center justify-center p-10 text-gray-400 dark:text-gray-500">
//               <Bell className="w-12 h-12 mb-3 opacity-20" />
//               <p>Chưa có thông báo nào</p>
//             </div>
//           ) : (
//             notifications.map((notif) => (
//               <div
//                 key={notif.id}
//                 onClick={() => handleItemClick(notif)}
//                 className={`group flex items-start gap-3 p-4 border-b border-gray-50 dark:border-gray-800 cursor-pointer transition-all duration-200
//                   ${
//                     !notif.is_read
//                       ? "bg-indigo-50/60 dark:bg-indigo-900/10 hover:bg-indigo-100/50 dark:hover:bg-indigo-900/20"
//                       : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
//                   }
//                 `}
//               >
//                 {/* --- AVATAR SECTION --- */}
//                 <div className="relative shrink-0 mt-1">
//                   <img
//                     src={
//                       (notif as any).avatar || 
//                       (notif as any).sender?.avatar || 
//                       anhmacdinh.src || 
//                       "https://via.placeholder.com/40"
//                     }
//                     alt="User Avatar"
//                     className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700 shadow-sm"
//                     onError={(e) => {
//                       e.currentTarget.src = "https://via.placeholder.com/40";
//                     }}
//                   />
                  
//                   {/* Small Icon Badge */}
//                   <div
//                     className={`absolute -bottom-1 -right-1 p-1 rounded-full border-2 border-white dark:border-gray-900 shadow-sm ${getIconBg(
//                       notif.type
//                     )}`}
//                   >
//                     {renderIcon(notif.type)}
//                   </div>
//                 </div>

//                 {/* --- CONTENT SECTION --- */}
//                 <div className="flex-1 min-w-0">
//                   <p className="text-sm text-gray-800 dark:text-gray-200 leading-snug">
//                     <span className="font-bold hover:underline">
//                       {(notif as any).fullName || "Người dùng"}
//                     </span>{" "}
//                     <span className="text-gray-600 dark:text-gray-300">
//                       {notif.content}
//                     </span>
//                   </p>
//                   <span className="text-xs text-indigo-500/80 dark:text-indigo-400/80 mt-1.5 font-medium block">
//                     {new Date(notif.created_at).toLocaleString("vi-VN", {
//                       hour: "2-digit",
//                       minute: "2-digit",
//                       day: "2-digit",
//                       month: "2-digit",
//                     })}
//                   </span>
//                 </div>

//                 {/* --- READ STATUS DOT --- */}
//                 {!notif.is_read && (
//                   <div className="self-center">
//                     <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 shadow-glow-indigo"></div>
//                   </div>
//                 )}
//               </div>
//             ))
//           )}
//         </div>
//       </div>

//       {/* Post Modal */}
//       {viewPostId && (
//         <PostModal 
//           postId={viewPostId} 
//           onClose={() => setViewPostId(null)} 
//         />
//       )}
//     </>
//   );
// }


"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  getNotificationsApi,
  markNotificationAsReadApi,
  markAllNotificationsAsReadApi,
} from "@/services/notification";
import { ensureConversation } from "@/services/message";
import { Notification, NotificationType } from "@/types";
import {
  Heart,
  MessageCircle,
  UserPlus,
  Bell,
  CheckCheck,
  PhoneIncoming,
  UserCheck,
  MessageSquare,
} from "lucide-react";
import { useSocket } from "../SocketContext";
import PostModal from "../Posts/PostModal";
import anhmacdinh from "../../../image/anhmacdinh.jpg";

interface Props {
  currentUser: { id: number; token: string } | null;
}

interface GroupedNotification extends Notification {
  count: number;
  groupedIds: number[];
}

export default function Notifications({ currentUser }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewPostId, setViewPostId] = useState<number | null>(null);

  const router = useRouter();
  const { socket } = useSocket();

  // --- HÀM HELPER: Lấy Post ID an toàn ---
  const getPostIdFromNotif = (notif: any) => {
    return (
      notif.entity_id ??
      notif.post_id ??
      notif.target_id ??
      notif.resource_id
    );
  };

  // --- 1. LOGIC GỘP THÔNG BÁO ---
  const groupedNotifications = useMemo(() => {
    const map = new Map<string, GroupedNotification>();

    const sorted = [...notifications].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    sorted.forEach((notif) => {
      let key = `${notif.sender_id}_${notif.type}`;

      // Nếu là Like/Comment => Gộp theo Post ID
      if (
        notif.type === NotificationType.NEW_LIKE ||
        notif.type === NotificationType.NEW_COMMENT
      ) {
        const entityId = getPostIdFromNotif(notif);
        if (entityId) key += `_${entityId}`;
      }

      if (!map.has(key)) {
        map.set(key, {
          ...notif,
          count: 1,
          groupedIds: [notif.id],
        });
      } else {
        const existing = map.get(key)!;
        existing.count += 1;
        existing.groupedIds.push(notif.id);

        if (!notif.is_read) {
          existing.is_read = false;
        }
      }
    });

    return Array.from(map.values());
  }, [notifications]);

  // Load API
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      try {
        const data = await getNotificationsApi(
          currentUser.token,
          currentUser.id
        );
        if (Array.isArray(data)) {
          setNotifications(data);
        }
      } catch (error) {
        console.error("❌ [Notifications] Lỗi gọi API:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [currentUser]);

  // Socket
  useEffect(() => {
    if (!socket || !currentUser) return;
    const handleNewNotification = (notification: Notification) => {
      if (Number(notification.user_id) !== Number(currentUser.id)) return;
      setNotifications((prev) => {
        if (prev.some((n) => n.id === notification.id)) return prev;
        return [notification, ...prev];
      });
    };
    socket.on("new_notification", handleNewNotification);
    return () => { socket.off("new_notification", handleNewNotification)};
  }, [socket, currentUser]);

  // --- 2. XỬ LÝ CLICK ---
  const handleItemClick = async (groupNotif: GroupedNotification) => {
    if (!currentUser) return;

    // A. Mark Read
    if (!groupNotif.is_read) {
      setNotifications((prev) =>
        prev.map((n) =>
          groupNotif.groupedIds.includes(n.id) ? { ...n, is_read: true } : n
        )
      );

      Promise.all(
        groupNotif.groupedIds.map((id) =>
          markNotificationAsReadApi(currentUser.token, id)
        )
      ).catch(console.error);
    }

    // === FIX HERE: Lấy ID bài viết ===
    if (
      groupNotif.type === NotificationType.NEW_LIKE ||
      groupNotif.type === NotificationType.NEW_COMMENT
    ) {
      const postId = getPostIdFromNotif(groupNotif);

      if (postId) {
        setViewPostId(Number(postId));
      } else {
        console.error("Không tìm thấy Post ID");
      }
      return;
    }

    // Các trường hợp khác
    if (groupNotif.type === NotificationType.NEW_MESSAGE) {
      try {
        const conversation = await ensureConversation(
          currentUser.token,
          groupNotif.sender_id
        );
        if (conversation?.id) {
          localStorage.setItem(
            "selectedConversationId",
            conversation.id.toString()
          );
          localStorage.setItem(
            "selectedFriendId",
            groupNotif.sender_id.toString()
          );
          router.push("/messages");
        } else {
          router.push(`/profile?userId=${groupNotif.sender_id}`);
        }
      } catch {
        router.push(`/profile?userId=${groupNotif.sender_id}`);
      }
      return;
    }

    if (
      groupNotif.type === NotificationType.NEW_FOLLOWER ||
      groupNotif.type === NotificationType.FRIEND_REQUEST ||
      groupNotif.type === NotificationType.FRIEND_ACCEPT
    ) {
      router.push(`/profile?userId=${groupNotif.sender_id}`);
      return;
    }
  };

  const handleMarkAllRead = async () => {
    if (!currentUser) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await markAllNotificationsAsReadApi(
      currentUser.token,
      currentUser.id
    ).catch(console.error);
  };

  const renderIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.NEW_LIKE:
        return <Heart className="w-3.5 h-3.5 text-white fill-current" />;
      case NotificationType.NEW_COMMENT:
        return <MessageCircle className="w-3.5 h-3.5 text-white fill-current" />;
      case NotificationType.NEW_FOLLOWER:
        return <UserPlus className="w-3.5 h-3.5 text-white" />;
      case NotificationType.FRIEND_REQUEST:
        return <UserPlus className="w-3.5 h-3.5 text-white" />;
      case NotificationType.FRIEND_ACCEPT:
        return <UserCheck className="w-3.5 h-3.5 text-white" />;
      case NotificationType.INCOMING_CALL:
        return <PhoneIncoming className="w-3.5 h-3.5 text-white" />;
      case NotificationType.NEW_MESSAGE:
        return <MessageSquare className="w-3.5 h-3.5 text-white" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-white" />;
    }
  };

  const getIconBg = (type: NotificationType) => {
    switch (type) {
      case NotificationType.NEW_LIKE:
        return "bg-red-500";
      case NotificationType.NEW_COMMENT:
        return "bg-blue-500";
      case NotificationType.NEW_FOLLOWER:
        return "bg-green-500";
      case NotificationType.FRIEND_REQUEST:
        return "bg-indigo-500";
      case NotificationType.FRIEND_ACCEPT:
        return "bg-teal-500";
      case NotificationType.INCOMING_CALL:
        return "bg-orange-500";
      case NotificationType.NEW_MESSAGE:
        return "bg-sky-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto mb-2"></div>
        Đang tải...
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col max-h-[70vh]">
        {/* --- HEADER --- */}
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-900 sticky top-0 z-10">
          <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">
            Thông báo
          </h3>
          
          {/* ĐÃ SỬA: Hiển thị nút khi có thông báo (bất kể đã đọc hay chưa) */}
          {notifications.length > 0 && currentUser && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck size={14} /> Đánh dấu đã đọc
            </button>
          )}
        </div>

        <div className="overflow-y-auto flex-1 custom-scrollbar bg-white dark:bg-gray-900">
          {groupedNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-10 text-gray-400">
              <Bell className="w-12 h-12 mb-3 opacity-20" />
              <p>Chưa có thông báo nào</p>
            </div>
          ) : (
            groupedNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleItemClick(notif)}
                className={`group flex items-start gap-3 p-4 border-b border-gray-50 dark:border-gray-800 cursor-pointer transition-all duration-200
                  ${
                    !notif.is_read
                      ? "bg-indigo-50/60 dark:bg-indigo-900/10"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }
                `}
              >
                <div className="relative shrink-0 mt-1">
                  <img
                    src={
                      (notif as any).avatar ||
                      (notif as any).sender?.avatar ||
                      anhmacdinh.src
                    }
                    alt="Avatar"
                    className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700 shadow-sm"
                    onError={(e) => {
                      e.currentTarget.src = "https://via.placeholder.com/40";
                    }}
                  />
                  <div
                    className={`absolute -bottom-1 -right-1 p-1 rounded-full border-2 border-white dark:border-gray-900 shadow-sm ${getIconBg(
                      notif.type
                    )}`}
                  >
                    {renderIcon(notif.type)}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="text-sm text-gray-800 dark:text-gray-200 leading-snug pr-2">
                      <span className="font-bold hover:underline">
                        {(notif as any).fullName || "Người dùng"}
                      </span>{" "}
                      <span className="text-gray-600 dark:text-gray-300">
                        {notif.count > 1
                          ? notif.type === NotificationType.NEW_MESSAGE
                            ? `đã gửi cho bạn ${notif.count} tin nhắn`
                            : notif.content
                          : notif.content}
                      </span>
                    </p>

                    {notif.count > 1 && (
                      <span className="shrink-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                        +{notif.count}
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-indigo-500/80 dark:text-indigo-400/80 mt-1.5 font-medium block">
                    {new Date(notif.created_at).toLocaleString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "2-digit",
                      month: "2-digit",
                    })}
                  </span>
                </div>

                {!notif.is_read && (
                  <div className="self-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 shadow-glow-indigo"></div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {viewPostId && (
        <PostModal postId={viewPostId} onClose={() => setViewPostId(null)} />
      )}
    </>
  );
}