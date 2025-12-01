// GoldenTick.tsx
import React from 'react';

const GoldenTick = () => {
  return (
    <span
      title="Tài khoản VIP đã xác minh"
      // Sử dụng 'group' để kích hoạt hiệu ứng hover
      className="group ml-1 inline-flex items-center justify-center relative align-middle"
    >
      {/* SVG 2 lớp: Nền răng cưa vàng + Tích trắng bên trong 
      */}
      <svg
   
        viewBox="0 0 24 24"
        // w-6 h-6: Kích thước icon (điều chỉnh nếu muốn to/nhỏ hơn)
        // text-amber-500: Màu vàng chính cho phần răng cưa
        // drop-shadow: Tạo hiệu ứng phát sáng nhẹ
        className="w-6 h-6 text-amber-500 drop-shadow-sm transition-transform duration-300 group-hover:scale-110"
      >
        {/* LỚP 1: Nền Huy Hiệu Răng Cưa (Seal) - Màu Vàng */}
        <path
          fill="currentColor" // Nhận màu từ class text-amber-500 ở trên
          // Đây là path vẽ hình huy hiệu nhiều cánh (răng cưa)
          d="M12 2l2.4 2.4 2.4-2.4 2.4 2.4 2.4-2.4 2.4 2.4-2.4 2.4 2.4 2.4-2.4 2.4 2.4 2.4-2.4 2.4 2.4 2.4-2.4 2.4-2.4 2.4-2.4-2.4-2.4 2.4-2.4-2.4-2.4 2.4-2.4-2.4-2.4 2.4-2.4-2.4-2.4 2.4-2.4-2.4z"
        />
        
        {/* LỚP 2: Dấu Tích (Checkmark) - Màu Trắng */}
        <path
          fill="white" // Màu trắng cứng
          // Path vẽ dấu tích nằm gọn ở giữa
          d="M10 15.5l-3.5-3.5 1.4-1.4L10 12.7l7.1-7.1 1.4 1.4z"
        />
      </svg>

      {/* Tùy chọn: Lớp phát sáng động nền phía sau (Nếu muốn rực rỡ hơn nữa thì bỏ comment) */}
      {/* <div className="absolute inset-1 rounded-full blur-md bg-amber-400/40 animate-pulse -z-10"></div> */}
    </span>
  );
};

export default GoldenTick;