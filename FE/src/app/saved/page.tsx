"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import {
  Bookmark,
  Heart,
  Share2,
  MessageCircle,
  MoreVertical,
  Filter,
  Search,
} from "lucide-react";

export default function SavedPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  // Mock data for saved posts
  const savedPosts = [
    {
      id: 1,
      title: "Amazing sunset view",
      content:
        "Just witnessed the most beautiful sunset from my balcony. Nature never fails to amaze me! 🌅",
      author: "John Doe",
      authorAvatar: "/api/placeholder/40/40",
      image: "/api/placeholder/600/400",
      likes: 245,
      comments: 18,
      shares: 12,
      savedAt: "2024-01-15",
      category: "photos",
    },
    {
      id: 2,
      title: "Recipe for success",
      content:
        "Here are 5 habits that changed my life completely. Number 3 will surprise you!",
      author: "Jane Smith",
      authorAvatar: "/api/placeholder/40/40",
      image: null,
      likes: 89,
      comments: 23,
      shares: 45,
      savedAt: "2024-01-14",
      category: "articles",
    },
    {
      id: 3,
      title: "Travel tips",
      content:
        "Planning a trip to Japan? Here are some essential tips you need to know before going.",
      author: "Mike Johnson",
      authorAvatar: "/api/placeholder/40/40",
      image: "/api/placeholder/600/400",
      likes: 156,
      comments: 34,
      shares: 28,
      savedAt: "2024-01-13",
      category: "travel",
    },
    {
      id: 4,
      title: "Tech news update",
      content:
        "Latest AI developments that will revolutionize the industry in 2024.",
      author: "Sarah Wilson",
      authorAvatar: "/api/placeholder/40/40",
      image: null,
      likes: 312,
      comments: 67,
      shares: 89,
      savedAt: "2024-01-12",
      category: "tech",
    },
  ];

  const categories = [
    { id: "all", label: "All", count: savedPosts.length },
    {
      id: "photos",
      label: "Photos",
      count: savedPosts.filter((post) => post.category === "photos").length,
    },
    {
      id: "articles",
      label: "Articles",
      count: savedPosts.filter((post) => post.category === "articles").length,
    },
    {
      id: "travel",
      label: "Travel",
      count: savedPosts.filter((post) => post.category === "travel").length,
    },
    {
      id: "tech",
      label: "Tech",
      count: savedPosts.filter((post) => post.category === "tech").length,
    },
  ];

  const filteredPosts = savedPosts.filter((post) => {
    const matchesFilter =
      activeFilter === "all" || post.category === activeFilter;
    const matchesSearch =
      searchQuery === "" ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-4">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-2">
                <Bookmark className="w-8 h-8 text-blue-500" />
                <h1 className="text-2xl font-bold text-gray-900">
                  Saved Posts
                </h1>
              </div>
              <p className="text-gray-600">
                Your collection of saved posts and articles
              </p>
            </div>

            {/* Search and Filter */}
            <div className="mb-6 space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search saved posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveFilter(category.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      activeFilter === category.id
                        ? "bg-blue-500 text-white"
                        : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {category.label} ({category.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Saved Posts Grid */}
            <div className="space-y-6">
              {filteredPosts.length === 0 ? (
                <div className="text-center py-12">
                  <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No saved posts found
                  </h3>
                  <p className="text-gray-500">
                    {searchQuery
                      ? "Try adjusting your search terms"
                      : "Start saving posts to see them here"}
                  </p>
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                  >
                    {/* Post Header */}
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <img
                            src={post.authorAvatar}
                            alt={post.author}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {post.author}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Saved {post.savedAt}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            {post.category}
                          </span>
                          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <MoreVertical className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Post Content */}
                    <div className="p-4">
                      <h2 className="font-semibold text-gray-900 mb-2">
                        {post.title}
                      </h2>
                      <p className="text-gray-700 mb-4">{post.content}</p>

                      {post.image && (
                        <div className="mb-4">
                          <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-64 object-cover rounded-lg"
                          />
                        </div>
                      )}

                      {/* Post Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                          <button className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors">
                            <Heart className="w-5 h-5" />
                            <span className="text-sm">{post.likes}</span>
                          </button>
                          <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors">
                            <MessageCircle className="w-5 h-5" />
                            <span className="text-sm">{post.comments}</span>
                          </button>
                          <button className="flex items-center space-x-2 text-gray-600 hover:text-green-500 transition-colors">
                            <Share2 className="w-5 h-5" />
                            <span className="text-sm">{post.shares}</span>
                          </button>
                        </div>
                        <button className="text-blue-500 hover:text-blue-600 transition-colors">
                          <Bookmark className="w-5 h-5 fill-current" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
