
"use client";

import React, { useEffect, useState } from "react";
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

interface Props {
  currentUser: { id: number; token: string } | null;
}

export default function Notifications({ currentUser }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { socket } = useSocket();

  // 1. Load thông báo ban đầu
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
          setNotifications(
            data.sort(
              (a: any, b: any) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            )
          );
        }
      } catch (error) {
        console.error("❌ [Notifications] Lỗi gọi API:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [currentUser]);

  // 2. Lắng nghe Socket Realtime
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

    return () => {
      socket.off("new_notification", handleNewNotification);
    };
  }, [socket, currentUser]);

  // 3. Xử lý click item
  const handleItemClick = async (notif: Notification) => {
    if (!currentUser) return;

    // --- A. Đánh dấu đã đọc ---
    if (!notif.is_read) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
      );
      markNotificationAsReadApi(currentUser.token, notif.id).catch(
        console.error
      );
    }

    // --- B. Xử lý điều hướng ---

    // === CASE 1: Like hoặc Comment -> Mở PostModal ===
// === CASE 1: Like hoặc Comment -> Mở PostModal ===
if (
  (notif.type === NotificationType.NEW_LIKE || notif.type === NotificationType.NEW_COMMENT)
) {
  // Thử tất cả các tên trường phổ biến nhất
  const postId = 
    (notif as any).entity_id ?? 
    (notif as any).post_id ?? 
    (notif as any).target_id ?? 
    (notif as any).resource_id;

  if (!postId) {
    console.error("Không tìm thấy ID bài viết trong notification:", notif);
    return;
  }

  console.log("Tìm thấy postId:", postId); // ← Phải thấy dòng này khi click

  localStorage.setItem("openPostId", postId.toString());
  
  setTimeout(() => {
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event("open_post_modal"));
    });
  }, 0);

  return;
}

    // === CASE 2: Tin nhắn ===
    if (notif.type === NotificationType.NEW_MESSAGE) {
      try {
        const conversation = await ensureConversation(
          currentUser.token,
          notif.sender_id
        );
        if (conversation?.id) {
          localStorage.setItem(
            "selectedConversationId",
            conversation.id.toString()
          );
          localStorage.setItem("selectedFriendId", notif.sender_id.toString());
          router.push("/messages");
        } else {
          // Fallback nếu lỗi tin nhắn thì về profile
          router.push(`/profile?userId=${notif.sender_id}`);
        }
      } catch (error) {
        console.error("Lỗi tin nhắn:", error);
        router.push(`/profile?userId=${notif.sender_id}`);
      }
      return;
    }

    // === CASE 3: Người theo dõi mới (Follower) ===
    // Logic mới thêm vào đây
    if (notif.type === NotificationType.NEW_FOLLOWER) {
      router.push(`/profile?userId=${notif.sender_id}`);
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

  // Helper render icon
  const renderIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.NEW_LIKE:
        return <Heart className="w-4 h-4 text-white fill-current" />;
      case NotificationType.NEW_COMMENT:
        return <MessageCircle className="w-4 h-4 text-white fill-current" />;
      case NotificationType.NEW_FOLLOWER:
        return <UserPlus className="w-4 h-4 text-white" />;
      case NotificationType.FRIEND_REQUEST:
        return <UserPlus className="w-4 h-4 text-white" />;
      case NotificationType.FRIEND_ACCEPT:
        return <UserCheck className="w-4 h-4 text-white" />;
      case NotificationType.INCOMING_CALL:
        return <PhoneIncoming className="w-4 h-4 text-white" />;
      case NotificationType.NEW_MESSAGE:
        return <MessageSquare className="w-4 h-4 text-white" />;
      default:
        return <Bell className="w-4 h-4 text-white" />;
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
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto mb-2"></div>
        Đang tải...
      </div>
    );
  }

  return (
    <div className="flex flex-col max-h-[70vh]">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-900 sticky top-0 z-10">
        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">
          Thông báo
        </h3>
        {notifications.length > 0 && currentUser && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors"
          >
            <CheckCheck size={14} /> Đánh dấu đã đọc
          </button>
        )}
      </div>

      <div className="overflow-y-auto flex-1 custom-scrollbar bg-white dark:bg-gray-900">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-10 text-gray-400 dark:text-gray-500">
            <Bell className="w-12 h-12 mb-3 opacity-20" />
            <p>Chưa có thông báo nào</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleItemClick(notif)}
              className={`group flex items-start gap-3 p-4 border-b border-gray-50 dark:border-gray-800 cursor-pointer transition-all duration-200
                ${
                  !notif.is_read
                    ? "bg-indigo-50/60 dark:bg-indigo-900/10 hover:bg-indigo-100/50 dark:hover:bg-indigo-900/20"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                }
              `}
            >
              <div className="relative shrink-0 mt-1">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center font-bold text-gray-500 dark:text-gray-300 text-xs shadow-sm">
                  {notif.sender_id}
                </div>
                <div
                  className={`absolute -bottom-1 -right-1 p-1 rounded-full border-2 border-white dark:border-gray-900 shadow-sm ${getIconBg(
                    notif.type
                  )}`}
                >
                  {renderIcon(notif.type)}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 dark:text-gray-200 leading-snug">
                  <span className="font-bold hover:underline">
                    User {notif.sender_id}
                  </span>{" "}
                  <span className="text-gray-600 dark:text-gray-300">
                    {notif.content}
                  </span>
                </p>
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
  );
}
