// "use client";
// import { useState, useEffect } from "react";
// import { X, UserPlus, Trash2, Users, Shield, Search, Check, Loader2, AlertCircle } from "lucide-react";
// import Image from "next/image";
// import anhmacdinh from "../../../image/anhmacdinh.jpg"; 
// import { 
//   getGroupMembersApi, 
//   addGroupMemberApi, 
//   removeGroupMemberApi,
//   // searchUsersApi, // Uncomment nếu bạn đã có API tìm kiếm user toàn hệ thống
// } from "@/services/group";
// import { getFriendsApi } from "@/services/friend";

// // --- Interfaces ---

// interface GroupInfoModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   selectedChat: any;
//   currentUser: any;
// }

// interface MemberDisplay {
//   id: number;       // ID record group_member (nếu có)
//   userId: number;   // ID User
//   name: string;
//   avatar: string | null;
//   username?: string;
//   role: 'admin' | 'member' | null;
//   isInGroup: boolean;
// }

// export default function GroupInfoModal({
//   isOpen,
//   onClose,
//   selectedChat,
//   currentUser,
// }: GroupInfoModalProps) {
//   // --- STATE ---
//   const [activeTab, setActiveTab] = useState<"members" | "add">("members");
  
//   // Tab Danh sách thành viên
//   const [members, setMembers] = useState<MemberDisplay[]>([]);
//   const [isCurrentUserAdmin, setIsCurrentUserAdmin] = useState(false);

//   // Tab Thêm thành viên
//   const [searchTerm, setSearchTerm] = useState("");
//   const [suggestedUsers, setSuggestedUsers] = useState<MemberDisplay[]>([]); 
//   const [loadingList, setLoadingList] = useState(false); 
//   const [processingId, setProcessingId] = useState<number | null>(null);

//   // --- EFFECT: LOAD MEMBERS KHI MỞ MODAL ---
//   useEffect(() => {
//     if (isOpen && selectedChat?.id && selectedChat.isGroup && currentUser?.token) {
//       fetchGroupMembers();
//     }
//   }, [isOpen, selectedChat, currentUser]);

//   // --- EFFECT: LOAD BẠN BÈ HOẶC TÌM KIẾM ---
//   useEffect(() => {
//     if (activeTab === "add" && isOpen) {
//       const fetchSuggestions = async () => {
//         setLoadingList(true);
//         try {
//           let rawData: any[] = [];
          
//           if (!searchTerm.trim()) {
//             // 🟢 TRƯỜNG HỢP 1: Không nhập gì -> Gọi API lấy danh sách bạn bè thật
//             console.log("Đang lấy danh sách bạn bè...");
//             rawData = await getFriendsApi(currentUser.token);
            
//           } else {
//             // 🟡 TRƯỜNG HỢP 2: Có nhập từ khóa -> Gọi API tìm kiếm User (Search System)
//             // Nếu bạn chưa có API searchUsersApi, tạm thời trả về rỗng hoặc filter từ list bạn bè
//             // rawData = await searchUsersApi(currentUser.token, searchTerm);
            
//             console.log("Đang tìm kiếm:", searchTerm);
//             // Tạm thời để rỗng nếu chưa có API search
//              rawData = []; 
//           }

//           // Lấy danh sách ID thành viên đang có trong nhóm để check "Đã tham gia"
//           const currentMemberIds = new Set(members.map(m => m.userId));

//           // Map dữ liệu từ API về format hiển thị
//           // Lưu ý: Tùy thuộc vào response của getFriendsApi trả về key là 'name', 'fullName' hay 'username'
//           const mappedSuggestions: MemberDisplay[] = rawData.map((u: any) => ({
//             id: 0, 
//             userId: u.id, 
//             // Ưu tiên hiển thị fullName, nếu không có thì username, không có nữa thì ID
//             name: u.fullName || u.name || u.username || `User ${u.id}`, 
//             username: u.username,
//             avatar: u.avatar,
//             role: null,
//             isInGroup: currentMemberIds.has(u.id)
//           }));

//           setSuggestedUsers(mappedSuggestions);

//         } catch (error) {
//           console.error("Lỗi tải danh sách gợi ý:", error);
//         } finally {
//           setLoadingList(false);
//         }
//       };

