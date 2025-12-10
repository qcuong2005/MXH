"use client";

import { useEffect, useState, useRef, useCallback, ClipboardEvent } from "react";
import Link from "next/link"; // Đã thêm import Link
import {
  Send,
  CornerDownRight,
  ChevronDown,
  ChevronUp,
  Smile,
  X,
  Image as ImageIcon,
  Mic,
  Square,
  ChevronsDown,
  ChevronsUp,
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
  
  // State quản lý số lượng hiển thị (Phân trang client-side)
  const [visibleCount, setVisibleCount] = useState(6);

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

  const [commentAudio, setCommentAudio] = useState<File | null>(null);
  const [commentAudioPreview, setCommentAudioPreview] = useState<string | null>(null);
  const [replyAudio, setReplyAudio] = useState<File | null>(null);
  const [replyAudioPreview, setReplyAudioPreview] = useState<string | null>(null);
  
  const commentRecorderRef = useRef<MediaRecorder | null>(null);
  const replyRecorderRef = useRef<MediaRecorder | null>(null);
  const [isRecordingComment, setIsRecordingComment] = useState(false);
  const [isRecordingReply, setIsRecordingReply] = useState(false);

  const replyInputRef = useRef<HTMLInputElement>(null);
  const mainInputRef = useRef<HTMLInputElement>(null);

  const { socket } = useSocket();

  // Reset lại số lượng hiển thị khi chuyển bài viết
  useEffect(() => {
    setVisibleCount(6);
  }, [postId]);

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

  const handlePasteImage = (
    e: ClipboardEvent<HTMLInputElement>,
    target: "comment" | "reply"
  ) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of (items as any)) {
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

  const startRecording = async (target: "comment" | "reply") => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) return;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) chunks.push(ev.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const file = new File([blob], `comment-audio-${Date.now()}.webm`, {
          type: "audio/webm",
        });
        const url = URL.createObjectURL(blob);
        if (target === "comment") {
          if (commentAudioPreview) URL.revokeObjectURL(commentAudioPreview);
          setCommentAudio(file);
          setCommentAudioPreview(url);
        } else {
          if (replyAudioPreview) URL.revokeObjectURL(replyAudioPreview);
          setReplyAudio(file);
          setReplyAudioPreview(url);
        }
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      if (target === "comment") {
        commentRecorderRef.current = recorder;
        setIsRecordingComment(true);
        if (commentAudioPreview) URL.revokeObjectURL(commentAudioPreview);
        setCommentAudioPreview(null);
        setCommentAudio(null);
      } else {
        replyRecorderRef.current = recorder;
        setIsRecordingReply(true);
        if (replyAudioPreview) URL.revokeObjectURL(replyAudioPreview);
        setReplyAudioPreview(null);
        setReplyAudio(null);
      }
    } catch (err) {
      console.error("Lỗi bắt đầu ghi âm:", err);
    }
  };

  const stopRecording = (target: "comment" | "reply") => {
    if (target === "comment") {
      commentRecorderRef.current?.stop();
      setIsRecordingComment(false);
    } else {
      replyRecorderRef.current?.stop();
      setIsRecordingReply(false);
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

  const renderImage = (imageUrl?: string | null) => {
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

  const renderAudio = (audioUrl?: string | null) => {
    if (!audioUrl) return null;
    return (
      <div className="mt-2 rounded-lg border p-2 bg-gray-50 dark:bg-gray-900 dark:border-gray-700">
        <audio controls className="w-full">
          <source src={audioUrl} />
        </audio>
      </div>
    );
  };

  const renderComments = (list: AppComment[]) => (
    <div className="space-y-4">
      {list.map((c) => {
        const isCollapsed = collapsed.has(c.id);
        const visibleChildren =
          c.children && isCollapsed ? c.children.slice(0, 2) : c.children;
        
        // Đường dẫn profile cha
        const profileUrl = c.user?.id ? `/profile?userId=${c.user.id}` : "#";

        return (
          <div
            key={`parent-${c.id}`}
            className={`border-b pb-3 transition-all duration-700 dark:border-gray-700 ${
              (c as any)._isNew ? "animate-fadeSlide" : ""
            }`}
          >
            <div className="flex items-start gap-2 mb-2">
              {/* Avatar Cha có Link */}
              <Link href={profileUrl} className="shrink-0">
                <img
                  src={c.user.avatar || anhmacdinh.src}
                  alt="avatar"
                  className={`w-9 h-9 rounded-full object-cover border dark:border-gray-700 hover:opacity-90 transition-opacity ${
                    (c as any)._isNew ? "animate-ping-avatar" : ""
                  }`}
                />
              </Link>

              <div className="flex-1">
                {/* Tên Cha có Link */}
                <Link href={profileUrl} className="font-medium text-gray-800 dark:text-gray-100 hover:underline block">
                  {c.user.fullName}
                </Link>

                {renderCommentText(c.content)}
                {renderImage(c.image_url)}
                {renderAudio((c as any).audio_url)}
                
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
                    onClick={
                      isRecordingReply
                        ? () => stopRecording("reply")
                        : () => startRecording("reply")
                    }
                    className={`flex items-center gap-1 text-sm px-2 py-1 rounded-lg transition-colors ${
                      isRecordingReply
                        ? "bg-red-100 text-red-600 dark:bg-red-900/40"
                        : "text-gray-600 hover:text-rose-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    }`}
                  >
                    {isRecordingReply ? <Square size={16} /> : <Mic size={16} />}
                    {isRecordingReply ? "Đang ghi" : "Ghi âm"}
                  </button>
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
                {replyAudioPreview && (
                  <div className="mt-2 flex items-center gap-2 rounded-lg border p-2 dark:border-gray-700">
                    <audio controls className="w-full">
                      <source src={replyAudioPreview} />
                    </audio>
                    <button
                      type="button"
                      onClick={() => {
                        URL.revokeObjectURL(replyAudioPreview);
                        setReplyAudioPreview(null);
                        setReplyAudio(null);
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
                {visibleChildren?.map((child) => {
                  // Đường dẫn profile con
                  const childProfileUrl = child.user?.id ? `/profile?userId=${child.user.id}` : "#";
                  
                  return (
                    <div
                      key={`child-${child.id}-of-${c.id}`}
                      className={`flex flex-col transition-all duration-700 ${
                        (child as any)._isNew ? "animate-fadeSlide" : ""
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {/* Avatar Con có Link */}
                        <Link href={childProfileUrl} className="shrink-0">
                          <img
                            src={child.user.avatar || anhmacdinh.src}
                            alt="avatar"
                            className={`w-8 h-8 rounded-full object-cover border dark:border-gray-700 hover:opacity-90 transition-opacity ${
                              (child as any)._isNew ? "animate-ping-avatar" : ""
                            }`}
                          />
                        </Link>

                        <div className="flex-1">
                          {/* Tên Con có Link */}
                          <Link href={childProfileUrl} className="font-medium text-gray-800 text-sm dark:text-gray-100 hover:underline block">
                            {child.user.fullName}
                          </Link>

                          {renderCommentText(child.content)}
                          {renderImage(child.image_url)}
                          {renderAudio((child as any).audio_url)}
                          
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
                    </div>
                  );
                })}
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !commentImage && !commentAudio) return;
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
        commentImage,
        commentAudio
      );
      (newComment as any)._isNew = true;
      setComments((prev) => [newComment, ...prev]);
      setContent("");
      setCommentImage(null);
      if (commentPreview) URL.revokeObjectURL(commentPreview);
      setCommentPreview(null);
      if (commentAudioPreview) URL.revokeObjectURL(commentAudioPreview);
      setCommentAudioPreview(null);
      setCommentAudio(null);
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
    if (!replyingTo || (!replyText.trim() && !replyImage && !replyAudio)) return;
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
        replyImage,
        replyAudio
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
      if (replyAudioPreview) URL.revokeObjectURL(replyAudioPreview);
      setReplyAudioPreview(null);
      setReplyAudio(null);
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
      if (replyAudioPreview) URL.revokeObjectURL(replyAudioPreview);
      setReplyAudioPreview(null);
      setReplyAudio(null);
    } else {
      setReplyingTo(commentId);
      setReplyTarget(fullName);
      setReplyText("");
      if (replyPreview) URL.revokeObjectURL(replyPreview);
      setReplyPreview(null);
      setReplyImage(null);
      if (replyAudioPreview) URL.revokeObjectURL(replyAudioPreview);
      setReplyAudioPreview(null);
      setReplyAudio(null);
    }
  };

  const toggleCollapse = (id: number) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

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
            onClick={
              isRecordingComment
                ? () => stopRecording("comment")
                : () => startRecording("comment")
            }
            className={`flex items-center gap-1 text-sm px-2 py-1 rounded-lg transition-colors ${
              isRecordingComment
                ? "bg-red-100 text-red-600 dark:bg-red-900/40"
                : "text-gray-600 hover:text-rose-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            }`}
          >
            {isRecordingComment ? <Square size={18} /> : <Mic size={18} />}
            {isRecordingComment ? "Đang ghi" : "Ghi âm"}
          </button>
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
      {commentAudioPreview && (
        <div className="mt-2 flex items-center gap-2 rounded-lg border p-2 dark:border-gray-700">
          <audio controls className="w-full">
            <source src={commentAudioPreview} />
          </audio>
          <button
            type="button"
            onClick={() => {
              URL.revokeObjectURL(commentAudioPreview);
              setCommentAudioPreview(null);
              setCommentAudio(null);
            }}
            className="text-gray-500 hover:text-red-500"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* --- KHU VỰC HIỂN THỊ DANH SÁCH BÌNH LUẬN (SCROLL + PHÂN TRANG) --- */}
      <div className="mt-3 border-t pt-3 dark:border-gray-700">
        
        {/* Container có Scrollbar và giới hạn chiều cao */}
        <div className="max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
          {renderComments(comments.slice(0, visibleCount))}
        </div>

        {/* Nút Xem thêm / Thu gọn */}
        {comments.length > 6 && (
          <div className="flex justify-center items-center gap-4 mt-3 border-t pt-2 dark:border-gray-700">
            {/* Nếu số lượng hiện tại < tổng số, hiện nút Xem thêm */}
            {visibleCount < comments.length && (
              <button
                onClick={() => setVisibleCount((prev) => prev + 10)}
                className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors dark:text-blue-400"
              >
                <ChevronsDown size={16} />
                Xem thêm bình luận
              </button>
            )}

            {/* Nếu số lượng hiện tại > 6, hiện nút Thu gọn */}
            {visibleCount > 6 && (
              <button
                onClick={() => setVisibleCount(6)}
                className="text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors dark:text-gray-400"
              >
                <ChevronsUp size={16} />
                Thu gọn
              </button>
            )}
          </div>
        )}
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

