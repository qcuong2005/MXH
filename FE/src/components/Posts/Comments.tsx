"use client";
import { useEffect, useState, useRef } from "react";
import {
  Send,
  CornerDownRight,
  ChevronDown,
  ChevronUp,
  Smile,
  X,
} from "lucide-react";
import type { Comment as AppComment } from "@/types";
import { createComment, getCommentsByPost } from "@/services/api";
import anhmacdinh from "../../../image/anhmacdinh.jpg";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import LikeComment from "./likecomments";

interface CommentFormProps {
  postId: number;
  onCommentAdded?: () => void;
}

export default function CommentForm({
  postId,
  onCommentAdded,
}: CommentFormProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<AppComment[]>([]);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyTarget, setReplyTarget] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());

  // Đã xóa state showComments vì không cần dùng nữa

  const [showMainEmojiPicker, setShowMainEmojiPicker] = useState(false);
  const [showReplyEmojiPicker, setShowReplyEmojiPicker] = useState(false);

  const replyInputRef = useRef<HTMLInputElement>(null);
  const mainInputRef = useRef<HTMLInputElement>(null);

  // ===== Load comments =====
  useEffect(() => {
    async function loadComments() {
      try {
        const data = await getCommentsByPost(postId);
        const flattenToTwoLevels = (list: AppComment[]): AppComment[] =>
          list.map((c) => ({
            ...c,
            children: c.children
              ? c.children.flatMap((child) => [
                  child,
                  ...(child.children || []),
                ])
              : [],
          }));
        setComments(flattenToTwoLevels(data));
      } catch (err) {
        console.error("Lỗi tải bình luận:", err);
      }
    }
    loadComments();
  }, [postId]);

  // ===== Auto focus khi reply =====
  useEffect(() => {
    if (replyingTo && replyInputRef.current) {
      replyInputRef.current.focus();
    }
  }, [replyingTo]);

  // ===== Click outside to close picker =====
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const picker = document.querySelector(".emoji-picker-react");
      if (picker && !picker.contains(e.target as Node)) {
        setShowMainEmojiPicker(false);
        setShowReplyEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ===== Xử lý chèn Emoji =====
  const onMainEmojiClick = (emojiData: EmojiClickData) => {
    const ref = mainInputRef.current;
    if (ref) {
      ref.focus();
      const start = ref.selectionStart || 0;
      const end = ref.selectionEnd || 0;
      const newContent =
        content.substring(0, start) + emojiData.emoji + content.substring(end);
      setContent(newContent);
    }
  };

  const onReplyEmojiClick = (emojiData: EmojiClickData) => {
    const ref = replyInputRef.current;
    if (ref) {
      ref.focus();
      const start = ref.selectionStart || 0;
      const end = ref.selectionEnd || 0;
      const newReplyText =
        replyText.substring(0, start) +
        emojiData.emoji +
        replyText.substring(end);
      setReplyText(newReplyText);
    }
  };

  // ===== Gửi bình luận gốc =====
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("Bạn cần đăng nhập để bình luận.");
      const newComment = await createComment(token, postId, content.trim());
      (newComment as any)._isNew = true;
      setComments((prev) => [newComment, ...prev]);
      setContent("");
      onCommentAdded?.();
      setTimeout(() => {
        setComments((prev) => prev.map((c) => ({ ...c, _isNew: false })));
      }, 1000);
    } catch (err) {
      console.error("Lỗi gửi bình luận:", err);
    } finally {
      setLoading(false);
    }
  };

  // ===== Gửi phản hồi =====
  const handleReplySubmit = async () => {
    if (!replyingTo || !replyText.trim()) return;
    const token = localStorage.getItem("token");
    if (!token) return alert("Bạn cần đăng nhập để trả lời.");
    setLoading(true);
    try {
      const fullText = replyTarget ? `@${replyTarget}: ${replyText}` : replyText;
      const newReply = await createComment(token, postId, fullText, replyingTo);
      (newReply as any)._isNew = true;
      setComments((prev) =>
        prev.map((c) => {
          if (c.id === replyingTo) {
            return { ...c, children: [...(c.children || []), newReply] };
          }
          const childIndex = c.children?.findIndex((ch) => ch.id === replyingTo);
          if (childIndex !== undefined && childIndex !== -1 && c.children) {
            const updated = [...c.children];
            updated.splice(childIndex + 1, 0, newReply);
            return { ...c, children: updated };
          }
          return c;
        })
      );
      setReplyingTo(null);
      setReplyTarget(null);
      setReplyText("");
      onCommentAdded?.();
      setTimeout(() => {
        setComments((prev) =>
          prev.map((c) => ({
            ...c,
            children: c.children?.map((ch) => ({ ...ch, _isNew: false })) || [],
          }))
        );
      }, 1000);
    } catch (err) {
      console.error("Lỗi gửi phản hồi:", err);
    } finally {
      setLoading(false);
    }
  };

  // ===== Toggle =====
  const toggleReply = (commentId: number, fullName: string) => {
    setShowReplyEmojiPicker(false);
    if (replyingTo === commentId) {
      setReplyingTo(null);
      setReplyTarget(null);
      setReplyText("");
    } else {
      setReplyingTo(commentId);
      setReplyTarget(fullName);
      setReplyText("");
    }
  };

  const toggleCollapse = (id: number) => {
    setCollapsed((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  // Đã xóa hàm toggleShowComments

  // ===== Render Comments =====
  const renderComments = (list: AppComment[]) => (
    <div className="space-y-4">
      {list.map((c) => {
        const isCollapsed = collapsed.has(c.id);
        const visibleChildren =
          c.children && isCollapsed ? c.children.slice(0, 2) : c.children;
        return (
          <div
            key={`parent-${c.id}`}
            className={`border-b pb-3 transition-all duration-700 dark:border-gray-700 ${
              (c as any)._isNew ? "animate-fadeSlide" : ""
            }`}
          >
            <div className="flex items-start gap-2 mb-2">
              <img
                src={c.user.avatar || anhmacdinh.src}
                alt="avatar"
                className={`w-9 h-9 rounded-full object-cover border dark:border-gray-700 ${
                  (c as any)._isNew ? "animate-ping-avatar" : ""
                }`}
              />
              <div className="flex-1">
                <div className="font-medium text-gray-800 dark:text-gray-100">
                  {c.user.fullName}
                </div>
                <p className="text-gray-700 text-sm whitespace-pre-line dark:text-gray-300">
                  {c.content.startsWith("@") ? (
                    <>
                      <span className="text-blue-600 font-medium">
                        {c.content.split(":")[0]}:
                      </span>{" "}
                      {c.content.split(":").slice(1).join(":").trim()}
                    </>
                  ) : (
                    c.content
                  )}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-1 dark:text-gray-400">
                  <LikeComment commentId={c.id} />
                  <button
                    onClick={() => toggleReply(c.id, c.user.username)}
                    className="flex items-center gap-1 hover:text-blue-500 dark:hover:text-blue-400"
                  >
                    <CornerDownRight size={14} /> Trả lời
                  </button>
                  <span>{new Date(c.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* ===== FORM TRẢ LỜI CẤP 1 ===== */}
            {replyingTo === c.id && (
              <div className="ml-10 mt-2 relative">
                <div className="flex items-center">
                  <input
                    ref={replyInputRef}
                    type="text"
                    placeholder={`Phản hồi ${replyTarget}...`}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="border rounded-full px-3 py-1 w-3/4 focus:ring-2 focus:ring-blue-400 text-sm dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowReplyEmojiPicker((prev) => !prev)}
                    className="ml-2 text-gray-500 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400"
                  >
                    <Smile size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={handleReplySubmit}
                    className="ml-1 bg-blue-500 text-white px-3 py-1 text-sm rounded-full hover:bg-blue-600 flex items-center"
                  >
                    <Send size={14} />
                  </button>
                </div>
                {showReplyEmojiPicker && replyingTo === c.id && (
                  <div className="absolute z-10 mt-2 bg-white border rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex justify-end">
                      <button
                        onClick={() => setShowReplyEmojiPicker(false)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <EmojiPicker
                      onEmojiClick={onReplyEmojiClick}
                      height={300}
                      lazyLoadEmojis
                    />
                  </div>
                )}
              </div>
            )}

            {/* CHILD COMMENTS */}
            {c.children && c.children.length > 0 && (
              <div className="ml-12 mt-2 space-y-3">
                {visibleChildren?.map((child) => (
                  <div
                    key={`child-${child.id}-of-${c.id}`}
                    className={`flex flex-col transition-all duration-700 ${
                      (child as any)._isNew ? "animate-fadeSlide" : ""
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <img
                        src={child.user.avatar || anhmacdinh.src}
                        alt="avatar"
                        className={`w-8 h-8 rounded-full object-cover border dark:border-gray-700 ${
                          (child as any)._isNew ? "animate-ping-avatar" : ""
                        }`}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-800 text-sm dark:text-gray-100">
                          {child.user.username}
                        </div>
                        <p className="text-gray-700 text-sm whitespace-pre-line dark:text-gray-300">
                          {child.content.startsWith("@") ? (
                            <>
                              <span className="text-blue-600 font-medium">
                                {child.content.split(":")[0]}:
                              </span>{" "}
                              {child.content
                                .split(":")
                                .slice(1)
                                .join(":")
                                .trim()}
                            </>
                          ) : (
                            child.content
                          )}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 dark:text-gray-400">
                          <LikeComment commentId={child.id} />
                          <button
                            onClick={() =>
                              toggleReply(child.id, child.user.username)
                            }
                            className="flex items-center gap-1 hover:text-blue-500 dark:hover:text-blue-400"
                          >
                            <CornerDownRight size={13} /> Trả lời
                          </button>
                          <span>
                            {new Date(child.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* FORM TRẢ LỜI CẤP 2 */}
                    {replyingTo === child.id && (
                      <div className="ml-8 mt-2 relative">
                        <div className="flex items-center">
                          <input
                            ref={replyInputRef}
                            type="text"
                            placeholder={`Phản hồi ${replyTarget}...`}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="border rounded-full px-3 py-1 w-3/4 focus:ring-2 focus:ring-blue-400 text-sm dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowReplyEmojiPicker((prev) => !prev)
                            }
                            className="ml-2 text-gray-500 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400"
                          >
                            <Smile size={18} />
                          </button>
                          <button
                            type="button"
                            onClick={handleReplySubmit}
                            className="ml-1 bg-blue-500 text-white px-3 py-1 text-sm rounded-full hover:bg-blue-600 flex items-center"
                          >
                            <Send size={14} />
                          </button>
                        </div>
                        {showReplyEmojiPicker && replyingTo === child.id && (
                          <div className="absolute z-10 mt-2 bg-white border rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700">
                            <div className="flex justify-end">
                              <button
                                onClick={() => setShowReplyEmojiPicker(false)}
                                className="p-1 text-gray-400 hover:text-red-500"
                              >
                                <X size={16} />
                              </button>
                            </div>
                            <EmojiPicker
                              onEmojiClick={onReplyEmojiClick}
                              height={300}
                              lazyLoadEmojis
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {c.children.length > 2 && (
                  <button
                    onClick={() => toggleCollapse(c.id)}
                    className="ml-10 mt-1 text-blue-600 text-xs flex items-center gap-1"
                  >
                    {isCollapsed ? (
                      <>
                        <ChevronDown size={13} /> Hiện thêm{" "}
                        {c.children.length - 2} phản hồi
                      </>
                    ) : (
                      <>
                        <ChevronUp size={13} /> Ẩn bớt phản hồi
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="mt-4">
      {/* Ô nhập bình luận */}
      <div className="relative">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            ref={mainInputRef}
            type="text"
            placeholder="Viết bình luận..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="border rounded-full px-3 py-1 w-full focus:ring-2 focus:ring-blue-400 text-sm dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
          />
          <button
            type="button"
            onClick={() => setShowMainEmojiPicker((prev) => !prev)}
            className="text-gray-500 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400"
          >
            <Smile size={20} />
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-3 py-1 text-sm rounded-full hover:bg-blue-600 flex items-center"
          >
            <Send size={16} />
          </button>
        </form>

        {/* Picker Emoji cho bình luận chính */}
        {showMainEmojiPicker && (
          <div className="absolute z-10 mt-2 right-0 bg-white border rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700">
            <div className="flex justify-end">
              <button
                onClick={() => setShowMainEmojiPicker(false)}
                className="p-1 text-gray-400 hover:text-red-500"
              >
                <X size={16} />
              </button>
            </div>
            <EmojiPicker
              onEmojiClick={onMainEmojiClick}
              height={350}
              lazyLoadEmojis
            />
          </div>
        )}
      </div>

      {/* Hiển thị bình luận luôn luôn, không cần nút bấm */}
      <div className="mt-3 border-t pt-3 dark:border-gray-700">
        {renderComments(comments)}
      </div>
    </div>
  );
}