//       // Debounce: Chờ 500ms sau khi ngừng gõ mới gọi API (tránh spam server)
//       const timeoutId = setTimeout(() => {
//         fetchSuggestions();
//       }, 500);

//       return () => clearTimeout(timeoutId);
//     }
//   }, [activeTab, searchTerm, isOpen, members, currentUser.token]); // Thêm dependencies

//   // --- CÁC HÀM XỬ LÝ LOGIC ---

//   const fetchGroupMembers = async () => {
//     try {
//       const data = await getGroupMembersApi(currentUser.token, selectedChat.id);
      
//       const mappedMembers: MemberDisplay[] = data.map((m: any) => ({
//         id: m.id, 
//         userId: m.user?.id || m.user_id,
//         name: m.user?.fullName || m.user?.username || `User ${m.user_id}`,
//         avatar: m.user?.avatar,
//         role: m.role,
//         isInGroup: true
//       }));
      
//       setMembers(mappedMembers);

//       const myMemberInfo = mappedMembers.find(m => m.userId === currentUser.id);
//       setIsCurrentUserAdmin(myMemberInfo?.role === 'admin');
//     } catch (error) {
//       console.error("Lỗi tải thành viên nhóm:", error);
//     }
//   };

//   const handleAddMember = async (userIdToAdd: number) => {
//     setProcessingId(userIdToAdd);
//     try {
//       await addGroupMemberApi(currentUser.token, selectedChat.id, userIdToAdd);
      
//       // Update UI Optimistic
//       setSuggestedUsers(prev => prev.map(u => 
//         u.userId === userIdToAdd ? { ...u, isInGroup: true } : u
//       ));
      
//       // Reload danh sách thành viên trong tab kia
//       fetchGroupMembers();

//     } catch (error: any) {
//       console.error(error);
//       const errorMessage = error.response?.data?.message || "Thêm thất bại.";
//       if (errorMessage.toLowerCase().includes("kiểm duyệt") || error.response?.status === 403) {
//         alert("Đã gửi yêu cầu tham gia tới Admin (Do nhóm đang bật kiểm duyệt).");
//       } else {
//         alert(`Lỗi: ${errorMessage}`);
//       }
//     } finally {
//       setProcessingId(null);
//     }
//   };

//   const handleRemoveMember = async (userIdToRemove: number) => {
//     if (!isCurrentUserAdmin) return;
//     if (!confirm("Bạn có chắc muốn xóa thành viên này?")) return;
    
//     setProcessingId(userIdToRemove);
//     try {
//       await removeGroupMemberApi(currentUser.token, selectedChat.id, userIdToRemove);
//       setMembers(prev => prev.filter((m) => m.userId !== userIdToRemove));
//     } catch (error: any) {
//       alert(error.response?.data?.message || "Xóa thất bại");
//     } finally {
//       setProcessingId(null);
//     }
//   };

//   const getAvatarSrc = (avatar: string | null | undefined) => {
//     return avatar || anhmacdinh.src;
//   };

//   // --- RENDER ---
//   if (!isOpen || !selectedChat?.isGroup) return null;

//   return (
//     <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
//       <div className="absolute inset-0" onClick={onClose}></div>

//       <div className="relative bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] z-10">
        
//         {/* Header */}
//         <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
//           <h3 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
//             <Users size={20} className="text-blue-600" /> 
//             Thông tin nhóm
//           </h3>
//           <button onClick={onClose} className="p-1.5 hover:bg-gray-200 rounded-full dark:hover:bg-gray-700 transition-colors text-gray-500">
//             <X size={20} />
//           </button>
//         </div>

//         {/* Tabs */}
//         <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
//           <button
//             onClick={() => setActiveTab("members")}
//             className={`flex-1 py-3 text-sm font-medium transition-all relative ${
//               activeTab === "members" ? "text-blue-600 dark:text-blue-400" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
//             }`}
//           >
//             Thành viên ({members.length})
//             {activeTab === "members" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400" />}
//           </button>
//           <button
//             onClick={() => { setActiveTab("add"); setSearchTerm(""); }}
//             className={`flex-1 py-3 text-sm font-medium transition-all relative ${
//               activeTab === "add" ? "text-blue-600 dark:text-blue-400" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
//             }`}
//           >
//             Thêm người mới
//             {activeTab === "add" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400" />}
//           </button>
//         </div>

