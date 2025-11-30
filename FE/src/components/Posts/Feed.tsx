"use client";
import { useEffect, useState, useRef, useCallback } from "react";
// 1. Import Link từ next/link
import Link from "next/link"; 
import { MessageCircle, Share2, Globe, Users, Lock } from "lucide-react";
import CreatePosts from "./CreatePosts";
import anhmacdinh from "../../../image/anhmacdinh.jpg";
import type { Post } from "../../types";
import type { Comment as AppComment } from "../../types";
import { fetchAPI } from "@/lib/api";
import CommentForm from "./Comments";
import { getCommentsByPost } from "@/services/api";
import Likes from "./likes";

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [commentCounts, setCommentCounts] = useState<Record<number, number>>({});
  const [shareCounts, setShareCounts] = useState<Record<number, number>>({});
  const [openCommentPost, setOpenCommentPost] = useState<number | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  const limit = 5;

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case "private": return <Lock size={14} className="text-gray-500" />;
      case "friends": return <Users size={14} className="text-gray-500" />;
      case "public": default: return <Globe size={14} className="text-gray-500" />;
    }
  };

  const countAllComments = (list: AppComment[]): number => {
    if (!list) return 0;
    let total = 0;
    for (const c of list) {
      total += 1;
      if (c.children?.length) total += countAllComments(c.children);
    }
    return total;
  };

  const loadPosts = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetchAPI(`/post?page=${page}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = Array.isArray(res) ? { data: res, total: res.length } : res;
      const newPosts: Post[] = result.data as Post[];

      if (newPosts.length === 0) {
        setHasMore(false);
        return;
      }

      const fakeShares: Record<number, number> = {};
      const initialComments: Record<number, number> = {};

      await Promise.all(
        newPosts.map(async (p: Post) => {
          fakeShares[p.id] = Math.floor(Math.random() * 10);
          try {
            const list: AppComment[] = await getCommentsByPost(p.id);
            initialComments[p.id] = countAllComments(list);
          } catch {
            initialComments[p.id] = 0;
          }
        })
      );

      setPosts((prev) => {
        const existingIds = new Set(prev.map((p: Post) => p.id));
        const uniqueNew = newPosts.filter((p: Post) => !existingIds.has(p.id));
        return [...prev, ...uniqueNew];
      });

      setShareCounts((prev) => ({ ...prev, ...fakeShares }));
      setCommentCounts((prev) => ({ ...prev, ...initialComments }));
    } catch (err) {
      console.error("Lỗi tải bài viết:", err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [page, hasMore, loading]);

  useEffect(() => {
    loadPosts();
  }, [page]);

  const lastPostRef = useCallback(
    (node: HTMLLIElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  const handleShare = async (post: Post) => {
    setShareCounts((prev) => ({ ...prev, [post.id]: (prev[post.id] || 0) + 1, }));
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.content,
          url: window.location.href,
        });
      } catch { console.warn("Người dùng huỷ chia sẻ."); }
    } else { alert("Trình duyệt không hỗ trợ chia sẻ."); }
  };

  const handleCommentAdded = (postId: number) => {
    setCommentCounts((prev) => ({ ...prev, [postId]: (prev[postId] || 0) + 1, }));
  };

  return (
    <div className="mx-auto px-3 sm:px-6 lg:px-10 pt-2 pb-6 w-full max-w-[900px] xl:max-w-[1100px]">
      <CreatePosts posts={posts} setPosts={setPosts} />

      {posts.length === 0 && !loading ? (
        <p className="text-center text-gray-500 dark:text-gray-400">Chưa có bài viết nào.</p>
      ) : (
        <ul className="space-y-6">
          {posts.map((p, index) => {
            const isLast = index === posts.length - 1;
            
            // 2. TẠO URL DẠNG Query Parameter (?userId=...)
            // Nếu có user.id thì tạo link, nếu không thì fallback về trang chủ hoặc trang hiện tại
            const profileUrl = p.user?.id ? `/profile?userId=${p.user.id}` : "#";

            return (
              <li
                ref={isLast ? lastPostRef : null}
                key={`${p.id}-${p.createdAt}`}
                className="border rounded-2xl p-4 sm:p-6 shadow-sm bg-white hover:shadow-md transition-all dark:bg-gray-800 dark:border-gray-700"
              >
                {/* USER INFO */}
                <div className="flex items-center mb-3">
                  
                  {/* 3. Bọc Avatar bằng Link */}
                  <Link href={profileUrl} className="shrink-0 mr-3">
                    <img
                      src={p.user?.avatar || anhmacdinh.src}
                      alt="avatar"
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border dark:border-gray-700 hover:opacity-90 transition-opacity"
                      onError={(e) => { e.currentTarget.src = anhmacdinh.src; }}
                    />
                  </Link>

                  <div className="min-w-0">
                    {/* 4. Bọc Tên bằng Link */}
                    <Link href={profileUrl} className="hover:underline decoration-blue-500">
                        <h4 className="font-semibold text-gray-800 truncate dark:text-gray-100">
                        {p.user?.fullName || "Người dùng ẩn danh"}
                        </h4>
                    </Link>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>{new Date(p.createdAt).toLocaleString()}</span>
                      <span>•</span>
                      <div
                        title={
                          p.visibility === "public" ? "Công khai" : p.visibility === "friends" ? "Bạn bè" : "Chỉ mình tôi"
                        }
                        className="flex items-center"
                      >
                        {getVisibilityIcon(p.visibility)}
                      </div>
                    </div>

                  </div>
                </div>

                {/* POST CONTENT */}
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2 break-words dark:text-gray-100">
                  {p.title}
                </h3>
                <p className="text-gray-700 mb-3 whitespace-pre-line text-base sm:text-lg dark:text-gray-300">
                  {p.content}
                </p>

                {/* IMAGE SAFE CHECK */}
                {p.image_url && p.image_url.trim() !== "" && (
                  <img
                    src={p.image_url}
                    alt="post"
                    className="w-full rounded-xl mb-4 border max-h-[400px] sm:max-h-[500px] object-cover dark:border-gray-700"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                )}

                {/* VIDEO SAFE CHECK */}
                {p.video_url && p.video_url.trim() !== "" && (
                  <video
                    controls
                    className="w-full rounded-xl mb-4 border max-h-[400px] sm:max-h-[500px] object-cover dark:border-gray-700"
                  >
                    <source src={p.video_url} type="video/mp4" />
                  </video>
                )}

                {/* INTERACTION BAR */}
                <div className="flex flex-wrap justify-between items-center gap-2 text-gray-600 text-sm mt-4 border-t pt-3 dark:text-gray-300 dark:border-gray-700">
                  <Likes postId={p.id}  type="post"/>

                  <button
                    onClick={() => setOpenCommentPost(openCommentPost === p.id ? null : p.id)}
                    className="flex items-center gap-1 hover:text-blue-500 dark:hover:text-blue-400"
                  >
                    <MessageCircle size={18} />
                    <span>{commentCounts[p.id] || 0} Bình luận</span>
                  </button>

                  <button
                    onClick={() => handleShare(p)}
                    className="flex items-center gap-1 hover:text-green-500 dark:hover:text-green-400"
                  >
                    <Share2 size={18} />
                    <span>{shareCounts[p.id] || 0} Chia sẻ</span>
                  </button>
                </div>

                {/* COMMENT SECTION */}
                {openCommentPost === p.id && (
                  <div className="mt-4 border-t pt-3 dark:border-gray-700">
                    <CommentForm
                      postId={p.id}
                      onCommentAdded={() => handleCommentAdded(p.id)}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {loading && (
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600 border-solid"></div>
        </div>
      )}
    </div>
  );
}