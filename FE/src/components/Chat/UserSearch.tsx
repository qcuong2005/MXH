// 📂 components/Chat/UserSearch.tsx
"use client";

import { Search } from "lucide-react";

interface UserSearchProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  placeholder?: string;
}

export default function UserSearch({
  searchTerm,
  setSearchTerm,
  placeholder = "Search users...",
}: UserSearchProps) {
  return (
    <div className="p-4 border-b border-gray-200">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}
