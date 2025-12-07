// "use client";

// import { useEffect, useState } from "react";
// import { toast } from "react-hot-toast";
// import { 
//   Search, RefreshCw, Eye, Trash2, AlertCircle, 
//   Image as ImageIcon, Mic, Video 
// } from "lucide-react";
// import { deletePostAdmin, getAllPostsAdmin } from "@/services/admin";
// import { AdminPost } from "@/types";

// import anhmacdinh from "../../../image/anhmacdinh.jpg"; // Chỉnh lại đường dẫn import ảnh của bạn cho đúng
// import PostModal from "../Posts/PostModal";

// export default function PostManagement() {
//   // --- STATE ---
//   const [posts, setPosts] = useState<AdminPost[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
//   const [deletingId, setDeletingId] = useState<number | null>(null);

//   // --- API FUNCTIONS ---
//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       const data = await getAllPostsAdmin();
//       setPosts((data || []) as any);
//       toast.success("Đã cập nhật danh sách");
//     } catch (error) {
//       toast.error("Lỗi tải dữ liệu");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (postId: number) => {
//     if (!confirm("Xóa vĩnh viễn bài viết này?")) return;
//     setDeletingId(postId);
//     try {
//       await deletePostAdmin(postId);
//       setPosts((prev) => prev.filter((p) => p.id !== postId));
//       toast.success("Đã xóa bài viết");
//     } catch {
//       toast.error("Xóa thất bại");
//     } finally {
//       setDeletingId(null);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   // --- FILTERING ---
//   const filteredPosts = posts.filter((post) => {
//     const search = searchTerm.toLowerCase();
//     return (
//       post.title?.toLowerCase().includes(search) ||
//       post.content?.toLowerCase().includes(search) ||
//       post.user?.fullName?.toLowerCase().includes(search) ||
//       post.user?.username?.toLowerCase().includes(search)
//     );
//   });

//   // --- RENDER HELPERS (SUB-COMPONENTS GỘP TẠI ĐÂY) ---
  
//   // 1. Phần Search & Header
//   const renderHeader = () => (
//     <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
//       <div>
//         <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">Quản lý Bài Viết</h1>
//         <p className="text-gray-600">Tổng cộng: {filteredPosts.length} bài viết</p>
//       </div>

//       <div className="flex gap-3 w-full md:w-auto">
//         <div className="bg-white rounded-full shadow-md border flex items-center flex-1 md:flex-initial relative">
//           <Search className="text-gray-400 ml-4" size={20} />
//           <input
//             type="text"
//             placeholder="Tìm kiếm..."
//             className="w-full pl-2 pr-4 py-2.5 outline-none text-gray-700 rounded-full"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </div>
//         <button
//           onClick={fetchData}
//           className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all shadow-md"
//           title="Làm mới"
//         >
//           <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
//         </button>
//       </div>
//     </div>
//   );

//   // 2. Phần Loading
//   if (loading && posts.length === 0) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="animate-fade-in">
//       {renderHeader()}

//       {/* TABLE */}
//       <div className="bg-white rounded-2xl shadow-xl overflow-hidden border">
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">ID / Ngày</th>
//                 <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Tác giả</th>
//                 <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Nội dung</th>
//                 <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase">Hành động</th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-100">
//               {filteredPosts.map((post) => (
//                 <tr key={post.id} className="hover:bg-gray-50 transition-colors">
//                   {/* Cột 1: ID/Date */}
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="font-bold text-gray-900">#{post.id}</div>
//                     <div className="text-xs text-gray-500">
//                       {new Date(post.createdAt).toLocaleString("vi-VN")}
//                     </div>
//                   </td>
                  
//                   {/* Cột 2: User */}
//                   <td className="px-6 py-4">
//                     <div className="flex items-center gap-3">
//                       <img
//                         className="w-10 h-10 rounded-full object-cover border"
//                         src={post.user?.avatar || anhmacdinh.src}
//                         onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/40"; }}
//                         alt=""
//                       />
//                       <div>
//                         <div className="font-medium text-gray-900">{post.user?.fullName}</div>
//                         <div className="text-xs text-gray-500">@{post.user?.username}</div>
//                       </div>
//                     </div>
//                   </td>

//                   {/* Cột 3: Content & Media Badges */}
//                   <td className="px-6 py-4 max-w-lg">
//                     <div className="font-semibold text-gray-800 line-clamp-1">{post.title}</div>
//                     <div className="text-sm text-gray-600 line-clamp-2 mt-1">{post.content}</div>
//                     <div className="flex gap-2 mt-2">
//                       {post.image_url && <span className="badge-media bg-blue-100 text-blue-700"><ImageIcon size={12}/> Ảnh</span>}
//                       {(post as any).audio_url && <span className="badge-media bg-purple-100 text-purple-700"><Mic size={12}/> Audio</span>}
//                       {(post as any).video_url && <span className="badge-media bg-red-100 text-red-700"><Video size={12}/> Video</span>}
//                     </div>
//                   </td>

