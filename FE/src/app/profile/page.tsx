// File: src/app/profile/page.tsx

import ProfileContent from "./ProfileContent";

// Đây là cấu hình giúp bạn sửa lỗi prerender
export const dynamic = "force-dynamic";

export default function ProfilePage() {
  return <ProfileContent />;
}
