"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Feed from "@/components/Feed";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-0">
        <Header />
        <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
          {/* 👇 FIX Ở ĐÂY 👇 
            Đã đổi 'max-w-2xl' (672px) thành 'max-w-4xl' (896px) 
            để cột Feed rộng hơn.
          */}
          <div className="max-w-4xl mx-auto p-4">
            <Feed />
          </div>
        </main>
      </div>
    </div>
  );
}