//         {/* Content Area */}
//         <div className="flex-1 overflow-y-auto p-0 bg-white dark:bg-gray-800 custom-scrollbar">
          
//           {/* TAB 1: DANH SÁCH THÀNH VIÊN */}
//           {activeTab === "members" && (
//             <div className="p-2">
//               {members.length === 0 ? (
//                  <div className="flex justify-center py-8"><Loader2 className="animate-spin text-blue-500"/></div>
//               ) : (
//                 members.map((member) => (
//                   <div key={member.userId} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors group">
//                     <div className="flex items-center gap-3">
//                       <Image
//                         src={getAvatarSrc(member.avatar)}
//                         alt={member.name}
//                         width={44} height={44}
//                         className="w-11 h-11 rounded-full object-cover border border-gray-100 dark:border-gray-600"
//                       />
//                       <div>
//                         <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-1">
//                           {member.name}
//                           {member.userId === currentUser.id && <span className="text-gray-400 font-normal text-xs">(Bạn)</span>}
//                         </p>
//                         {member.role === 'admin' ? (
//                           <span className="text-[10px] bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400 px-2 py-0.5 rounded-full flex items-center w-fit gap-1 mt-0.5 font-medium">
//                              <Shield size={10} className="fill-current" /> Admin
//                           </span>
//                         ) : (
//                            <span className="text-[11px] text-gray-500 dark:text-gray-400">Thành viên</span>
//                         )}
//                       </div>
//                     </div>
                    
//                     {/* Nút xóa */}
//                     {isCurrentUserAdmin && member.userId !== currentUser.id && (
//                       <button 
//                         onClick={() => handleRemoveMember(member.userId)}
//                         disabled={processingId === member.userId}
//                         className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:opacity-50"
//                       >
//                          {processingId === member.userId ? <Loader2 size={18} className="animate-spin"/> : <Trash2 size={18} />}
//                       </button>
//                     )}
//                   </div>
//                 ))
//               )}
//             </div>
//           )}

//           {/* TAB 2: TÌM KIẾM & THÊM TỪ BẠN BÈ */}
//           {activeTab === "add" && (
//             <div className="flex flex-col h-full">
//               {/* Search Box */}
//               <div className="p-4 bg-white dark:bg-gray-800 sticky top-0 z-10 border-b border-gray-100 dark:border-gray-700">
//                 <div className="relative">
//                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
//                   <input
//                     type="text"
//                     placeholder="Nhập tên người dùng..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-700 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 dark:text-white"
//                   />
//                 </div>
//                 {selectedChat?.moderation && (
//                   <p className="text-xs text-orange-600 dark:text-orange-400 mt-2 flex items-center gap-1">
//                     <AlertCircle size={12}/> Chế độ kiểm duyệt đang bật: Admin sẽ duyệt yêu cầu.
//                   </p>
//                 )}
//               </div>

//               {/* List Suggestion */}
//               <div className="flex-1 p-2 overflow-y-auto">
//                 <p className="px-2 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
//                   {searchTerm ? "Kết quả tìm kiếm" : "Bạn bè của bạn"}
//                 </p>

//                 {loadingList ? (
//                    <div className="flex justify-center py-8 text-gray-400"><Loader2 className="animate-spin"/></div>
//                 ) : suggestedUsers.length === 0 ? (
//                    <div className="flex flex-col items-center justify-center py-10 text-center">
//                       <Users size={30} className="text-gray-300 dark:text-gray-600 mb-2"/>
//                       <p className="text-gray-500 dark:text-gray-400 text-sm">
//                         {searchTerm ? "Không tìm thấy người dùng nào." : "Bạn chưa có bạn bè nào."}
//                       </p>
//                    </div>
//                 ) : (
//                   suggestedUsers.map((user) => (
//                     <div key={user.userId} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors">
//                       <div className="flex items-center gap-3">
//                          <Image
//                             src={getAvatarSrc(user.avatar)}
//                             alt={user.name}
//                             width={40} height={40}
//                             className="w-10 h-10 rounded-full object-cover border border-gray-100 dark:border-gray-600"
//                           />
//                           <div>
//                             <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{user.name}</p>
//                             {user.username && <p className="text-xs text-gray-500">@{user.username}</p>}
//                           </div>
//                       </div>