//                   {/* Cột 4: Actions */}
//                   <td className="px-6 py-4 text-center">
//                     <div className="flex justify-center gap-3">
//                       <button onClick={() => setSelectedPostId(post.id)} className="text-gray-500 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-full">
//                         <Eye size={20} />
//                       </button>
//                       <button 
//                         onClick={() => handleDelete(post.id)} 
//                         disabled={deletingId === post.id}
//                         className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full disabled:opacity-50"
//                       >
//                         {deletingId === post.id ? <div className="w-5 h-5 border-2 border-red-500 rounded-full animate-spin border-t-transparent"/> : <Trash2 size={20} />}
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>

//           {filteredPosts.length === 0 && (
//             <div className="p-16 text-center">
//               <AlertCircle size={48} className="mx-auto text-gray-300 mb-3" />
//               <p className="text-gray-500">{searchTerm ? "Không tìm thấy kết quả" : "Chưa có dữ liệu"}</p>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Modal chi tiết */}
//       <PostModal 
//         postId={selectedPostId} 
//         onClose={() => setSelectedPostId(null)} 
//       />
      
//       <style jsx>{`
//         .badge-media {
//           display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; 
//           border-radius: 999px; font-size: 0.75rem; font-weight: 500;
//         }
//       `}</style>
//     </div>
//   );
// }
"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { 
  Search, RefreshCw, Eye, Trash2, AlertCircle, 
  Image as ImageIcon, Mic, Video 
} from "lucide-react";
import { deletePostAdmin, getAllPostsAdmin } from "@/services/admin";
import { AdminPost } from "@/types";
import anhmacdinh from "../../../image/anhmacdinh.jpg"; // Check path
import PostModal from "../Posts/PostModal";

export default function PostManagement() {
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getAllPostsAdmin();
      setPosts((data || []) as any);
      toast.success("Đã cập nhật danh sách");
    } catch (error) {
      toast.error("Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId: number) => {
    if (!confirm("Xóa vĩnh viễn bài viết này?")) return;
    setDeletingId(postId);
    try {
      await deletePostAdmin(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      toast.success("Đã xóa bài viết");
    } catch {
      toast.error("Xóa thất bại");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredPosts = posts.filter((post) => {
    const search = searchTerm.toLowerCase();
    return (
      post.title?.toLowerCase().includes(search) ||
      post.content?.toLowerCase().includes(search) ||
      post.user?.fullName?.toLowerCase().includes(search) ||
      post.user?.username?.toLowerCase().includes(search)
    );
  });

  const renderHeader = () => (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 w-full">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">Quản lý Bài Viết</h1>
        <p className="text-gray-600">Tổng cộng: {filteredPosts.length} bài viết</p>
      </div>

      <div className="flex gap-3 w-full md:w-auto">
        <div className="bg-white rounded-full shadow-md border flex items-center flex-1 md:flex-initial relative">
          <Search className="text-gray-400 ml-4" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="w-full pl-2 pr-4 py-2.5 outline-none text-gray-700 rounded-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={fetchData}
          className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all shadow-md"
          title="Làm mới"
        >
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>
    </div>
  );

  if (loading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in w-full">
      {renderHeader()}

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border w-full">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">ID / Ngày</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Tác giả</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Nội dung</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-bold text-gray-900">#{post.id}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(post.createdAt).toLocaleString("vi-VN")}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        className="w-10 h-10 rounded-full object-cover border"
                        src={post.user?.avatar || anhmacdinh.src}
                        onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/40"; }}
                        alt=""
                      />
                      <div>
                        <div className="font-medium text-gray-900">{post.user?.fullName}</div>
                        <div className="text-xs text-gray-500">@{post.user?.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-lg">
                    <div className="font-semibold text-gray-800 line-clamp-1">{post.title}</div>
                    <div className="text-sm text-gray-600 line-clamp-2 mt-1">{post.content}</div>
                    <div className="flex gap-2 mt-2">
                      {post.image_url && <span className="badge-media bg-blue-100 text-blue-700"><ImageIcon size={12}/> Ảnh</span>}
                      {(post as any).audio_url && <span className="badge-media bg-purple-100 text-purple-700"><Mic size={12}/> Audio</span>}
                      {(post as any).video_url && <span className="badge-media bg-red-100 text-red-700"><Video size={12}/> Video</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-3">
                      <button onClick={() => setSelectedPostId(post.id)} className="text-gray-500 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-full">
                        <Eye size={20} />
                      </button>
                      <button 
                        onClick={() => handleDelete(post.id)} 
                        disabled={deletingId === post.id}
                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full disabled:opacity-50"
                      >
                        {deletingId === post.id ? <div className="w-5 h-5 border-2 border-red-500 rounded-full animate-spin border-t-transparent"/> : <Trash2 size={20} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredPosts.length === 0 && (
            <div className="p-16 text-center">
              <AlertCircle size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">{searchTerm ? "Không tìm thấy kết quả" : "Chưa có dữ liệu"}</p>
            </div>
          )}
        </div>
      </div>
      <PostModal 
        postId={selectedPostId} 
        onClose={() => setSelectedPostId(null)} 
      />
      <style jsx>{`
        .badge-media {
          display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; 
          border-radius: 999px; font-size: 0.75rem; font-weight: 500;
        }
      `}</style>
    </div>
  );
}