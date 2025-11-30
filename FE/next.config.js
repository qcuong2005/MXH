/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
    images: {
    // Cho phép load ảnh từ IP của bạn và Unsplash
    domains: ["222.255.117.234", "images.unsplash.com"], 
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      // QUAN TRỌNG: Thêm đoạn này để cho phép load ảnh qua HTTP (vì bạn đang dùng IP)
      {
        protocol: "http",
        hostname: "**",
      },
    ],
    // Tắt cảnh báo ảnh không tối ưu (nếu cần)
    unoptimized: true, 
  },
};
//   images: {
//     domains: ["localhost", "images.unsplash.com"],
//     remotePatterns: [
//       {
//         protocol: "https",
//         hostname: "**",
//       },
//     ],
//   },
//   typescript: {
//     ignoreBuildErrors: false,
//   },
//   eslint: {
//     ignoreDuringBuilds: false,
//   },
//   unoptimized: true, 
//  };

module.exports = nextConfig;
