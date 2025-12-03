"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getNotificationsApi,
  markNotificationAsReadApi,
  markAllNotificationsAsReadApi,
} from "@/services/notification";
import { Notification, NotificationType } from "@/types";
import { Heart, MessageCircle, UserPlus, Bell, CheckCheck } from "lucide-react";
import { useSocket } from "../SocketContext";

// currentUser có thể là null → không bắt buộc đăng nhập
interface Props {
  currentUser: { id: number; token: string } | null;
}

export default function Notifications({ currentUser }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { socket } = useSocket();

  // Load thông báo – nếu chưa đăng nhập thì gọi API sẽ fail → tự động về mảng rỗng
  useEffect(() => {
    const fetchNotifications = async () => {
      // Không check currentUser nữa → cứ gọi API, lỗi thì catch
      try {
        if (currentUser) {
          const data = await getNotificationsApi(currentUser.token, currentUser.id);
          setNotifications(
            data.sort((a: any, b: any) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )
          );
        }
      } catch (error) {
        console.log("Chưa đăng nhập hoặc lỗi tải thông báo → để trống danh sách");
        setNotifications([]); // Đảm bảo không lỗi
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [currentUser]);

useEffect(() => {
  if (!socket || !currentUser) return;

  const handleNewNotification = (notification: Notification) => {
    console.log("Realtime thông báo mới:", notification);

    // Kiểm tra đúng người nhận
    if (notification.user_id !== currentUser.id) return;

    setNotifications((prev) => {
      // Tránh duplicate
      if (prev.some(n => n.id === notification.id)) return prev;
      return [notification, ...prev];
    });
  };

  socket.on("new_notification", handleNewNotification);

  return () => {
    socket.off("new_notification", handleNewNotification);
  };
}, [socket, currentUser]);

  // Click item – nếu chưa đăng nhập thì không làm gì cả
  const handleItemClick = async (notif: Notification) => {
    if (!currentUser) return;

    if (!notif.is_read) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
      );
      markNotificationAsReadApi(currentUser.token, notif.id).catch(() => {});
    }

    if (notif.resource_url) {
      router.push(notif.resource_url);
    } else if (notif.type === NotificationType.NEW_FOLLOWER) {
      router.push(`/profile/${notif.sender_id}`);
    }
  };

  const handleMarkAllRead = async () => {
    if (!currentUser) return;

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await markAllNotificationsAsReadApi(currentUser.token, currentUser.id).catch(() => {});
  };

  const renderIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.NEW_LIKE: return <Heart className="w-4 h-4 text-white fill-current" />;
      case NotificationType.NEW_COMMENT: return <MessageCircle className="w-4 h-4 text-white fill-current" />;
      case NotificationType.NEW_FOLLOWER: return <UserPlus className="w-4 h-4 text-white fill-current" />;
      default: return <Bell className="w-4 h-4 text-white" />;
    }
  };

  const getIconBg = (type: NotificationType) => {
    switch (type) {
      case NotificationType.NEW_LIKE: return "bg-red-500";
      case NotificationType.NEW_COMMENT: return "bg-blue-500";
      case NotificationType.NEW_FOLLOWER: return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  // Không loading nữa – vì nếu chưa đăng nhập thì list rỗng luôn
  if (loading) {
    return <div className="p-8 text-center text-gray-500">Đang tải...</div>;
  }

  return (
    <div className="flex flex-col max-h-[70vh]">
      <div className="px-4 py-3 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
        <h3 className="font-semibold text-gray-700 dark:text-gray-200">Thông báo</h3>
        {notifications.length > 0 && currentUser && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <CheckCheck size={14} /> Đọc tất cả
          </button>
        )}
      </div>

      <div className="overflow-y-auto flex-1 custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-400 dark:text-gray-500">
            Chưa có thông báo nào
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleItemClick(notif)}
              className={`flex items-start gap-3 p-3 border-b dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                !notif.is_read ? "bg-blue-50 dark:bg-blue-900/20" : ""
              }`}
            >
              <div className="relative shrink-0 mt-1">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500 text-xs">
                  {notif.sender_id}
                </div>
                <div
                  className={`absolute -bottom-1 -right-1 p-1 rounded-full border-2 border-white dark:border-gray-900 ${getIconBg(
                    notif.type
                  )}`}
                >
                  {renderIcon(notif.type)}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-2">
                  <span className="font-bold">User {notif.sender_id}</span>{" "}
                  {getContentByType(notif)}
                </p>
                <span className="text-xs text-gray-400 dark:text-gray-500 mt-1 block">
                  {new Date(notif.created_at).toLocaleString("vi-VN")}
                </span>
              </div>

              {!notif.is_read && (
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function getContentByType(notif: Notification) {
  if (notif.content) return notif.content;
  switch (notif.type) {
    case NotificationType.NEW_LIKE: return "đã thích bài viết của bạn.";
    case NotificationType.NEW_COMMENT: return "đã bình luận bài viết của bạn.";
    case NotificationType.NEW_FOLLOWER: return "đã bắt đầu theo dõi bạn.";
    case NotificationType.NEW_MESSAGE: return "đã gửi tin nhắn cho bạn.";
    default: return "có thông báo mới.";
  }
}