//                       {user.isInGroup ? (
//                         <span className="text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400 px-3 py-1.5 rounded-lg flex items-center gap-1">
//                           <Check size={12}/> Đã tham gia
//                         </span>
//                       ) : (
//                         <button
//                           onClick={() => handleAddMember(user.userId)}
//                           disabled={processingId === user.userId}
//                           className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg flex items-center gap-1 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100 shadow-sm"
//                         >
//                           {processingId === user.userId ? (
//                              <Loader2 size={14} className="animate-spin"/>
//                           ) : (
//                              <><UserPlus size={14}/> Thêm</>
//                           )}
//                         </button>
//                       )}
//                     </div>
//                   ))
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";
import { useState, useEffect } from "react";
import { X, UserPlus, Trash2, Users, Shield, Search, Check, Loader2, AlertCircle, AlertTriangle } from "lucide-react";
import Image from "next/image";
import anhmacdinh from "../../../image/anhmacdinh.jpg"; 
import { 
  getGroupMembersApi, 
  addGroupMemberApi, 
  removeGroupMemberApi,
  dissolveGroupApi 
} from "@/services/group";
import { getFriendsApi } from "@/services/friend";

interface GroupInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedChat: any;
  currentUser: any;
  onGroupDeleted?: (groupId: number) => void; 
}

interface MemberDisplay {
  id: number;      
  userId: number;   
  name: string;
  avatar: string | null;
  username?: string;
  role: 'admin' | 'member' | null;
  isInGroup: boolean;
}

