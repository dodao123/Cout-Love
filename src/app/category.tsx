"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchWithCache } from "@/lib/fetchWithCache";
import "@/lib/cacheDebug";

interface Album {
  _id?: string;
  id?: string;
  name: string;
  createdAt: string;
  coverImage: string;
  slug: string;
  subtitle?: string;
  dayStart?: string;
  template?: string;
  maleAvatar?: string;
  femaleAvatar?: string;
  photos?: string[];
  quote?: string;
  letterNotes?: Array<{
    title: string;
    content: string[];
    date: string;
  }>;
  views?: number;
  likes?: number;
}

export default function Category({ isDarkMode = false }: { isDarkMode?: boolean }) {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Load albums from API
  useEffect(() => {
    const loadAlbums = async () => {
      try {
        setIsLoading(true);
        const data = await fetchWithCache('/api/albums', { cacheTime: 5 * 60 * 1000 }) as { albums: Album[] };
          // Transform API data to match component interface
          const transformedAlbums = data.albums.map((album: Album) => ({
            id: album._id || album.slug,
            _id: album._id,
            name: album.name,
            createdAt: album.createdAt,
            coverImage: album.coverImage || '/uploads/placeholder.jpg',
            slug: album.slug,
            subtitle: album.subtitle,
            dayStart: album.dayStart,
            template: album.template,
            maleAvatar: album.maleAvatar,
            femaleAvatar: album.femaleAvatar,
            photos: album.photos || [],
            quote: album.quote,
            letterNotes: album.letterNotes || [],
            views: album.views || 0,
            likes: album.likes || 0
          }));
          setAlbums(transformedAlbums);
      } catch (error) {
        console.error('Error loading albums:', error);
        // Fallback to empty array
        setAlbums([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAlbums();
  }, []);

  const itemsPerPage = 6; // 3 cột x 2 hàng
  const totalPages = Math.ceil(albums.length / itemsPerPage);
  const currentAlbums = albums.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <section className={`py-20 ${
        isDarkMode
          ? 'bg-gradient-to-br from-black via-slate-800 to-slate-900'
          : 'bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100'
      }`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className={`text-4xl font-black mb-4 ${
              isDarkMode
                ? 'bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent'
                : 'bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-700 bg-clip-text text-transparent'
            }`}>
              Album Khách Hàng 
            </h2>
            <h2 >
            📸
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-lg`}>Những khoảnh khắc đẹp nhất của các cặp đôi</p>
          </div>
          
          {/* Loading Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, idx) => (
              <div key={idx} className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-2xl p-6 shadow-lg animate-pulse`}>
                <div className={`${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'} aspect-video rounded-xl mb-4`}></div>
                <div className={`${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'} h-6 rounded mb-2`}></div>
                <div className={`${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'} h-4 rounded w-2/3`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-20 relative overflow-hidden ${
      isDarkMode 
        ? 'bg-gradient-to-r from-black via-zinc-900 to-black'
        : 'bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100'
    }`}>
      {/* Background Decorations */}
      <div className="absolute inset-0 opacity-5">
        <div className={`absolute top-20 left-20 w-32 h-32 rounded-full blur-3xl animate-float ${
          isDarkMode ? 'bg-gray-950' : 'bg-blue-400'
        }`} />
        <div className={`absolute bottom-20 right-20 w-40 h-40 rounded-full blur-3xl animate-float-delayed ${
          isDarkMode ? 'bg-gray-500' : 'bg-cyan-400'
        }`} />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 
            className="text-4xl md:text-5xl font-black mb-4"
            style={{
              fontFamily: "'Fredoka', sans-serif",
              backgroundImage: isDarkMode 
                ? 'linear-gradient(135deg, #e5e7eb, #d1d5db, #9ca3af)'
                : 'linear-gradient(135deg, #1e40af, #06b6d4, #3b82f6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              
            }}
          >
            Album Khách Hàng 📸
          </h2>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-lg max-w-2xl mx-auto`}>
            Những khoảnh khắc đẹp nhất của các cặp đôi được lưu giữ tại My Store
          </p>
        </div>

        {/* Albums Grid - 3 columns x 2 rows */}
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {currentAlbums.map((album, idx) => (
              <Link 
                key={album.id}
                href={`/prevSlug/${album.slug}`}
                className={`group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ${
                  isDarkMode ? 'bg-zinc-900 border border-zinc-800' : 'bg-white'
                }`}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Album Cover Image */}
                <div className="relative aspect-video overflow-hidden">
                  <img 
                    src={album.coverImage} 
                    alt={album.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  
                  {/* Overlay Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${
                    isDarkMode ? 'from-black/70' : 'from-black/50'
                  } via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  
                  {/* View Icon */}
                  <div className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 ${
                    isDarkMode ? 'bg-slate-900/80' : 'bg-white/90'
                  }`}>
                    <svg className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                </div>

                {/* Album Info */}
                <div className="p-6">
                  <h3 
                    className={`text-xl font-bold mb-2 transition-colors line-clamp-2 ${
                      isDarkMode ? 'text-white group-hover:text-gray-200' : 'text-gray-800 group-hover:text-blue-600'
                    }`}
                    style={{ fontFamily: "'Nunito', sans-serif" }}
                  >
                    {album.name}
                  </h3>
                  
                  <div className={`flex items-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}` }>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(album.createdAt)}
                  </div>
                </div>

                {/* Hover Effect Border */}
                <div className={`absolute inset-0 border-2 border-transparent rounded-2xl transition-colors duration-300 ${
                  isDarkMode ? 'group-hover:border-gray-400' : 'group-hover:border-blue-400'
                }`} />
              </Link>
            ))}
          </div>

          {/* Navigation Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className={`flex items-center gap-2 px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 ${
                  isDarkMode ? 'bg-zinc-900 text-gray-300' : 'bg-white text-blue-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Trước
              </button>

              {/* Page Indicators */}
              <div className="flex gap-2">
                {[...Array(totalPages)].map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(idx)}
                    title={`Trang ${idx + 1}`}
                    className={`w-3 h-3 rounded-full transition-all ${
                      idx === currentPage 
                        ? (isDarkMode ? 'bg-gray-300 scale-125' : 'bg-blue-600 scale-125') 
                        : (isDarkMode ? 'bg-zinc-700 hover:bg-zinc-600' : 'bg-gray-300 hover:bg-gray-400')
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
                className={`flex items-center gap-2 px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 ${
                  isDarkMode ? 'bg-zinc-900 text-gray-300' : 'bg-white text-blue-600'
                }`}
              >
                Sau
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link 
            href="/gallery"
            className={`inline-flex items-center gap-2 px-8 py-4 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 ${
              isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-600' : 'bg-gradient-to-r from-blue-600 to-cyan-500'
            }`}
          >
            Xem Tất Cả Album
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
}
