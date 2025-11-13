// 'use client';
// import { useState } from "react";
// import { PlusCircle } from "lucide-react";
// import { createPost } from "@/services/api";
// import { Post } from "@/types"; // import interface

// interface Props {
//   posts: Post[];
//   setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
// }

// export default function CreatePosts({ posts, setPosts }: Props) {
//   const [showForm, setShowForm] = useState(false);
//   const [content, setContent] = useState("");
//   const [visibility, setVisibility] = useState("friends");
//   const [image, setImage] = useState<File | null>(null);
//   const [video, setVideo] = useState<File | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");

//   const toggleForm = () => setShowForm(prev => !prev);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!content.trim() && !image && !video) {
//       setMessage("Vui lòng nhập nội dung hoặc chọn ảnh/video.");
//       return;
//     }

//     setLoading(true);
//     setMessage("");

//     try {
//       const token = localStorage.getItem("token");
//       const formData = new FormData();
//       formData.append("content", content);
//       formData.append("visibility", visibility);
//       if (image) formData.append("image", image);
//       if (video) formData.append("video", video);

//       const newPost: Post = await createPost(formData, token!);
//       setPosts(prev => [newPost, ...prev]); // thêm bài mới vào feed
//       setMessage("Đăng bài thành công!");
//       setContent("");
//       setVisibility("friends");
//       setImage(null);
//       setVideo(null);
//       setShowForm(false);
//     } catch (err: any) {
//       console.error("Lỗi khi đăng bài:", err);
//       setMessage(err.message || "Đã có lỗi xảy ra, vui lòng thử lại!");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => setImage(e.target.files?.[0] || null);
//   const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => setVideo(e.target.files?.[0] || null);

//   return (
//     <div className="mb-6">
//       <button onClick={toggleForm} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
//         <PlusCircle size={18} /> {showForm ? "Đóng lại" : "Tạo bài viết"}
//       </button>

//       {showForm && (
//         <form onSubmit={handleSubmit} className="bg-white p-5 border rounded-2xl shadow-sm mt-4">
//           <h2 className="text-lg font-semibold text-gray-800 mb-3">Tạo bài viết mới</h2>

//           <textarea placeholder="Bạn đang nghĩ gì?" value={content} onChange={e => setContent(e.target.value)}
//             rows={4} className="w-full border rounded-lg px-3 py-2 mb-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none" />

//           <div className="flex flex-col sm:flex-row gap-4 mb-3">
//             <div className="flex-1">
//               <label className="block text-sm text-gray-600 mb-1">Ảnh (tùy chọn)</label>
//               <input type="file" accept="image/*" onChange={handleImageChange}
//                 className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
//             </div>
//             <div className="flex-1">
//               <label className="block text-sm text-gray-600 mb-1">Video (tùy chọn)</label>
//               <input type="file" accept="video/*" onChange={handleVideoChange}
//                 className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100" />
//             </div>
//           </div>

//           <div className="mb-4">
//             <label className="block text-sm text-gray-600 mb-1">Chế độ xem</label>
//             <select value={visibility} onChange={e => setVisibility(e.target.value)}
//               className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
//               <option value="public">Công khai</option>
//               <option value="friends">Bạn bè</option>
//               <option value="private">Chỉ mình tôi</option>
//             </select>
//           </div>

//           <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
//             {loading ? "Đang xử lý..." : "Đăng bài"}
//           </button>

//           {message && <p className={`text-sm mt-3 text-center ${message.includes("lỗi") ? "text-red-500" : "text-green-500"}`}>{message}</p>}
//         </form>
//       )}
//     </div>
//   );
// }
"use client";
import { useState, useRef } from "react";
// Thêm các icon mới: Image, Video, X
import { Smile, Image, Video, X } from "lucide-react";
import { createPost } from "@/services/api";
import { Post } from "@/types";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";

interface Props {
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
}

export default function CreatePosts({ posts, setPosts }: Props) {
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState("friends");
  const [image, setImage] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // State mới để lưu URL preview
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  

  const handleSubmit = async (e: React.FormEvent) => {
    // ... logic handleSubmit không đổi ...
    e.preventDefault();
    if (!content.trim() && !image && !video) {
      setMessage("Vui lòng nhập nội dung hoặc chọn ảnh/video.");
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

      const newPost: Post = await createPost(formData, token!);
      setPosts((prev) => [newPost, ...prev]);
      setMessage("Đăng bài thành công!");
      setContent("");
      setVisibility("friends");
      // Reset file và preview
      setImage(null);
      setVideo(null);
      setImagePreview(null);
      setVideoPreview(null);
      setShowEmojiPicker(false);
    } catch (err: any) {
      console.error("Lỗi khi đăng bài:", err);
      setMessage(err.message || "Đã có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý khi chọn ảnh
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
    if (videoPreview) {
      // Chỉ cho phép 1 trong 2
      setVideo(null);
      setVideoPreview(null);
    }
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  // Xử lý khi chọn video
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setVideo(file);
    if (imagePreview) {
      // Chỉ cho phép 1 trong 2
      setImage(null);
      setImagePreview(null);
    }
    if (file) {
      setVideoPreview(URL.createObjectURL(file));
    } else {
      setVideoPreview(null);
    }
  };

  // Gỡ bỏ ảnh
  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  // Gỡ bỏ video
  const removeVideo = () => {
    setVideo(null);
    setVideoPreview(null);
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    // ... logic onEmojiClick không đổi ...
    const ref = textareaRef.current;
    if (ref) {
      ref.focus();
      const start = ref.selectionStart;
      const end = ref.selectionEnd;
      const newContent =
        content.substring(0, start) + emojiData.emoji + content.substring(end);
      setContent(newContent);
      // Giữ con trỏ đúng vị trí sau khi chèn
      // (Bỏ qua bước này, để setContent tự xử lý)
    }
  };

  return (
    <div className="mb-6">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-4 border rounded-2xl shadow-sm mt-0 dark:bg-gray-800 dark:border-gray-700"
        >
          {/* Giảm kích thước font title */}
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

          {/* Hiển thị Preview */}
          {(imagePreview || videoPreview) && (
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
                  <video
                    src={videoPreview}
                    controls
                    className="w-full h-auto"
                  />
                  <button
                    type="button"
                    onClick={removeVideo}
                    className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition-all"
                  >
                    <X size={16} />
                  </button>
                </>
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
                disabled={!!videoPreview}
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
                disabled={!!imagePreview}
              />
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

            {/* Nút chọn chế độ xem */}
            <div>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                // Style lại cho gọn hơn
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
                message.includes("lỗi") ? "text-red-500" : "text-green-500"
              }`}
            >
              {message}
            </p>
          )}
        </form>
    </div>
  );
}
