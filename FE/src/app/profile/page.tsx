// "use client";

// import Sidebar from "@/components/Sidebar";
// import Header from "@/components/Header";
// import ProfileHeader from "@/components/ProfileHeader";

// export default function Profile() {
//   return (
//     <div className="flex h-screen bg-gray-50">
//       <Sidebar />
//       <div className="flex-1 flex flex-col">
//         <Header />
//         <main className="flex-1 overflow-y-auto">
//           <div className="max-w-5xl mx-auto p-4 md:p-8">
//             <ProfileHeader />
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }
"use client";

import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import ProfileHeader from "@/components/ProfileHeader";

export default function Profile() {
  const searchParams = useSearchParams();
  const paramUserId = searchParams.get("userId") ? Number(searchParams.get("userId")) : undefined;
  console.log(paramUserId)
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto p-4 md:p-8">
            <ProfileHeader userId={paramUserId} />
          </div>
        </main>
      </div>
    </div>
  );
}