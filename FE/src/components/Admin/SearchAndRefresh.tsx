// app/admin/posts/components/SearchAndRefresh.tsx
import { Search, RefreshCw } from "lucide-react";

interface Props {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onRefresh: () => void;
  loading: boolean;
}

export default function SearchAndRefresh({ searchTerm, setSearchTerm, onRefresh, loading }: Props) {
  return (
    <div className="flex gap-3 w-full md:w-auto">
      <div className="bg-white rounded-full shadow-md border flex items-center flex-1 md:flex-initial">
        <Search className="text-gray-400 ml-4" size={20} />
        <input
          type="text"
          placeholder="Tìm kiếm bài viết, người đăng..."
          className="w-full px-4 py-3 outline-none text-gray-700"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <button
        onClick={onRefresh}
        className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-md"
        title="Làm mới dữ liệu"
      >
        <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
      </button>
    </div>
  );
}