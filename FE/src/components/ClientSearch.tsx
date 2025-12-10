"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, X, Loader2, User, FileText } from "lucide-react";
import { fetchAPI } from "@/lib/api"; // Đảm bảo đường dẫn đúng
import anhmacdinh from "../../image/anhmacdinh.jpg"; // Đảm bảo đường dẫn đúng

// Định nghĩa kiểu dữ liệu đơn giản cho gợi ý
interface SearchResult {
  users: any[];
  posts: any[];
}

export default function ClientSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult>({ users: [], posts: [] });
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null); // Để xử lý click outside
  const inputRef = useRef<HTMLInputElement>(null);

  // Xử lý click ra ngoài để đóng dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && 
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Xử lý logic tìm kiếm (Debounce thủ công)
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!query.trim()) {
        setResults({ users: [], posts: [] });
        return;
      }

      setIsLoading(true);
      setIsOpen(true);

      try {
        const token = localStorage.getItem("token");
        // Gọi API giống logic ở trang SearchPage
        // LƯU Ý: Tốt nhất backend nên có API riêng: /search/suggest?q=... để nhẹ hơn
        const res = await fetchAPI("/post?page=1&limit=50", { // Limit 50 để nhẹ hơn
             headers: { Authorization: `Bearer ${token}` }
        });

        const allPosts = Array.isArray(res) ? res : (res.data || []);
        const searchLower = query.toLowerCase();

        // 1. Lọc Bài viết
        const postsResult = allPosts.filter((p: any) => 
            (p.title?.toLowerCase() || "").includes(searchLower)
        ).slice(0, 3); // Chỉ lấy 3 bài viết gợi ý

        // 2. Lọc Người dùng
        const uniqueUsersMap = new Map();
        allPosts.forEach((p: any) => {
             if (p.user && p.user.id && !uniqueUsersMap.has(p.user.id)) {
                 uniqueUsersMap.set(p.user.id, p.user);
             }
        });
        const usersResult = Array.from(uniqueUsersMap.values()).filter((u: any) => 
             (u.fullName?.toLowerCase() || "").includes(searchLower) ||
             (u.username?.toLowerCase() || "").includes(searchLower)
        ).slice(0, 3); // Chỉ lấy 3 user gợi ý

        setResults({ users: usersResult, posts: postsResult });

      } catch (error) {
        console.error("Lỗi gợi ý tìm kiếm:", error);
      } finally {
        setIsLoading(false);
      }
    }, 500); // Đợi 500ms sau khi ngừng gõ mới tìm

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(false); // Đóng gợi ý
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setResults({ users: [], posts: [] });
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full max-w-lg mx-auto z-50"> 
      {/* Form tìm kiếm */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <button 
          type="submit" 
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
        >
          <Search className="w-5 h-5" />
        </button>
        
        <input
          ref={inputRef}
          type="text"
          placeholder="Tìm kiếm bạn bè, bài viết..."
          value={query}
          onChange={(e) => {
              setQuery(e.target.value);
              if(e.target.value.trim()) setIsOpen(true);
          }}
          onFocus={() => { if (query.trim()) setIsOpen(true); }}
          className="w-full pl-12 pr-10 py-3 bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-indigo-500 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 transition-all text-gray-900 dark:text-white shadow-sm"
        />

        {/* Nút xóa text */}
        {query && (
            <button 
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
                <X className="w-4 h-4" />
            </button>
        )}
      </form>

      {/* Dropdown Gợi ý */}
      {isOpen && query.trim() && (
        <div 
            ref={dropdownRef}
            className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden max-h-[80vh] overflow-y-auto"
        >
          
          {/* Trạng thái Loading */}
          {isLoading && (
            <div className="p-4 flex items-center justify-center text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span className="text-sm">Đang tìm...</span>
            </div>
          )}

          {/* Không có kết quả */}
          {!isLoading && results.users.length === 0 && results.posts.length === 0 && (
             <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                 Không tìm thấy kết quả phù hợp.
                 <br/>
                 Nhấn <b>Enter</b> để xem tất cả kết quả.
             </div>
          )}

          {/* Hiển thị kết quả */}
          {!isLoading && (results.users.length > 0 || results.posts.length > 0) && (
            <div className="py-2">
                
                {/* Section: Mọi người */}
                {results.users.length > 0 && (
                    <div className="mb-2">
                        <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-900/50">
                            Mọi người
                        </h3>
                        <ul>
                            {results.users.map((user) => (
                                <li key={user.id}>
                                    <Link 
                                        href={`/profile?userId=${user.id}`}
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center px-4 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors cursor-pointer"
                                    >
                                        <img 
                                            src={user.avatar || anhmacdinh.src} 
                                            alt={user.fullName}
                                            className="w-8 h-8 rounded-full object-cover border border-gray-200"
                                            onError={(e) => e.currentTarget.src = anhmacdinh.src}
                                        />
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{user.fullName}</p>
                                            <p className="text-xs text-gray-500">@{user.username}</p>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Section: Bài viết */}
                {results.posts.length > 0 && (
                    <div>
                        <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-900/50">
                            Bài viết
                        </h3>
                        <ul>
                            {results.posts.map((post) => (
                                <li key={post.id}>
                                    <Link 
                                        href={`/post/${post.id}`}
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-start px-4 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors cursor-pointer"
                                    >
                                        <FileText className="w-4 h-4 text-gray-400 mt-1 mr-3 flex-shrink-0" />
                                        <div className="overflow-hidden">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                {post.title || "Bài viết không tiêu đề"}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">
                                                đăng bởi {post.user?.fullName}
                                            </p>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                
                {/* Nút xem tất cả */}
                <div className="border-t border-gray-100 dark:border-gray-700 mt-2 pt-2 px-2">
                    <button 
                        onClick={handleSearchSubmit}
                        className="w-full text-center py-2 text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium hover:bg-indigo-50 dark:hover:bg-gray-800 rounded-lg transition"
                    >
                        Xem tất cả kết quả cho "{query}"
                    </button>
                </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}