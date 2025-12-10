"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, FileText, User, Share2, MessageCircle, Search, Bookmark } from "lucide-react"; // Thêm Bookmark
import { fetchAPI } from "@/lib/api";
import { getMySavedPosts, toggleSavePost } from "@/services/save"; // Import API Save
import Header from "@/components/Header"; 
import Sidebar from "@/components/Sidebar"; 
import anhmacdinh from "../../../image/anhmacdinh.jpg"; 
import type { Post, Comment as AppComment } from "@/types";
import Likes from "@/components/Posts/likes";
import CommentForm from "@/components/Posts/Comments";
import { getCommentsByPost } from "@/services/api";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  
  const [loading, setLoading] = useState(true);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);

  // --- STATE CHO TƯƠNG TÁC (Comment/Share/Save) ---
  const [commentCounts, setCommentCounts] = useState<Record<number, number>>({});
  const [openCommentPost, setOpenCommentPost] = useState<number | null>(null);
  const [shareCounts, setShareCounts] = useState<Record<number, number>>({});
  
  // State quản lý bài viết đã lưu
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());

  // Helper đếm tổng comment
  const countAllComments = (list: AppComment[]): number => {
    if (!list) return 0;
    let total = 0;
    for (const c of list) {
      total += 1;
      if (c.children?.length) total += countAllComments(c.children);
    }
    return total;
  };

  // --- HÀM XỬ LÝ LƯU BÀI VIẾT (Copy từ Feed.tsx) ---
  const handleSavePost = async (post: Post) => {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Bạn cần đăng nhập để lưu bài viết.");
        return;
    }

    const isSaved = savedIds.has(post.id);

    // 1. Optimistic Update (Cập nhật UI ngay lập tức)
    setSavedIds((prev) => {
        const next = new Set(prev);
        if (isSaved) next.delete(post.id);
        else next.add(post.id);
        return next;
    });

    try {
        // 2. Gọi API server
        const result = await toggleSavePost(token, post.id);

        // 3. Đồng bộ lại state nếu cần (Optional)
        if (result && typeof result.saved === 'boolean') {
             setSavedIds((prev) => {
                const next = new Set(prev);
                if (result.saved) next.add(post.id);
                else next.delete(post.id);
                return next;
             });
        }
    } catch (error) {
        console.error("Lỗi lưu bài viết:", error);
        // 4. Nếu lỗi, hoàn tác UI
        setSavedIds((prev) => {
            const next = new Set(prev);
            if (isSaved) next.add(post.id);
            else next.delete(post.id);
            return next;
        });
    }
  };

  // --- XỬ LÝ SHARE ---
  const handleShare = async (post: Post) => {
    setShareCounts((prev) => ({ ...prev, [post.id]: (prev[post.id] || 0) + 1 }));
    if (navigator.share) {
      try { 
          await navigator.share({ title: post.title, text: post.content, url: window.location.href }); 
      } catch { console.warn("Cancel share"); }
    } else { 
        alert("Đã sao chép liên kết!");
    }
  };

  const handleCommentAdded = (postId: number) => {
    setCommentCounts((prev) => ({ ...prev, [postId]: (prev[postId] || 0) + 1 }));
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      setLoading(true);
      try {
        // --- 1. TẢI DANH SÁCH BÀI ĐÃ LƯU (Để hiển thị trạng thái nút Save) ---
        const savedRes = await getMySavedPosts(token);
        const savedList = Array.isArray(savedRes) ? savedRes : (savedRes.data || []);
        const ids = new Set<number>(savedList.map((post: Post) => post.id));
        setSavedIds(ids);

        // --- 2. TẢI DỮ LIỆU TÌM KIẾM ---
        const res = await fetchAPI("/post?page=1&limit=100", {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const allPosts = Array.isArray(res) ? res : (res.data || []);
        const searchLower = query.toLowerCase();

        // Lọc Bài viết
        const postsResult = allPosts.filter((p: Post) => 
            (p.content?.toLowerCase() || "").includes(searchLower) ||
            (p.title?.toLowerCase() || "").includes(searchLower)
        );

        // Lọc Người dùng
        const uniqueUsersMap = new Map();
        allPosts.forEach((p: Post) => {
            if (p.user && p.user.id && !uniqueUsersMap.has(p.user.id)) {
                uniqueUsersMap.set(p.user.id, p.user);
            }
        });
        const allUsers = Array.from(uniqueUsersMap.values());
        const usersResult = allUsers.filter((u: any) => 
            (u.fullName?.toLowerCase() || "").includes(searchLower) ||
            (u.username?.toLowerCase() || "").includes(searchLower)
        );

        setFilteredPosts(postsResult);
        setFilteredUsers(usersResult);

        // --- 3. LẤY COMMENT & SHARE MOCK DATA ---
        const commentData: Record<number, number> = {};
        const shareData: Record<number, number> = {};

        await Promise.all(
            postsResult.map(async (p: Post) => {
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

      } catch (error) {
        console.error("Lỗi tìm kiếm:", error);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
        fetchData();
    }
  }, [query]);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar /> 
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header /> 

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
                    Kết quả tìm kiếm cho: "{query}"
                </h1>

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
                                    {filteredUsers.map(user => (
                                        <Link href={`/profile?userId=${user.id}`} key={user.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition">
                                            <img 
                                                src={user.avatar || anhmacdinh.src} 
                                                className="w-14 h-14 rounded-full object-cover border-2 border-gray-100"
                                                onError={(e) => e.currentTarget.src = anhmacdinh.src}
                                            />
                                            <div>
                                                <p className="font-bold text-lg text-gray-900 dark:text-white">{user.fullName}</p>
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
                                {filteredPosts.map(post => {
                                    const isSaved = savedIds.has(post.id); // Kiểm tra trạng thái đã lưu

                                    return (
                                        <div key={post.id} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition">
                                            {/* Header bài viết */}
                                            <div className="flex gap-3 mb-3">
                                                <Link href={`/profile?userId=${post.user?.id}`}>
                                                    <img 
                                                        src={post.user?.avatar || anhmacdinh.src} 
                                                        className="w-10 h-10 rounded-full object-cover"
                                                        onError={(e) => e.currentTarget.src = anhmacdinh.src}
                                                    />
                                                </Link>
                                                <div>
                                                    <Link href={`/profile?userId=${post.user?.id}`}>
                                                        <p className="font-semibold text-sm text-gray-900 dark:text-white hover:underline">
                                                            {post.user?.fullName}
                                                        </p>
                                                    </Link>
                                                    <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>

                                            {/* Nội dung bài viết */}
                                            <Link href={`/post/${post.id}`}>
                                                <h3 className="font-bold text-lg mb-2 hover:text-indigo-600 transition dark:text-gray-100">{post.title}</h3>
                                                <p className="text-gray-600 dark:text-gray-300 line-clamp-3 mb-3 whitespace-pre-line">
                                                    {post.content}
                                                </p>
                                                {post.image_url && (
                                                    <img src={post.image_url} className="rounded-lg max-h-[400px] object-cover w-full border dark:border-gray-700" />
                                                )}
                                            </Link>

                                            {/* --- Footer Actions (Like, Comment, Share, SAVE) --- */}
                                            <div className="flex flex-wrap justify-between items-center gap-2 text-gray-600 dark:text-gray-400 text-sm mt-4 pt-3 border-t dark:border-gray-700">
                                                <div className="flex items-center gap-4">
                                                    {/* 1. Like */}
                                                    <Likes postId={post.id} type="post" />

                                                    {/* 2. Comment */}
                                                    <button 
                                                        onClick={() => setOpenCommentPost(openCommentPost === post.id ? null : post.id)}
                                                        className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
                                                    >
                                                        <MessageCircle className="w-5 h-5" /> 
                                                        <span>{commentCounts[post.id] || 0} Bình luận</span>
                                                    </button>

                                                    {/* 3. Share */}
                                                    <button 
                                                        onClick={() => handleShare(post)}
                                                        className="flex items-center gap-1 hover:text-green-600 transition-colors"
                                                    >
                                                        <Share2 className="w-5 h-5" />
                                                        <span>{shareCounts[post.id] || 0} Chia sẻ</span>
                                                    </button>
                                                </div>

                                                {/* 4. SAVE BUTTON */}
                                                <button
                                                    onClick={() => handleSavePost(post)}
                                                    className={`flex items-center gap-1 transition-colors ${
                                                        isSaved 
                                                        ? "text-yellow-500 hover:text-yellow-600" 
                                                        : "text-gray-500 hover:text-yellow-500 dark:text-gray-400"
                                                    }`}
                                                    title={isSaved ? "Bỏ lưu" : "Lưu bài viết"}
                                                >
                                                    <Bookmark className="w-5 h-5" fill={isSaved ? "currentColor" : "none"} />
                                                    <span className="hidden sm:inline">{isSaved ? "Đã lưu" : "Lưu"}</span>
                                                </button>
                                            </div>

                                            {/* --- Khung Bình Luận --- */}
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

                        {/* === KHÔNG TÌM THẤY === */}
                        {filteredPosts.length === 0 && filteredUsers.length === 0 && (
                            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                                <div className="bg-gray-100 dark:bg-gray-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="w-10 h-10 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Không tìm thấy kết quả</h3>
                                <p className="text-gray-500 mt-2">Chúng tôi không tìm thấy kết quả nào cho "{query}".</p>
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