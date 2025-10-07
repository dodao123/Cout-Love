"use client";

import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface Album {
  _id: string;
  slug: string;
  name: string;
  subtitle?: string;
  dayStart: string;
  template: string;
  coverImage: string;
  maleAvatar?: string;
  femaleAvatar?: string;
  photos: string[];
  music?: string;
  messages?: { [key: string]: string };
  quote?: string;
  letterNotes?: Array<{
    title: string;
    content: string[];
    date: string;
  }>;
  views: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  createdBy: string;
  tags: string[];
  settings: {
    autoPlay: boolean;
    showCounter: boolean;
    allowComments: boolean;
  };
}

export default function ManagerAlbumPage() {
  // const router = useRouter();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isThemeLoaded, setIsThemeLoaded] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredAlbums, setFilteredAlbums] = useState<Album[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load theme from localStorage after component mounts
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem('theme');
      const storedBool = localStorage.getItem('darkMode');
      if (storedTheme === 'dark' || storedBool === 'true') {
        setIsDarkMode(true);
      } else if (storedTheme === 'light' || storedBool === 'false') {
        setIsDarkMode(false);
      }
    } catch {
      // ignore errors
    } finally {
      setIsThemeLoaded(true);
    }
  }, []);

  // Load albums
  useEffect(() => {
    const loadAlbums = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/admin/albums?limit=100', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setAlbums(data.albums || []);
        } else {
          console.error('Failed to load albums');
        }
      } catch (error) {
        console.error('Error loading albums:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAlbums();
  }, []);

  // Filter albums based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredAlbums(albums);
    } else {
      const filtered = albums.filter(album =>
        album.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (album.subtitle && album.subtitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
        album.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredAlbums(filtered);
    }
  }, [albums, searchTerm]);

  const handleDelete = async (album: Album) => {
    const confirmed = window.confirm(`Xóa album "${album.name}"? Tất cả ảnh/audio và dữ liệu liên quan sẽ bị xóa.`);
    if (!confirmed) return;

    try {
      setDeletingId(album._id);
      const res = await fetch(`/api/admin/albums?id=${encodeURIComponent(album._id)}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Xóa album thất bại');
      }
      // Optimistic UI update
      setAlbums(prev => prev.filter(a => a._id !== album._id));
    } catch (err) {
      console.error(err);
      alert((err as Error).message || 'Có lỗi xảy ra khi xóa album');
    } finally {
      setDeletingId(null);
    }
  };

  // Calculate days in love
  const calculateDaysInLove = (dayStart: string) => {
    const start = new Date(dayStart);
    const now = new Date();
    const diffTime = now.getTime() - start.getTime();
    if (diffTime >= 0) {
      return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }
    return 0;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isThemeLoaded || isLoading) {
    return (
      <div className={`h-screen flex items-center justify-center transition-all duration-500 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800' 
          : 'bg-gradient-to-br from-rose-100 via-pink-50 to-orange-50'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 mx-auto mb-4 border-rose-500"></div>
          <div className="text-lg font-medium text-gray-700">Đang tải danh sách album...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800' 
        : 'bg-gradient-to-br from-rose-100 via-pink-50 to-orange-50'
    }`}>
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Quản Lý Album
              </h1>
              <p className={`text-lg mt-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Tổng cộng {albums.length} album
              </p>
            </div>
            
            <div className="flex gap-4">
              <Link
                href="/admin/addAlbum"
                className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-medium"
              >
                + Thêm Album Mới
              </Link>
              <Link
                href="/admin"
                className={`px-6 py-3 rounded-lg border-2 transition-all font-medium ${
                  isDarkMode 
                    ? 'border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white' 
                    : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-900'
                }`}
              >
                ← Quay Lại
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm album theo tên, mô tả hoặc tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full px-4 py-3 pl-12 rounded-lg border-2 transition-all ${
              isDarkMode 
                ? 'bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-rose-500' 
                : 'bg-white/50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-rose-500'
            }`}
          />
          <svg 
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Albums Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {filteredAlbums.length === 0 ? (
          <div className="text-center py-12">
            <div className={`text-6xl mb-4 ${
              isDarkMode ? 'text-gray-600' : 'text-gray-400'
            }`}>
              📸
            </div>
            <h3 className={`text-xl font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {searchTerm ? 'Không tìm thấy album nào' : 'Chưa có album nào'}
            </h3>
            <p className={`text-base ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {searchTerm ? 'Thử tìm kiếm với từ khóa khác' : 'Hãy tạo album đầu tiên của bạn'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAlbums.map((album) => (
              <div
                key={album._id}
                className={`rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                  isDarkMode 
                    ? 'bg-gray-800/50 border border-gray-700' 
                    : 'bg-white/50 border border-gray-200'
                }`}
              >
                {/* Album Cover */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={album.coverImage}
                    alt={album.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Days Counter */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-sm font-bold text-rose-500">
                      {calculateDaysInLove(album.dayStart)} ngày
                    </span>
                  </div>
                  
                  {/* Public/Private Badge */}
                  <div className={`absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-medium ${
                    album.isPublic 
                      ? 'bg-green-500/90 text-white' 
                      : 'bg-gray-500/90 text-white'
                  }`}>
                    {album.isPublic ? 'Công khai' : 'Riêng tư'}
                  </div>
                </div>

                {/* Album Info */}
                <div className="p-4">
                  <h3 className={`text-lg font-bold mb-2 line-clamp-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {album.name}
                  </h3>
                  
                  {album.subtitle && (
                    <p className={`text-sm mb-3 line-clamp-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {album.subtitle}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                      </svg>
                      <span>{album.views} lượt xem</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
                      </svg>
                      <span>{album.likes} thích</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
                      </svg>
                      <span>{album.photos.length} ảnh</span>
                    </div>
                  </div>

                  {/* Created Date */}
                  <p className={`text-xs mb-2 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Tạo ngày: {formatDate(album.createdAt)}
                  </p>

                  {/* URLs Section */}
                  <div className="space-y-2 mb-4">
                    {/* PrevSlug URL */}
                    <div className={`text-xs p-2 rounded border ${
                      isDarkMode 
                        ? 'bg-gray-800/50 border-gray-600 text-gray-300' 
                        : 'bg-gray-50 border-gray-200 text-gray-600'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd"/>
                        </svg>
                        <span className="font-medium">Preview URL:</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className={`text-xs font-mono break-all flex-1 ${
                          isDarkMode ? 'text-blue-300' : 'text-blue-600'
                        }`}>
                          {typeof window !== 'undefined' ? window.location.origin : ''}/prevSlug/{album.slug}
                        </code>
                        <button
                          onClick={(e) => {
                            const url = `${window.location.origin}/prevSlug/${album.slug}`;
                            navigator.clipboard.writeText(url).then(() => {
                              const button = e.target as HTMLButtonElement;
                              const originalText = button.textContent;
                              button.textContent = '✓';
                              setTimeout(() => {
                                button.textContent = originalText;
                              }, 1000);
                            }).catch(err => console.error('Failed to copy:', err));
                          }}
                          className={`px-2 py-1 text-xs rounded transition-all ${
                            isDarkMode 
                              ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                          }`}
                          title="Copy Preview URL"
                        >
                          📋
                        </button>
                      </div>
                    </div>

                    {/* Full Album URL */}
                    <div className={`text-xs p-2 rounded border ${
                      isDarkMode 
                        ? 'bg-gray-800/50 border-gray-600 text-gray-300' 
                        : 'bg-gray-50 border-gray-200 text-gray-600'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 114 0 2 2 0 01-4 0zm8 0a2 2 0 114 0 2 2 0 01-4 0z" clipRule="evenodd"/>
                        </svg>
                        <span className="font-medium">Full Album URL:</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className={`text-xs font-mono break-all flex-1 ${
                          isDarkMode ? 'text-green-300' : 'text-green-600'
                        }`}>
                          {typeof window !== 'undefined' ? window.location.origin : ''}/{album.slug}
                        </code>
                        <button
                          onClick={(e) => {
                            const url = `${window.location.origin}/${album.slug}`;
                            navigator.clipboard.writeText(url).then(() => {
                              const button = e.target as HTMLButtonElement;
                              const originalText = button.textContent;
                              button.textContent = '✓';
                              setTimeout(() => {
                                button.textContent = originalText;
                              }, 1000);
                            }).catch(err => console.error('Failed to copy:', err));
                          }}
                          className={`px-2 py-1 text-xs rounded transition-all ${
                            isDarkMode 
                              ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                          }`}
                          title="Copy Full Album URL"
                        >
                          📋
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link
                      href={`/prevSlug/${album.slug}`}
                      className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-center py-2 px-3 rounded-lg text-sm font-medium hover:shadow-lg transition-all"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      👁️ Xem Trước
                    </Link>
                    <Link
                      href={`/${album.slug}`}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-center py-2 px-3 rounded-lg text-sm font-medium hover:shadow-lg transition-all"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      🎨 Xem Album
                    </Link>
                    <button
                      onClick={() => handleDelete(album)}
                      disabled={deletingId === album._id}
                      className={`flex-1 text-white text-center py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        deletingId === album._id
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-red-500 to-rose-600 hover:shadow-lg'
                      }`}
                    >
                      {deletingId === album._id ? 'Đang xóa…' : '🗑️ Xóa'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Global Styles */}
      <style jsx global>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