export default function GroupInfoModal({
  isOpen,
  onClose,
  selectedChat,
  currentUser,
  onGroupDeleted 
}: GroupInfoModalProps) {
  const [activeTab, setActiveTab] = useState<"members" | "add">("members");
  const [members, setMembers] = useState<MemberDisplay[]>([]);
  const [isCurrentUserAdmin, setIsCurrentUserAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestedUsers, setSuggestedUsers] = useState<MemberDisplay[]>([]); 
  const [loadingList, setLoadingList] = useState(false); 
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [isDissolving, setIsDissolving] = useState(false);

  useEffect(() => {
    if (isOpen && selectedChat?.id && selectedChat.isGroup && currentUser?.token) {
      fetchGroupMembers();
    }
  }, [isOpen, selectedChat, currentUser]);

  useEffect(() => {
    if (activeTab === "add" && isOpen) {
      const fetchSuggestions = async () => {
        setLoadingList(true);
        try {
          let rawData: any[] = [];
          if (!searchTerm.trim()) {
            rawData = await getFriendsApi(currentUser.token);
          } else {
            rawData = []; 
          }
          const currentMemberIds = new Set(members.map(m => m.userId));
          const mappedSuggestions: MemberDisplay[] = rawData.map((u: any) => ({
            id: 0, 
            userId: u.id, 
            name: u.fullName || u.name || u.username || `User ${u.id}`, 
            username: u.username,
            avatar: u.avatar,
            role: null,
            isInGroup: currentMemberIds.has(u.id)
          }));
          setSuggestedUsers(mappedSuggestions);
        } catch (error) {
          console.error("Lỗi tải danh sách gợi ý:", error);
        } finally {
          setLoadingList(false);
        }
      };
      const timeoutId = setTimeout(() => {
        fetchSuggestions();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [activeTab, searchTerm, isOpen, members, currentUser.token]);

  const fetchGroupMembers = async () => {
    try {
      const data = await getGroupMembersApi(currentUser.token, selectedChat.id);
      const mappedMembers: MemberDisplay[] = data.map((m: any) => ({
        id: m.id, 
        userId: m.user?.id || m.user_id,
        name: m.user?.fullName || m.user?.username || `User ${m.user_id}`,
        avatar: m.user?.avatar,
        role: m.role,
        isInGroup: true
      }));
      setMembers(mappedMembers);
      const myMemberInfo = mappedMembers.find(m => m.userId === currentUser.id);
      setIsCurrentUserAdmin(myMemberInfo?.role === 'admin');
    } catch (error) {
      console.error("Lỗi tải thành viên nhóm:", error);
    }
  };

  const handleAddMember = async (userIdToAdd: number) => {
    setProcessingId(userIdToAdd);
    try {
      await addGroupMemberApi(currentUser.token, selectedChat.id, userIdToAdd);
      setSuggestedUsers(prev => prev.map(u => 
        u.userId === userIdToAdd ? { ...u, isInGroup: true } : u
      ));
      fetchGroupMembers();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Thêm thất bại.";
      if (errorMessage.toLowerCase().includes("kiểm duyệt") || error.response?.status === 403) {
        alert("Đã gửi yêu cầu tham gia tới Admin.");
      } else {
        alert(`Lỗi: ${errorMessage}`);
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleRemoveMember = async (userIdToRemove: number) => {
    if (!isCurrentUserAdmin) return;
    if (!confirm("Bạn có chắc muốn xóa thành viên này?")) return;
    
    setProcessingId(userIdToRemove);
    try {
      await removeGroupMemberApi(currentUser.token, selectedChat.id, userIdToRemove);
      setMembers(prev => prev.filter((m) => m.userId !== userIdToRemove));
    } catch (error: any) {
      alert(error.response?.data?.message || "Xóa thất bại");
    } finally {
      setProcessingId(null);
    }
  };

  // --- HÀM GIẢI TÁN NHÓM ĐÃ SỬA ---
  const handleDissolveGroup = async () => {
    const confirmMsg = `CẢNH BÁO: Hành động này không thể hoàn tác!\n\nToàn bộ tin nhắn và thành viên sẽ bị xóa vĩnh viễn.\nBạn có chắc chắn muốn giải tán nhóm "${selectedChat.name}" không?`;
    
    if (!window.confirm(confirmMsg)) return;

    setIsDissolving(true);
    try {
        await dissolveGroupApi(currentUser.token, selectedChat.id);
        
        // 1. Gọi callback prop (nếu có)
        if (onGroupDeleted) {
            onGroupDeleted(selectedChat.id);
        }

        // 2. 🔥 BẮN SỰ KIỆN TOÀN CỤC ĐỂ SIDEBAR BẮT ĐƯỢC 🔥
        // Chúng ta gửi ID của nhóm bị xóa đi
        const event = new CustomEvent("group-deleted-success", { detail: selectedChat.id });
        window.dispatchEvent(event);
        
        onClose(); 
        
    } catch (error: any) {
        console.error("Lỗi giải tán nhóm:", error);
        alert(error.response?.data?.message || "Có lỗi xảy ra khi giải tán nhóm.");
    } finally {
        setIsDissolving(false);
    }
  };

  const getAvatarSrc = (avatar: string | null | undefined) => {
    return avatar || anhmacdinh.src;
  };

  if (!isOpen || !selectedChat?.isGroup) return null;
  const isCreator = selectedChat.creator_id === currentUser.id;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] z-10">
        
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
          <h3 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
            <Users size={20} className="text-blue-600" /> 
            Thông tin nhóm
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-200 rounded-full dark:hover:bg-gray-700 transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <button
            onClick={() => setActiveTab("members")}
            className={`flex-1 py-3 text-sm font-medium transition-all relative ${
              activeTab === "members" ? "text-blue-600 dark:text-blue-400" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            Thành viên ({members.length})
            {activeTab === "members" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400" />}
          </button>
          <button
            onClick={() => { setActiveTab("add"); setSearchTerm(""); }}
            className={`flex-1 py-3 text-sm font-medium transition-all relative ${
              activeTab === "add" ? "text-blue-600 dark:text-blue-400" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            Thêm người mới
            {activeTab === "add" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400" />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-0 bg-white dark:bg-gray-800 custom-scrollbar flex flex-col">
          {activeTab === "members" && (
            <div className="flex flex-col h-full">
                <div className="p-2 flex-1">
                {members.length === 0 ? (
                    <div className="flex justify-center py-8"><Loader2 className="animate-spin text-blue-500"/></div>
                ) : (
                    members.map((member) => (
                    <div key={member.userId} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors group">
                        <div className="flex items-center gap-3">
                        <Image
                            src={getAvatarSrc(member.avatar)}
                            alt={member.name}
                            width={44} height={44}
                            className="w-11 h-11 rounded-full object-cover border border-gray-100 dark:border-gray-600"
                        />
                        <div>
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-1">
                            {member.name}
                            {member.userId === currentUser.id && <span className="text-gray-400 font-normal text-xs">(Bạn)</span>}
                            </p>
                            {member.role === 'admin' ? (
                            <span className="text-[10px] bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400 px-2 py-0.5 rounded-full flex items-center w-fit gap-1 mt-0.5 font-medium">
                                <Shield size={10} className="fill-current" /> Admin
                            </span>
                            ) : (
                               <span className="text-[11px] text-gray-500 dark:text-gray-400">Thành viên</span>
                            )}
                        </div>
                        </div>
                        {isCurrentUserAdmin && member.userId !== currentUser.id && (
                        <button 
                            onClick={() => handleRemoveMember(member.userId)}
                            disabled={processingId === member.userId}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:opacity-50"
                        >
                            {processingId === member.userId ? <Loader2 size={18} className="animate-spin"/> : <Trash2 size={18} />}
                        </button>
                        )}
                    </div>
                    ))
                )}
                </div>
                {isCreator && (
                    <div className="p-4 border-t border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 mt-auto">
                        <div className="flex items-start gap-3 mb-3">
                            <AlertTriangle className="text-red-600 dark:text-red-500 shrink-0" size={20} />
                            <div>
                                <h4 className="text-sm font-bold text-red-700 dark:text-red-400">Danger Zone</h4>
                                <p className="text-xs text-red-600/80 dark:text-red-400/70 mt-1">
                                    Giải tán nhóm sẽ xóa vĩnh viễn tất cả tin nhắn và thành viên.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleDissolveGroup}
                            disabled={isDissolving}
                            className="w-full py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-600 hover:text-white dark:bg-transparent dark:border-red-800 dark:text-red-500 dark:hover:bg-red-900/50 dark:hover:text-red-200 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
                        >
                            {isDissolving ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                            {isDissolving ? "Đang xử lý..." : "Giải tán nhóm ngay"}
                        </button>
                    </div>
                )}
            </div>
          )}
          {activeTab === "add" && (
             <div className="flex flex-col h-full">
              <div className="p-4 bg-white dark:bg-gray-800 sticky top-0 z-10 border-b border-gray-100 dark:border-gray-700">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Nhập tên người dùng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-700 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 dark:text-white"
                  />
                </div>
                {selectedChat?.moderation && (
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-2 flex items-center gap-1">
                    <AlertCircle size={12}/> Chế độ kiểm duyệt đang bật: Admin sẽ duyệt yêu cầu.
                  </p>
                )}
              </div>
              <div className="flex-1 p-2 overflow-y-auto">
                <p className="px-2 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {searchTerm ? "Kết quả tìm kiếm" : "Bạn bè của bạn"}
                </p>
                {loadingList ? (
                   <div className="flex justify-center py-8 text-gray-400"><Loader2 className="animate-spin"/></div>
                ) : suggestedUsers.length === 0 ? (
                   <div className="flex flex-col items-center justify-center py-10 text-center">
                      <Users size={30} className="text-gray-300 dark:text-gray-600 mb-2"/>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        {searchTerm ? "Không tìm thấy người dùng nào." : "Bạn chưa có bạn bè nào."}
                      </p>
                   </div>
                ) : (
                  suggestedUsers.map((user) => (
                    <div key={user.userId} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors">
                      <div className="flex items-center gap-3">
                          <Image
                            src={getAvatarSrc(user.avatar)}
                            alt={user.name}
                            width={40} height={40}
                            className="w-10 h-10 rounded-full object-cover border border-gray-100 dark:border-gray-600"
                          />
                          <div>
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{user.name}</p>
                            {user.username && <p className="text-xs text-gray-500">@{user.username}</p>}
                          </div>
                      </div>
                      {user.isInGroup ? (
                        <span className="text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400 px-3 py-1.5 rounded-lg flex items-center gap-1">
                          <Check size={12}/> Đã tham gia
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAddMember(user.userId)}
                          disabled={processingId === user.userId}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg flex items-center gap-1 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100 shadow-sm"
                        >
                          {processingId === user.userId ? (
                             <Loader2 size={14} className="animate-spin"/>
                          ) : (
                             <><UserPlus size={14}/> Thêm</>
                          )}
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}