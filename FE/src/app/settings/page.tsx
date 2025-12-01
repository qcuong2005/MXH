// app/settings/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Menu, X } from "lucide-react";

import {
  User, Settings, Bell, Shield, Palette, Globe,
} from "lucide-react";

import ProfileSettings from "@/components/setting/ProfileSettings";
import AccountSettings from "@/components/setting/AccountSettings";
import NotificationSettings from "@/components/setting/NotificationSettings";
import PrivacySettings from "@/components/setting/PrivacySettings";
import AppearanceSettings from "@/components/setting/AppearanceSettings";
import GeneralSettings from "@/components/setting/GeneralSettings";

const tabs = [
  { id: "profile", label: "Hồ sơ", icon: User },
  { id: "account", label: "Tài khoản", icon: Settings },
  { id: "notifications", label: "Thông báo", icon: Bell },
  { id: "privacy", label: "Quyền riêng tư", icon: Shield },
  { id: "appearance", label: "Giao diện", icon: Palette },
  { id: "general", label: "Chung", icon: Globe },
];

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
  }, [router]);

  // Đóng menu khi chọn tab trên mobile
  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "profile": return <ProfileSettings />;
      case "account": return <AccountSettings />;
      case "notifications": return <NotificationSettings />;
      case "privacy": return <PrivacySettings />;
      case "appearance": return <AppearanceSettings />;
      case "general": return <GeneralSettings />;
      default: return <ProfileSettings />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 lg:px-8">

            {/* Tiêu đề + Nút menu mobile */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Cài đặt
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1 dark:text-gray-300">
                  Quản lý tài khoản và tùy chỉnh trải nghiệm
                </p>
              </div>

              {/* Nút mở menu trên mobile */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

              {/* Menu - Mobile: Full màn hình, Desktop: Sidebar cố định */}
              <nav className={`
                fixed lg:static inset-0 z-40 lg:z-auto
                bg-white dark:bg-gray-900 lg:bg-transparent
                transform transition-transform duration-300 ease-in-out
                ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                lg:w-72 flex-shrink-0
              `}>
                {/* Overlay khi mở menu mobile */}
                {mobileMenuOpen && (
                  <div
                    className="fixed inset-0 bg-black/50 lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                  />
                )}

                <div className="relative h-full lg:h-auto overflow-y-auto pb-20 lg:pb-0">
                  <div className="p-4 lg:p-0 space-y-2">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;

                      return (
                        <button
                          key={tab.id}
                          onClick={() => handleTabClick(tab.id)}
                          className={`
                            w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-medium text-left
                            ${isActive
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 shadow-sm"
                              : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                            }
                          `}
                        >
                          <Icon className="w-5 h-5 flex-shrink-0" />
                          <span className="text-sm sm:text-base">{tab.label}</span>
                          {isActive && (
                            <div className="ml-auto w-1.5 h-8 bg-blue-600 rounded-full lg:hidden" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </nav>

              {/* Nội dung chính */}
              <div className="flex-1 min-w-0">
                <div className={`
                  transition-opacity duration-300
                  ${mobileMenuOpen ? "opacity-0 pointer-events-none" : "opacity-100"}
                  lg:opacity-100
                `}>
                  {renderContent()}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}