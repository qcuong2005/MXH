"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import {
  Bookmark,
  Heart,
  Share2,
  MessageCircle,
  MoreVertical,
  Search,
  Trash2,
  Lock,
  Globe,
  Users,
} from "lucide-react";
import type { Post } from "@/types";
import type { Comment as AppComment } from "@/types"; // Import type Comment
import anhmacdinh from "../../../image/anhmacdinh.jpg";
import { getMySavedPosts, toggleSavePost } from "@/services/save";
import { getCommentsByPost } from "@/services/api"; // Import API lấy comment
import Likes from "@/components/Posts/likes";
import CommentForm from "@/components/Posts/Comments";


export default function SavedPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  // --- STATE CHO COMMENT & SHARE ---
  const [commentCounts, setCommentCounts] = useState<Record<number, number>>({});
  const [openCommentPost, setOpenCommentPost] = useState<number | null>(null);
  const [shareCounts, setShareCounts] = useState<Record<number, number>>({}); // Nếu muốn tính năng share

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getMySavedPosts(token);
        
        if (Array.isArray(data)) {
            setPosts(data);

            // --- LẤY SỐ LƯỢNG COMMENT & SHARE CHO TỪNG BÀI ---
            const commentData: Record<number, number> = {};
            const shareData: Record<number, number> = {};

            await Promise.all(
                data.map(async (p: Post) => {
                    shareData[p.id] = Math.floor(Math.random() * 10); // Mock share count (hoặc lấy từ API nếu có)
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

        } else {
            console.warn("Dữ liệu trả về không phải mảng:", data);
            setPosts([]);
        }
      } catch (error) {
        console.error("Lỗi khi tải bài viết đã lưu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // Helper đếm tổng comment (bao gồm comment con)
  const countAllComments = (list: AppComment[]): number => {
    if (!list) return 0;
    let total = 0;
    for (const c of list) {
      total += 1;
      if (c.children?.length) total += countAllComments(c.children);
    }
    return total;
  };

  const handleUnsave = async (postId: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const confirmed = window.confirm("Bạn có chắc muốn bỏ lưu bài viết này?");
    if (!confirmed) return;

    try {
        const result = await toggleSavePost(token, postId);
        // Lưu ý: Kiểm tra logic trả về của API toggleSavePost
        // Nếu API trả về { saved: false } nghĩa là đã bỏ lưu thành công
        if (result && result.saved === false) {
            setPosts((prevPosts) => prevPosts.filter((p) => p.id !== postId));
        }
    } catch (error) {
        console.error("Lỗi khi bỏ lưu:", error);
        alert("Có lỗi xảy ra, vui lòng thử lại.");
    }
  };

  const handleCommentAdded = (postId: number) => {
    setCommentCounts((prev) => ({ ...prev, [postId]: (prev[postId] || 0) + 1 }));
  };

  const handleShare = async (post: Post) => {
     setShareCounts((prev) => ({ ...prev, [post.id]: (prev[post.id] || 0) + 1 }));
     if (navigator.share) {
       try { await navigator.share({ title: post.title, text: post.content, url: window.location.href }); } catch { console.warn("Cancel share"); }
     } else { alert("Trình duyệt không hỗ trợ chia sẻ."); }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case "private": return <Lock size={14} className="text-gray-500" />;
      case "friends": return <Users size={14} className="text-gray-500" />;
      case "public": default: return <Globe size={14} className="text-gray-500" />;
    }
  };

  const filteredPosts = posts.filter((post) => {
    const searchLower = searchQuery.toLowerCase();
    const matchSearch =
      (post.title?.toLowerCase() || "").includes(searchLower) ||
      (post.content?.toLowerCase() || "").includes(searchLower) ||
      (post.user?.fullName?.toLowerCase() || "").includes(searchLower);

    return matchSearch;
  });

  const categories = [
    { id: "all", label: "Tất cả", count: posts.length },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-4">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-2">
                <Bookmark className="w-8 h-8 text-blue-500" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Bài viết đã lưu
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Bộ sưu tập những bài viết bạn đã lưu trữ.
              </p>
            </div>

            {/* Search and Filter */}
            <div className="mb-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm bài viết đã lưu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveFilter(category.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      activeFilter === category.id
                        ? "bg-blue-500 text-white"
                        : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"
                    }`}
                  >
                    {category.label} ({category.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Saved Posts Grid */}
            <div className="space-y-6">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600 border-solid"></div>
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="text-center py-12">
                  <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2 dark:text-gray-100">
                    Chưa có bài viết nào
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchQuery
                      ? "Không tìm thấy kết quả phù hợp"
                      : "Hãy lưu bài viết từ Bảng tin để xem lại tại đây"}
                  </p>
                </div>
              ) : (
                filteredPosts.map((post) => {
                  const authorAvatar = post.user?.avatar || anhmacdinh.src;
                  const authorName = post.user?.fullName || "Người dùng ẩn danh";
                  const savedDate = new Date(post.createdAt).toLocaleDateString("vi-VN");

                  return (
                    <div
                      key={post.id}
                      className="bg-white rounded-lg border border-gray-200 overflow-hidden dark:bg-gray-800 dark:border-gray-700 transition-shadow hover:shadow-md"
                    >
                      {/* Post Header */}
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Link href={`/profile?userId=${(post as any).user?.id}`}>
                              <img
                                src={authorAvatar}
                                alt={authorName}
                                className="w-10 h-10 rounded-full object-cover border"
                                onError={(e) => { e.currentTarget.src = anhmacdinh.src; }}
                              />
                            </Link>
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                {authorName}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Đăng ngày {savedDate}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full dark:bg-gray-700 dark:text-gray-300 capitalize">
                               {getVisibilityIcon(post.visibility)}
                              {post.visibility || "public"}
                            </span>
                            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors dark:hover:bg-gray-800">
                              <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Post Content */}
                      <div className="p-4">
                        <h2 className="font-semibold text-gray-900 mb-2 dark:text-gray-100 text-lg">
                          {post.title}
                        </h2>
                        <p className="text-gray-700 mb-4 dark:text-gray-300 line-clamp-3">
                          {post.content}
                        </p>

                        {post.image_url && (
                          <div className="mb-4">
                            <img
                              src={post.image_url}
                              alt={post.title}
                              className="w-full h-64 object-cover rounded-lg"
                              onError={(e) => { e.currentTarget.style.display = 'none' }}
                            />
                          </div>
                        )}
                        {post.video_url && (
                            <video controls className="w-full rounded-xl mb-4 border dark:border-gray-700 max-h-[300px] object-cover">
                                <source src={post.video_url} type="video/mp4" />
                            </video>
                        )}

                        {/* --- FOOTER ACTIONS (LIKE, COMMENT, SHARE) --- */}
                        <div className="flex flex-wrap justify-between items-center gap-2 text-gray-600 dark:text-gray-400 text-sm mt-4 border-t border-gray-200 dark:border-gray-700 pt-3">
                          <div className="flex items-center gap-4">
                              {/* 1. Component Likes */}
                              <Likes postId={post.id} type="post" />
                              
                              {/* 2. Nút Bình luận */}
                              <button 
                                onClick={() => setOpenCommentPost(openCommentPost === post.id ? null : post.id)} 
                                className="flex items-center gap-1 hover:text-blue-500 dark:hover:text-blue-400"
                              >
                                <MessageCircle size={18} />
                                <span>{commentCounts[post.id] || 0} Bình luận</span>
                              </button>

                              {/* 3. Nút Chia sẻ */}
                              <button 
                                onClick={() => handleShare(post)} 
                                className="flex items-center gap-1 hover:text-green-500 dark:hover:text-green-400"
                              >
                                <Share2 size={18} />
                                <span>{shareCounts[post.id] || 0} Chia sẻ</span>
                              </button>
                          </div>

                          {/* Nút Bỏ lưu */}
                          <div className="flex gap-2">
                            <button 
                                onClick={() => handleUnsave(post.id)}
                                title="Bỏ lưu bài viết này"
                                className="text-blue-500 hover:text-red-500 transition-colors flex items-center gap-1 group"
                            >
                              <Bookmark className="w-5 h-5 fill-current group-hover:hidden" />
                              <Trash2 className="w-5 h-5 hidden group-hover:block" />
                              <span className="text-sm font-medium group-hover:text-red-500">
                                Đã lưu
                              </span>
                            </button>
                          </div>
                        </div>

                        {/* --- KHUNG BÌNH LUẬN --- */}
                        {openCommentPost === post.id && (
                          <div className="mt-4 border-t pt-3 dark:border-gray-700">
                            <CommentForm 
                                postId={post.id} 
                                onCommentAdded={() => handleCommentAdded(post.id)} 
                            />
                          </div>
                        )}

                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}