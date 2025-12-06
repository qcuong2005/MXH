"use client";

import { useEffect, useState, useRef, useCallback, ClipboardEvent } from "react";
import {
  Send,
  CornerDownRight,
  ChevronDown,
  ChevronUp,
  Smile,
  X,
  Image as ImageIcon,
} from "lucide-react";
import type { Comment as AppComment } from "@/types";
import { createComment, getCommentsByPost } from "@/services/api";
import anhmacdinh from "../../../image/anhmacdinh.jpg";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import LikeComment from "./likecomments";
import { useSocket } from "../SocketContext";

interface CommentFormProps {
  postId: number;
  onCommentAdded?: () => void;
}

export default function CommentForm({ postId, onCommentAdded }: CommentFormProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<AppComment[]>([]);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyTarget, setReplyTarget] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());

  const [showMainEmojiPicker, setShowMainEmojiPicker] = useState(false);
  const [showReplyEmojiPicker, setShowReplyEmojiPicker] = useState(false);

  const [commentImage, setCommentImage] = useState<File | null>(null);
  const [commentPreview, setCommentPreview] = useState<string | null>(null);
  const [replyImage, setReplyImage] = useState<File | null>(null);
  const [replyPreview, setReplyPreview] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const replyInputRef = useRef<HTMLInputElement>(null);
  const mainInputRef = useRef<HTMLInputElement>(null);

  const { socket } = useSocket();

  const flattenToTwoLevels = (list: AppComment[]): AppComment[] =>
    list.map((c) => ({
      ...c,
      children: c.children
        ? c.children.flatMap((child) => [child, ...(child.children || [])])
        : [],
    }));

  const loadComments = useCallback(async () => {
    try {
      const data = await getCommentsByPost(postId);
      setComments(flattenToTwoLevels(data));
    } catch (err) {
      console.error("Lỗi tải bình luận:", err);
    }
  }, [postId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  useEffect(() => {
    if (!socket) return;
    const handleNewNotification = (notif: any) => {
      if (notif.type !== "NEW_COMMENT") return;
      let notifPostId = notif.resource_id;
      if (notif.resource_url && notif.resource_url.includes("/posts/")) {
        const parts = notif.resource_url.split("/");
        const idFromUrl = Number(parts[parts.length - 1]);
        if (!isNaN(idFromUrl)) notifPostId = idFromUrl;
      }
      if (Number(notifPostId) === Number(postId)) {
        loadComments();
        onCommentAdded?.();
      }
    };
    socket.on("new_notification", handleNewNotification);
    return () => {
      socket.off("new_notification", handleNewNotification);
    };
  }, [socket, postId, loadComments, onCommentAdded]);

  useEffect(() => {
    if (replyingTo && replyInputRef.current) {
      replyInputRef.current.focus();
    }
  }, [replyingTo]);

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
        replyText.substring(0, start) + emojiData.emoji + replyText.substring(end);
      setReplyText(newReplyText);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !commentImage) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Bạn cần đăng nhập để bình luận.");
        return;
      }
      const newComment = await createComment(
        token,
        postId,
        content.trim(),
        undefined,
        commentImage
      );
      (newComment as any)._isNew = true;
      setComments((prev) => [newComment, ...prev]);
      setContent("");
      setCommentImage(null);
      if (commentPreview) URL.revokeObjectURL(commentPreview);
      setCommentPreview(null);
      onCommentAdded?.();
      setTimeout(() => {
        setComments((prev) => prev.map((c) => ({ ...c, _isNew: false })));
      }, 800);
    } catch (err) {
      console.error("Lỗi gửi bình luận:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReplySubmit = async () => {
    if (!replyingTo || (!replyText.trim() && !replyImage)) return;
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Bạn cần đăng nhập để trả lời.");
      return;
    }
    setLoading(true);
    try {
      const fullText = replyTarget ? `@${replyTarget}: ${replyText}` : replyText;
      const newReply = await createComment(
        token,
        postId,
        fullText,
        replyingTo,
        replyImage
      );
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
      if (replyPreview) URL.revokeObjectURL(replyPreview);
      setReplyPreview(null);
      setReplyImage(null);
      onCommentAdded?.();
      setTimeout(() => {
        setComments((prev) =>
          prev.map((c) => ({
            ...c,
            children: c.children?.map((ch) => ({ ...ch, _isNew: false })) || [],
          }))
        );
      }, 800);
    } catch (err) {
      console.error("Lỗi gửi phản hồi:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleReply = (commentId: number, fullName: string) => {
    setShowReplyEmojiPicker(false);
    if (replyingTo === commentId) {
      setReplyingTo(null);
      setReplyTarget(null);
      setReplyText("");
      if (replyPreview) URL.revokeObjectURL(replyPreview);
      setReplyPreview(null);
      setReplyImage(null);
    } else {
      setReplyingTo(commentId);
      setReplyTarget(fullName);
      setReplyText("");
      if (replyPreview) URL.revokeObjectURL(replyPreview);
      setReplyPreview(null);
      setReplyImage(null);
    }
  };

  const toggleCollapse = (id: number) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const renderCommentMedia = (imageUrl?: string | null) => {
    if (!imageUrl) return null;
    return (
      <img
        src={imageUrl}
        alt="comment-attachment"
        className="mt-2 max-h-48 rounded-lg border dark:border-gray-700 object-cover cursor-pointer hover:opacity-90 transition-opacity"
        onClick={() => setPreviewImage(imageUrl)}
      />
    );
  };

  const handlePasteImage = (
    e: ClipboardEvent<HTMLInputElement>,
    target: "comment" | "reply"
  ) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const blob = item.getAsFile();
        if (!blob) continue;
        e.preventDefault();
        const ext = blob.type.split("/")[1] || "png";
        const file = new File([blob], `paste-${Date.now()}.${ext}`, {
          type: blob.type,
        });
        if (target === "comment") {
          if (commentPreview) URL.revokeObjectURL(commentPreview);
          setCommentImage(file);
          setCommentPreview(URL.createObjectURL(file));
        } else {
          if (replyPreview) URL.revokeObjectURL(replyPreview);
          setReplyImage(file);
          setReplyPreview(URL.createObjectURL(file));
        }
        break;
      }
    }
  };

  const renderCommentText = (text?: string | null) => {
    if (!text) return null;
    if (text.startsWith("@")) {
      const [first, ...rest] = text.split(":");
      return (
        <p className="text-gray-700 text-sm whitespace-pre-line dark:text-gray-300">
          <span className="text-blue-600 font-medium">{first}:</span>{" "}
          {rest.join(":").trim()}
        </p>
      );
    }
    return (
      <p className="text-gray-700 text-sm whitespace-pre-line dark:text-gray-300">
        {text}
      </p>
    );
  };

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
                {renderCommentText(c.content)}
                {renderCommentMedia(c.image_url)}
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-1 dark:text-gray-400">
                  <LikeComment commentId={c.id} />
                  <button
                    onClick={() => toggleReply(c.id, c.user.fullName || "")}
                    className="flex items-center gap-1 hover:text-blue-500 dark:hover:text-blue-400"
                  >
                    <CornerDownRight size={14} /> Trả lời
                  </button>
                  <span>{new Date(c.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {replyingTo === c.id && (
              <div className="ml-10 mt-2 relative">
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    ref={replyInputRef}
                    type="text"
                    placeholder={`Phản hồi ${replyTarget}...`}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onPaste={(e) => handlePasteImage(e, "reply")}
                    className="border rounded-full px-3 py-1 w-full md:w-3/4 focus:ring-2 focus:ring-blue-400 text-sm dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
                  />
                  <label
                    htmlFor={`reply-image-${c.id}`}
                    className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-blue-600 cursor-pointer p-1 rounded-lg hover:bg-gray-100 transition-colors dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    <ImageIcon size={16} />
                    Ảnh
                  </label>
                  <input
                    id={`reply-image-${c.id}`}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setReplyImage(file);
                      if (replyPreview) URL.revokeObjectURL(replyPreview);
                      setReplyPreview(file ? URL.createObjectURL(file) : null);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowReplyEmojiPicker((prev) => !prev)}
                    className="text-gray-500 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400"
                  >
                    <Smile size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={handleReplySubmit}
                    className="bg-blue-500 text-white px-3 py-1 text-sm rounded-full hover:bg-blue-600 flex items-center"
                  >
                    <Send size={14} />
                  </button>
                </div>
                {replyPreview && (
                  <div className="mt-2 flex items-center gap-2">
                    <img
                      src={replyPreview}
                      alt="reply-preview"
                      className="w-16 h-16 object-cover rounded-lg border dark:border-gray-700"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (replyPreview) URL.revokeObjectURL(replyPreview);
                        setReplyPreview(null);
                        setReplyImage(null);
                      }}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
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
                          {child.user.fullName}
                        </div>
                        {renderCommentText(child.content)}
                        {renderCommentMedia(child.image_url)}
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 dark:text-gray-400">
                          <LikeComment commentId={child.id} />
                          <button
                            onClick={() =>
                              toggleReply(child.id, child.user.fullName || "")
                            }
                            className="flex items-center gap-1 hover:text-blue-500 dark:hover:text-blue-400"
                          >
                            <CornerDownRight size={13} /> Trả lời
                          </button>
                          <span>{new Date(child.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {replyingTo === child.id && (
                      <div className="ml-8 mt-2 relative">
                        <div className="flex items-center gap-2 flex-wrap">
                          <input
                            ref={replyInputRef}
                            type="text"
                            placeholder={`Phản hồi ${replyTarget}...`}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onPaste={(e) => handlePasteImage(e, "reply")}
                            className="border rounded-full px-3 py-1 w-full md:w-3/4 focus:ring-2 focus:ring-blue-400 text-sm dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
                          />
                          <label
                            htmlFor={`reply-child-image-${child.id}`}
                            className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-blue-600 cursor-pointer p-1 rounded-lg hover:bg-gray-100 transition-colors dark:text-gray-300 dark:hover:bg-gray-800"
                          >
                            <ImageIcon size={16} />
                            Ảnh
                          </label>
                          <input
                            id={`reply-child-image-${child.id}`}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              setReplyImage(file);
                              if (replyPreview) URL.revokeObjectURL(replyPreview);
                              setReplyPreview(file ? URL.createObjectURL(file) : null);
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowReplyEmojiPicker((prev) => !prev)}
                            className="text-gray-500 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400"
                          >
                            <Smile size={18} />
                          </button>
                          <button
                            type="button"
                            onClick={handleReplySubmit}
                            className="bg-blue-500 text-white px-3 py-1 text-sm rounded-full hover:bg-blue-600 flex items-center"
                          >
                            <Send size={14} />
                          </button>
                        </div>
                        {replyPreview && (
                          <div className="mt-2 flex items-center gap-2">
                            <img
                              src={replyPreview}
                              alt="reply-preview"
                              className="w-16 h-16 object-cover rounded-lg border dark:border-gray-700"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (replyPreview) URL.revokeObjectURL(replyPreview);
                                setReplyPreview(null);
                                setReplyImage(null);
                              }}
                              className="text-gray-500 hover:text-red-500"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        )}
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
                        <ChevronDown size={13} /> Hiện thêm {c.children.length - 2} phản hồi
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
      <div className="relative">
        <form onSubmit={handleSubmit} className="flex items-center gap-2 flex-wrap">
          <input
            ref={mainInputRef}
            type="text"
            placeholder="Viết bình luận..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onPaste={(e) => handlePasteImage(e, "comment")}
            className="border rounded-full px-3 py-1 w-full focus:ring-2 focus:ring-blue-400 text-sm dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
          />
          <label
            htmlFor="comment-image"
            className="flex items-center gap-1 text-gray-500 hover:text-blue-600 cursor-pointer p-1 rounded-lg hover:bg-gray-100 transition-colors dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <ImageIcon size={18} />
          </label>
          <input
            id="comment-image"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              setCommentImage(file);
              if (commentPreview) URL.revokeObjectURL(commentPreview);
              setCommentPreview(file ? URL.createObjectURL(file) : null);
            }}
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
            <EmojiPicker onEmojiClick={onMainEmojiClick} height={350} lazyLoadEmojis />
          </div>
        )}
      </div>

      {commentPreview && (
        <div className="mt-2 flex items-center gap-2">
          <img
            src={commentPreview}
            alt="comment-preview"
            className="w-16 h-16 object-cover rounded-lg border dark:border-gray-700"
          />
          <button
            type="button"
            onClick={() => {
              if (commentPreview) URL.revokeObjectURL(commentPreview);
              setCommentPreview(null);
              setCommentImage(null);
            }}
            className="text-gray-500 hover:text-red-500"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="mt-3 border-t pt-3 dark:border-gray-700">
        {renderComments(comments)}
      </div>

      {previewImage && (
        <div
          className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-5 right-5 text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <X size={22} />
          </button>
          <img
            src={previewImage}
            alt="Preview"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
