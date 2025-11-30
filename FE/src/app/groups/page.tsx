// src/app/groups/page.tsx

import GroupContent from "./GroupContent";

// 👈 Dòng quan trọng để fix lỗi build
export const dynamic = "force-dynamic";

export default function GroupsPage() {
  return <GroupContent />;
}