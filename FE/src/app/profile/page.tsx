"use client";

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import ProfileHeader from "@/components/ProfileHeader";

export default function Profile() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar bên trái */}
      <Sidebar />

      {/* Khối phải: Header + Nội dung */}
      <div className="flex-1 flex flex-col">
        <Header />

        {/* 👇 SỬA Ở ĐÂY 
          Đổi 'overflow-hidden' thành 'overflow-y-auto'
        */}
        <main className="flex-1 overflow-y-auto">
          {/* Mình cũng đã bỏ bớt các thẻ div thừa bên trong main
            để ProfileHeader của bạn hiển thị trực tiếp 
            và cuộn mượt mà hơn.
          */}
          <div className="max-w-5xl mx-auto p-4 md:p-8">
            <ProfileHeader />
          </div>
        </main>
      </div>
    </div>
  );
}
