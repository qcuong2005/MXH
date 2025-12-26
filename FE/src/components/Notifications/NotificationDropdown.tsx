"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation"; // 👈 1. Thêm import router

import Notifications from "./Notifications";
import { getNotificationsApi } from "@/services/notification";
import { Notification } from "@/types";
import { useSocket } from "../SocketContext";

interface Props {
  currentUser: { id: number; token: string };
}

export default function NotificationDropdown({ currentUser }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const router = useRouter(); // 👈 2. Khai báo router
  const { socket } = useSocket();

  // 1. Lấy số lượng chưa đọc ban đầu
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const data = await getNotificationsApi(currentUser.token, currentUser.id);
        const count = data.filter((n: Notification) => !n.is_read).length;
        setUnreadCount(count);
      } catch (error) {
        console.error("Lỗi lấy số thông báo:", error);
      }
    };
    if (currentUser.token) fetchUnread();
  }, [currentUser]);

  // 2. Lắng nghe Socket để tăng số badge
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (newNotif: Notification) => {
      if (Number(newNotif.sender_id) !== Number(currentUser.id)) {
        setUnreadCount((prev) => prev + 1);
      }
    };

    socket.on("new_notification", handleNewNotification);
    return () => {
      socket.off("new_notification", handleNewNotification);
    };
  }, [socket, currentUser.id]);

  // 3. Click ra ngoài để đóng
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!isOpen) {
      setUnreadCount(0); // Reset số đếm khi mở
    }
    setIsOpen(!isOpen);
  };

  // 👇 3. Hàm xử lý khi bấm vào bài viết từ thông báo
  const handleOpenPost = (postId: number) => {
    setIsOpen(false); // Đóng dropdown trước
    router.push(`/post/${postId}`); // Chuyển sang trang chi tiết bài viết
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none"
      >
        <Bell className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        
        {/* Badge số lượng */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center border-2 border-white dark:border-gray-900 animate-bounce">
             {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Popup Danh sách thông báo */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-[380px] sm:w-[420px] max-w-[90vw] z-50 bg-white dark:bg-gray-900 shadow-2xl rounded-xl border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-top-2 overflow-hidden">
          {/* 👇 4. Truyền đủ props vào Notifications */}
          <Notifications 
            currentUser={currentUser} 
            onOpenPost={handleOpenPost}           // Fix lỗi thiếu prop onOpenPost
            onCloseDropdown={() => setIsOpen(false)} // Truyền thêm hàm đóng dropdown
          />
        </div>
      )}
    </div>
  );
}