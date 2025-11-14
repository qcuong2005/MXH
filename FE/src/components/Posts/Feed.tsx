"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { MessageCircle, Share2 } from "lucide-react";
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

  const limit = 5; // 👈 Số bài viết mỗi lần tải

  // 🔹 Đếm tất cả comment + reply
  const countAllComments = (list: AppComment[]): number => {
    let total = 0;
    for (const c of list) {
      total += 1;
      if (c.children?.length) total += countAllComments(c.children);
    }
    return total;
  };

  // 🔹 Load bài viết (theo phân trang)
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

      // ✅ Nếu hết bài → dừng
      if (newPosts.length === 0) {
        setHasMore(false);
        return;
      }

      // Tạo fake share count + đếm comment
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

      // ✅ Gộp bài viết mới, loại trùng key
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

  // 🔹 Load trang đầu tiên
  useEffect(() => {
    loadPosts();
  }, [page]);

  // 🔹 Quan sát bài viết cuối để load thêm khi chạm màn hình
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

  // 🔹 Xử lý chia sẻ
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
        console.warn("Người dùng huỷ chia sẻ.");
      }
    } else {
      alert("Trình duyệt của bạn không hỗ trợ chia sẻ.");
    }
  };

  const handleCommentAdded = (postId: number) => {
    setCommentCounts((prev) => ({
      ...prev,
      [postId]: (prev[postId] || 0) + 1,
    }));
  };

  // 🧠 Hiển thị
  return (
    <div className="mx-auto px-3 sm:px-6 lg:px-10 pt-2 pb-6 w-full max-w-[900px] xl:max-w-[1100px]">
      <CreatePosts posts={posts} setPosts={setPosts} />

      {posts.length === 0 && !loading ? (
        <p className="text-center text-gray-500 dark:text-gray-400">Chưa có bài viết nào.</p>
      ) : (
        <ul className="space-y-6">
          {posts.map((p, index) => {
            const isLast = index === posts.length - 1;
            return (
              <li
                ref={isLast ? lastPostRef : null}
                key={`${p.id}-${p.createdAt}`}
                className="border rounded-2xl p-4 sm:p-6 shadow-sm bg-white hover:shadow-md transition-all dark:bg-gray-800 dark:border-gray-700"
              >
                {/* USER INFO */}
                <div className="flex items-center mb-3">
                  <img
                    src={p.user?.avatar || anhmacdinh.src}
                    alt="avatar"
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover mr-3 border dark:border-gray-700"
                  />
                  <div className="min-w-0">
                    <h4 className="font-semibold text-gray-800 truncate dark:text-gray-100">
                      {p.user?.fullName || "Người dùng ẩn danh"}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(p.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* POST CONTENT */}
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2 break-words dark:text-gray-100">
                  {p.title}
                </h3>
                <p className="text-gray-700 mb-3 whitespace-pre-line text-base sm:text-lg dark:text-gray-300">
                  {p.content}
                </p>

                {p.image_url && (
                  <img
                    src={p.image_url}
                    alt="post"
                    className="w-full rounded-xl mb-4 border max-h-[400px] sm:max-h-[500px] object-cover dark:border-gray-700"
                  />
                )}

                {p.video_url && (
                  <video
                    controls
                    className="w-full rounded-xl mb-4 border max-h-[400px] sm:max-h-[500px] object-cover dark:border-gray-700"
                  >
                    <source src={p.video_url} type="video/mp4" />
                  </video>
                )}

                {/* INTERACTION BAR */}
                <div className="flex flex-wrap justify-between items-center gap-2 text-gray-600 text-sm mt-4 border-t pt-3 dark:text-gray-300 dark:border-gray-700">
                  <Likes postId={p.id} />

                  <button
                    onClick={() =>
                      setOpenCommentPost(openCommentPost === p.id ? null : p.id)
                    }
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

      {/* Loading animation */}
      {loading && (
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600 border-solid"></div>
        </div>
      )}
    </div>
  );
}
