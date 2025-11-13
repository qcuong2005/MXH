"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Save,
  Eye,
  EyeOff,
  Camera,
  Trash2,
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    bio: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    privacy: {
      profileVisibility: "public",
      showEmail: false,
      showOnlineStatus: true,
    },
    appearance: {
      theme: "light",
      language: "en",
    },
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedChange = <P extends "notifications" | "privacy" | "appearance", F extends keyof typeof formData[P]>(
    parent: P,
    field: F,
    value: typeof formData[P][F]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
      },
    }));
  };

  const handleSave = () => {
    // Handle save logic here
    console.log("Saving settings:", formData);
    alert("Settings saved successfully!");
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "account", label: "Account", icon: SettingsIcon },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "general", label: "General", icon: Globe },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Profile Settings
            </h2>

            {/* Avatar Section */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <img
                    src="/api/placeholder/100/100"
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
                  />
                  <button className="absolute -bottom-2 -right-2 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    Profile Picture
                  </h3>
                  <p className="text-sm text-gray-500 mb-3 dark:text-gray-400">
                    Upload a new profile picture
                  </p>
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                    Change Photo
                  </button>
                </div>
              </div>
            </div>

            {/* Profile Information */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 mb-4">
                Profile Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      handleInputChange("username", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
                    placeholder="Enter username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
                    placeholder="Enter email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
                    placeholder="Tell us about yourself"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case "account":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Account Settings
            </h2>

            {/* Change Password */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 mb-4">
                Change Password
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.currentPassword}
                      onChange={(e) =>
                        handleInputChange("currentPassword", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) =>
                      handleInputChange("newPassword", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 rounded-lg p-6 border border-red-200 dark:bg-red-900/30 dark:border-red-800">
              <h3 className="font-semibold text-red-900 mb-4 dark:text-red-300">Danger Zone</h3>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-red-900 dark:text-red-300">Delete Account</h4>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Permanently delete your account and all data
                  </p>
                </div>
                <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2">
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Account</span>
                </button>
              </div>
            </div>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Notification Settings
            </h2>

            <div className="bg-white rounded-lg p-6 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 mb-4">
                Notification Preferences
              </h3>
              <div className="space-y-4">
                {[
                  {
                    key: "email",
                    label: "Email Notifications",
                    description: "Receive notifications via email",
                  },
                  {
                    key: "push",
                    label: "Push Notifications",
                    description: "Receive push notifications on your device",
                  },
                  {
                    key: "sms",
                    label: "SMS Notifications",
                    description: "Receive notifications via SMS",
                  },
                ].map((notification) => (
                  <div
                    key={notification.key}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {notification.label}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {notification.description}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={
                          formData.notifications[
                            notification.key as keyof typeof formData.notifications
                          ]
                        }
                        onChange={(e) =>
                          handleNestedChange(
                            "notifications",
                            notification.key as keyof typeof formData.notifications,
                            e.target.checked
                          )
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 dark:bg-gray-700"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "privacy":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Privacy Settings
            </h2>

            <div className="bg-white rounded-lg p-6 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 mb-4">
                Privacy Preferences
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Profile Visibility
                  </label>
                  <select
                    value={formData.privacy.profileVisibility}
                    onChange={(e) =>
                      handleNestedChange(
                        "privacy",
                        "profileVisibility",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
                  >
                    <option value="public">Public</option>
                    <option value="friends">Friends Only</option>
                    <option value="private">Private</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      Show Email Address
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Allow others to see your email address
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.privacy.showEmail}
                      onChange={(e) =>
                        handleNestedChange(
                          "privacy",
                          "showEmail",
                          e.target.checked
                        )
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 dark:bg-gray-700"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      Show Online Status
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Let others know when you're online
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.privacy.showOnlineStatus}
                      onChange={(e) =>
                        handleNestedChange(
                          "privacy",
                          "showOnlineStatus",
                          e.target.checked
                        )
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 dark:bg-gray-700"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case "appearance":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Appearance Settings
            </h2>

            <div className="bg-white rounded-lg p-6 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 mb-4">
                Display Preferences
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Theme
                  </label>
                  <select
                    value={formData.appearance.theme}
                    onChange={(e) =>
                      handleNestedChange("appearance", "theme", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Language
                  </label>
                  <select
                    value={formData.appearance.language}
                    onChange={(e) =>
                      handleNestedChange(
                        "appearance",
                        "language",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
                  >
                    <option value="en">English</option>
                    <option value="vi">Tiếng Việt</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              General Settings
            </h2>

            <div className="bg-white rounded-lg p-6 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 mb-4">
                General Preferences
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Default Post Privacy
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700">
                    <option value="public">Public</option>
                    <option value="friends">Friends Only</option>
                    <option value="private">Private</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Time Zone
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700">
                    <option value="UTC+7">UTC+7 (Vietnam)</option>
                    <option value="UTC-5">UTC-5 (EST)</option>
                    <option value="UTC+0">UTC+0 (GMT)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-4">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2 dark:text-gray-100">
                Settings
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Manage your account settings and preferences
              </p>
            </div>

            <div className="flex gap-6">
              {/* Settings Sidebar */}
              <div className="w-64 flex-shrink-0">
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                          activeTab === tab.id
                            ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-400"
                            : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Settings Content */}
              <div className="flex-1">
                {renderTabContent()}

                {/* Save Button */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleSave}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                  >
                    <Save className="w-5 h-5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
