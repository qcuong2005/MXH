import { Save, Loader2 } from "lucide-react";

interface SaveButtonProps {
  isLoading?: boolean;
  onClick?: () => void;
}

export default function SaveButton({ isLoading = false, onClick }: SaveButtonProps) {
  return (
    <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-700">
      <button
        onClick={onClick}
        disabled={isLoading}
        className={`px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-2xl hover:bg-blue-700 transition-all flex items-center gap-3 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed`}
      >
        {isLoading ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          <Save className="w-6 h-6" />
        )}
        <span>{isLoading ? "Đang lưu..." : "Lưu thay đổi"}</span>
      </button>
    </div>
  );
}