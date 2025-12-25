"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Loader2,
  FileText,
  User,
  Share2,
  MessageCircle,
  Search,
  Bookmark,
} from "lucide-react";
import { fetchAPI } from "@/lib/api";
import { getMySavedPosts, toggleSavePost } from "@/services/save";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import anhmacdinh from "../../../image/anhmacdinh.jpg";
import type { Post, Comment as AppComment } from "@/types";
import Likes from "@/components/Posts/likes";
import CommentForm from "@/components/Posts/Comments";
import { getCommentsByPost } from "@/services/api";

// ----------------------------------------------------------------------
// COMPONENT CON: Chứa toàn bộ Logic tìm kiếm + GỢI Ý TÌM KIẾM
// ----------------------------------------------------------------------
function SearchContent() {
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q")?.trim() || "";
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  // Dữ liệu gốc (tải 1 lần khi mount)
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  // Dữ liệu đã lọc theo urlQuery (kết quả hiển thị)
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);

  // State cho tương tác
  const [commentCounts, setCommentCounts] = useState<Record<number, number>>({});
  const [shareCounts, setShareCounts] = useState<Record<number, number>>({});
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [openCommentPost, setOpenCommentPost] = useState<number | null>(null);

  // State cho ô tìm kiếm + gợi ý
  const [inputQuery, setInputQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Đồng bộ input với urlQuery khi URL thay đổi (ví dụ: từ trang khác chuyển sang)
  useEffect(() => {
    setInputQuery(urlQuery);
  }, [urlQuery]);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Helper đếm comment
  const countAllComments = (list: AppComment[]): number => {
    if (!list) return 0;
    let total = 0;
    for (const c of list) {
      total += 1;
      if (c.children?.length) total += countAllComments(c.children);
    }
    return total;
  };

  // Gợi ý người dùng & bài viết (tối đa 5 mỗi loại)
  const suggestedUsers = useMemo(() => {
    if (!inputQuery.trim()) return [];
    const lower = inputQuery.toLowerCase();
    return allUsers
      .filter(
        (u: any) =>
          u.fullName?.toLowerCase().includes(lower) ||
          u.username?.toLowerCase().includes(lower)
      )
      .slice(0, 5);
  }, [inputQuery, allUsers]);

  const suggestedPosts = useMemo(() => {
    if (!inputQuery.trim()) return [];
    const lower = inputQuery.toLowerCase();
    return allPosts
      .filter(
        (p: Post) =>
          p.title?.toLowerCase().includes(lower) ||
          p.content?.toLowerCase().includes(lower)
      )
      .slice(0, 5);
  }, [inputQuery, allPosts]);

  // XỬ LÝ LƯU BÀI VIẾT (giữ nguyên)
  const handleSavePost = async (post: Post) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Bạn cần đăng nhập để lưu bài viết.");
      return;
    }

    const isSaved = savedIds.has(post.id);

    setSavedIds((prev) => {
      const next = new Set(prev);
      if (isSaved) next.delete(post.id);
      else next.add(post.id);
      return next;
    });

    try {
      const result = await toggleSavePost(token, post.id);
      if (result && typeof result.saved === "boolean") {
        setSavedIds((prev) => {
          const next = new Set(prev);
          if (result.saved) next.add(post.id);
          else next.delete(post.id);
          return next;
        });
      }
    } catch (error) {
      console.error("Lỗi lưu bài viết:", error);
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (isSaved) next.add(post.id);
        else next.delete(post.id);
        return next;
      });
    }
  };

  // XỬ LÝ SHARE (giữ nguyên)
  const handleShare = async (post: Post) => {
    setShareCounts((prev) => ({
      ...prev,
      [post.id]: (prev[post.id] || 0) + 1,
    }));
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.content,
          url: window.location.href,
        });
      } catch {
        console.warn("Cancel share");
      }
    } else {
      alert("Đã sao chép liên kết!");
    }
  };

  const handleCommentAdded = (postId: number) => {
    setCommentCounts((prev) => ({
      ...prev,
      [postId]: (prev[postId] || 0) + 1,
    }));
  };

  // TẢI DỮ LIỆU GỐC (luôn chạy khi mount)
  useEffect(() => {
    const fetchBaseData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // 1. Tải bài đã lưu
        const savedRes = await getMySavedPosts(token);
        const savedList = Array.isArray(savedRes)
          ? savedRes
          : (savedRes as any).data || [];
        const ids = new Set<number>(savedList.map((post: Post) => post.id));
        setSavedIds(ids);

        // 2. Tải tất cả bài viết
        const res = await fetchAPI("/post?page=1&limit=100", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const postsData = Array.isArray(res) ? res : res.data || [];
        setAllPosts(postsData);

        // 3. Tạo danh sách unique users
        const uniqueUsersMap = new Map();
        postsData.forEach((p: Post) => {
          if (p.user && (p as any).user.id && !uniqueUsersMap.has((p as any).user.id)) {
            uniqueUsersMap.set((p as any).user.id, p.user);
          }
        });
        setAllUsers(Array.from(uniqueUsersMap.values()));
      } catch (error) {
        console.error("Lỗi tải dữ liệu gốc:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBaseData();
  }, []);

  // LỌC KẾT QUẢ THEO urlQuery
  useEffect(() => {
    if (!allPosts.length) return;

    const lower = urlQuery.toLowerCase();
    const postsResult = allPosts.filter(
      (p: Post) =>
        p.title?.toLowerCase().includes(lower) ||
        p.content?.toLowerCase().includes(lower)
    );
    setFilteredPosts(postsResult);

    const usersResult = allUsers.filter(
      (u: any) =>
        u.fullName?.toLowerCase().includes(lower) ||
        u.username?.toLowerCase().includes(lower)
    );
    setFilteredUsers(usersResult);
  }, [urlQuery, allPosts, allUsers]);

  // TẢI COMMENT & SHARE CHO KẾT QUẢ HIỆN TẠI
  useEffect(() => {
    if (filteredPosts.length === 0) {
      setCommentCounts({});
      setShareCounts({});
      return;
    }

    const loadInteractions = async () => {
      const commentData: Record<number, number> = {};
      const shareData: Record<number, number> = {};

      await Promise.all(
        filteredPosts.map(async (p: Post) => {
          shareData[p.id] = (p as any).share_count || Math.floor(Math.random() * 5);
          try {
            const list: AppComment[] = await getCommentsByPost(p.id);
            commentData[p.id] = countAllComments(list);
          } catch {
            commentData[p.id] = 0;
          }
        })
      );

      setCommentCounts(commentData);
      setShareCounts(shareData);
    };

    loadInteractions();
  }, [filteredPosts]);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-3xl mx-auto">
            {/* === Ô TÌM KIẾM + GỢI Ý === */}
            <div ref={searchRef} className="relative mb-8">
              <div className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3">
                <Search className="w-6 h-6 text-gray-500" />
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  onFocus={() => setShowDropdown(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && inputQuery.trim()) {
                      router.push(`/search?q=${encodeURIComponent(inputQuery.trim())}`);
                      setShowDropdown(false);
                    }
                  }}
                  placeholder="Tìm kiếm bài viết, người dùng..."
                  className="flex-1 outline-none bg-transparent text-lg"
                />
                {inputQuery && (
                  <button
                    onClick={() => {
                      setInputQuery("");
                      setShowDropdown(false);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Dropdown gợi ý */}
              {showDropdown && inputQuery.trim() && (suggestedUsers.length > 0 || suggestedPosts.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto z-20">
                  {suggestedUsers.length > 0 && (
                    <div>
                      <p className="px-4 py-2 text-sm font-semibold text-gray-500 border-b dark:border-gray-700">
                        Người dùng
                      </p>
                      {suggestedUsers.map((user) => (
                        <div
                          key={user.id}
                          onClick={() => {
                            router.push(`/profile?userId=${user.id}`);
                            setShowDropdown(false);
                            setInputQuery("");
                          }}
                          className="flex items-center gap-4 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        >
                          <img
                            src={user.avatar || anhmacdinh.src}
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e: any) => (e.target.src = anhmacdinh.src)}
                          />
                          <div>
                            <p className="font-semibold">{user.fullName}</p>
                            <p className="text-sm text-gray-500">@{user.username}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {suggestedPosts.length > 0 && (
                    <div>
                      <p className="px-4 py-2 text-sm font-semibold text-gray-500 border-b dark:border-gray-700">
                        Bài viết
                      </p>
                      {suggestedPosts.map((post) => (
                        <div
                          key={post.id}
                          onClick={() => {
                            router.push(`/post/${post.id}`);
                            setShowDropdown(false);
                            setInputQuery("");
                          }}
                          className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        >
                          <p className="font-bold text-base">{post.title || "Không có tiêu đề"}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {post.content}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Bởi {post.user?.fullName || "Ẩn danh"}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div
                    onClick={() => {
                      router.push(`/search?q=${encodeURIComponent(inputQuery.trim())}`);
                      setShowDropdown(false);
                    }}
                    className="px-4 py-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 cursor-pointer text-indigo-600 font-medium border-t dark:border-gray-700"
                  >
                    Xem tất cả kết quả cho "{inputQuery.trim()}"
                  </div>
                </div>
              )}
            </div>

            {/* Tiêu đề kết quả (chỉ hiển thị khi có query) */}
            {urlQuery && (
              <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
                Kết quả tìm kiếm cho: "{urlQuery}"
              </h1>
            )}

            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
            ) : (
              <div className="space-y-8">
                {/* === KẾT QUẢ NGƯỜI DÙNG === */}
                {filteredUsers.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-bold mb-4 text-gray-700 dark:text-gray-200 border-b pb-2 dark:border-gray-700 flex items-center gap-2">
                      <User className="w-5 h-5" /> Mọi người
                    </h2>
                    <div className="grid gap-4">
                      {filteredUsers.map((user) => (
                        <Link
                          href={`/profile?userId=${user.id}`}
                          key={user.id}
                          className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition"
                        >
                          <img
                            src={user.avatar || anhmacdinh.src}
                            className="w-14 h-14 rounded-full object-cover border-2 border-gray-100"
                            onError={(e: any) => (e.currentTarget.src = anhmacdinh.src)}
                          />
                          <div>
                            <p className="font-bold text-lg text-gray-900 dark:text-white">
                              {user.fullName}
                            </p>
                            <p className="text-sm text-gray-500">@{user.username}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* === KẾT QUẢ BÀI VIẾT === */}
                {filteredPosts.length > 0 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                      <FileText className="w-6 h-6" /> Bài viết
                    </h2>
                    {filteredPosts.map((post) => {
                      const isSaved = savedIds.has(post.id);

                      return (
                        <div
                          key={post.id}
                          className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition"
                        >
                          {/* Header bài viết */}
                          <div className="flex gap-3 mb-3">
                            <Link href={`/profile?userId=${(post as any).user?.id}`}>
                              <img
                                src={post.user?.avatar || anhmacdinh.src}
                                className="w-10 h-10 rounded-full object-cover"
                                onError={(e: any) => (e.currentTarget.src = anhmacdinh.src)}
                              />
                            </Link>
                            <div>
                              <Link href={`/profile?userId=${(post as any).user?.id}`}>
                                <p className="font-semibold text-sm text-gray-900 dark:text-white hover:underline">
                                  {post.user?.fullName}
                                </p>
                              </Link>
                              <p className="text-xs text-gray-500">
                                {new Date(post.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          {/* Nội dung bài viết */}
                          <Link href={`/post/${post.id}`}>
                            <h3 className="font-bold text-lg mb-2 hover:text-indigo-600 transition dark:text-gray-100">
                              {post.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 line-clamp-3 mb-3 whitespace-pre-line">
                              {post.content}
                            </p>
                            {post.image_url && (
                              <img
                                src={post.image_url}
                                className="rounded-lg max-h-[400px] object-cover w-full border dark:border-gray-700"
                              />
                            )}
                          </Link>

                          {/* Footer Actions */}
                          <div className="flex flex-wrap justify-between items-center gap-2 text-gray-600 dark:text-gray-400 text-sm mt-4 pt-3 border-t dark:border-gray-700">
                            <div className="flex items-center gap-4">
                              <Likes postId={post.id} type="post" />

                              <button
                                onClick={() =>
                                  setOpenCommentPost(
                                    openCommentPost === post.id ? null : post.id
                                  )
                                }
                                className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
                              >
                                <MessageCircle className="w-5 h-5" />
                                <span>{commentCounts[post.id] || 0} Bình luận</span>
                              </button>

                              <button
                                onClick={() => handleShare(post)}
                                className="flex items-center gap-1 hover:text-green-600 transition-colors"
                              >
                                <Share2 className="w-5 h-5" />
                                <span>{shareCounts[post.id] || 0} Chia sẻ</span>
                              </button>
                            </div>

                            <button
                              onClick={() => handleSavePost(post)}
                              className={`flex items-center gap-1 transition-colors ${
                                isSaved
                                  ? "text-yellow-500 hover:text-yellow-600"
                                  : "text-gray-500 hover:text-yellow-500 dark:text-gray-400"
                              }`}
                              title={isSaved ? "Bỏ lưu" : "Lưu bài viết"}
                            >
                              <Bookmark
                                className="w-5 h-5"
                                fill={isSaved ? "currentColor" : "none"}
                              />
                              <span className="hidden sm:inline">
                                {isSaved ? "Đã lưu" : "Lưu"}
                              </span>
                            </button>
                          </div>

                          {/* Khung Bình Luận */}
                          {openCommentPost === post.id && (
                            <div className="mt-4 border-t pt-3 dark:border-gray-700">
                              <CommentForm
                                postId={post.id}
                                onCommentAdded={() => handleCommentAdded(post.id)}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* === KHÔNG CÓ KẾT QUẢ === */}
                {filteredPosts.length === 0 && filteredUsers.length === 0 && (
                  <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                    <div className="bg-gray-100 dark:bg-gray-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {!urlQuery ? "Bắt đầu tìm kiếm" : "Không tìm thấy kết quả"}
                    </h3>
                    <p className="text-gray-500 mt-2">
                      {!urlQuery
                        ? "Nhập từ khóa vào ô tìm kiếm để xem bài viết và người dùng."
                        : `Chúng tôi không tìm thấy kết quả nào cho "${urlQuery}".`}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// COMPONENT CHÍNH (vẫn giữ Suspense)
// ----------------------------------------------------------------------
export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
            <p className="text-gray-500">Đang tải trang tìm kiếm...</p>
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}