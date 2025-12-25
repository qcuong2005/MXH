"use client";

import { useEffect, useRef, useState } from "react";
import { Smile, Image, Video, X, Mic, Square } from "lucide-react";
import { createPost } from "@/services/post";
import { Post } from "@/types";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";

interface Props {
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
}

export default function CreatePosts({ posts, setPosts }: Props) {
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [image, setImage] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const resetRecordingTimer = () => {
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
  };

  const removeAudio = () => {
    resetRecordingTimer();
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    if (audioPreview) {
      URL.revokeObjectURL(audioPreview);
    }
    setIsRecording(false);
    setRecordingTime(0);
    setAudioBlob(null);
    setAudioPreview(null);
  };

  const handleStartRecording = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setMessage("Trình duyệt không hỗ trợ ghi âm.");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioPreview(URL.createObjectURL(blob));
        setRecordingTime(0);
        stream.getTracks().forEach((track) => track.stop());
      };

      // Chỉ giữ một loại media
      setImage(null);
      setImagePreview(null);
      setVideo(null);
      setVideoPreview(null);
      removeAudio();

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      resetRecordingTimer();
      recordingIntervalRef.current = setInterval(
        () => setRecordingTime((prev) => prev + 1),
        1000
      );
      setMessage("");
    } catch (error) {
      console.error("Lỗi khi bắt đầu ghi âm:", error);
      setMessage("Không thể bắt đầu ghi âm.");
    }
  };

  const handleStopRecording = () => {
    mediaRecorderRef.current?.stop();
    resetRecordingTimer();
    setIsRecording(false);
  };

  useEffect(() => {
    return () => {
      resetRecordingTimer();
      mediaRecorderRef.current?.stop();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !image && !video && !audioBlob) {
      setMessage("Vui lòng nhập nội dung hoặc chọn ảnh/video/ghi âm.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("content", content);
      formData.append("visibility", visibility);
      if (image) formData.append("image", image);
      if (video) formData.append("video", video);
      if (audioBlob) {
        formData.append(
          "audio",
          new File([audioBlob], `recording-${Date.now()}.webm`, {
            type: audioBlob.type || "audio/webm",
          })
        );
      }

      const newPost: Post = await createPost(formData, token!);
      setPosts((prev) => [newPost, ...prev]);
      setMessage("Đăng bài thành công!");
      setContent("");
      setVisibility("friends");
      setImage(null);
      setVideo(null);
      setAudioBlob(null);
      setImagePreview(null);
      setVideoPreview(null);
      if (audioPreview) URL.revokeObjectURL(audioPreview);
      setAudioPreview(null);
      setShowEmojiPicker(false);
    } catch (err: any) {
      console.error("Lỗi khi đăng bài:", err);
      setMessage(err.message || "Đã có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setLoading(false);
      setIsRecording(false);
      resetRecordingTimer();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
    setVideo(null);
    setVideoPreview(null);
    removeAudio();
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setVideo(file);
    setImage(null);
    setImagePreview(null);
    removeAudio();
    if (file) {
      setVideoPreview(URL.createObjectURL(file));
    } else {
      setVideoPreview(null);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const removeVideo = () => {
    setVideo(null);
    setVideoPreview(null);
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    const ref = textareaRef.current;
    if (ref) {
      ref.focus();
      const start = ref.selectionStart;
      const end = ref.selectionEnd;
      const newContent =
        content.substring(0, start) + emojiData.emoji + content.substring(end);
      setContent(newContent);
    }
  };

  return (
    <div className="mb-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 border rounded-2xl shadow-sm mt-0 dark:bg-gray-800 dark:border-gray-700"
      >
        <h2 className="text-md font-semibold text-gray-700 mb-3 dark:text-gray-200">
          Tạo bài viết mới
        </h2>

        <div className="relative">
          <textarea
            ref={textareaRef}
            placeholder="Bạn đang nghĩ gì?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="w-full border rounded-lg px-3 py-2 mb-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
          />
        </div>

        {(imagePreview || videoPreview || audioPreview) && (
          <div className="mb-3 relative max-h-80 overflow-hidden rounded-lg border dark:border-gray-700">
            {imagePreview && (
              <>
                <img
                  src={imagePreview}
                  alt="Xem trước"
                  className="w-full h-auto object-contain"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition-all"
                >
                  <X size={16} />
                </button>
              </>
            )}
            {videoPreview && (
              <>
                <video src={videoPreview} controls className="w-full h-auto" />
                <button
                  type="button"
                  onClick={removeVideo}
                  className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition-all"
                >
                  <X size={16} />
                </button>
              </>
            )}
            {audioPreview && (
              <div className="p-4 flex items-center gap-3 bg-gray-50 dark:bg-gray-900">
                <audio controls src={audioPreview} className="w-full" />
                <button
                  type="button"
                  onClick={removeAudio}
                  className="text-gray-600 hover:text-red-500"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <label
              htmlFor="image-upload"
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition-colors dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <Image size={18} className="text-blue-500" />
              <span>Ảnh</span>
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              disabled={!!videoPreview || !!audioPreview || isRecording}
            />
            <label
              htmlFor="video-upload"
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-violet-600 cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition-colors dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <Video size={18} className="text-violet-500" />
              <span>Video</span>
            </label>
            <input
              id="video-upload"
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              className="hidden"
              disabled={!!imagePreview || !!audioPreview || isRecording}
            />
            <button
              type="button"
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              className={`flex items-center gap-1.5 text-sm p-2 rounded-lg transition-colors ${
                isRecording
                  ? "text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300"
                  : "text-gray-600 hover:text-rose-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
            >
              {isRecording ? <Square size={18} /> : <Mic size={18} />}
              <span>
                {isRecording
                  ? `Đang ghi ${recordingTime}s`
                  : "Ghi âm"}
              </span>
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEmojiPicker((prev) => !prev)}
                className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-yellow-600 cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition-colors dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <Smile size={18} className="text-yellow-500" />
                <span>Cảm xúc</span>
              </button>
              {showEmojiPicker && (
                <div className="absolute z-10 bottom-full mb-2 right-0 sm:right-auto sm:left-0">
                  <EmojiPicker
                    onEmojiClick={onEmojiClick}
                    lazyLoadEmojis={true}
                    height={350}
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="text-sm border rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              <option value="public">Công khai</option>
              <option value="friends">Bạn bè</option>
              <option value="private">Chỉ mình tôi</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? "Đang xử lý..." : "Đăng bài"}
        </button>
        {message && (
          <p
            className={`text-sm mt-3 text-center ${
              message.toLowerCase().includes("lỗi") ? "text-red-500" : "text-green-500"
            }`}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
