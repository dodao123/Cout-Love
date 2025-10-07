"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface Album {
  slug: string;
  name: string;
  subtitle?: string;
  template: string;
  photos: string[];
  createdAt: string;
}

export default function GalleryPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    try {
      const response = await fetch('/api/albums');
      if (response.ok) {
        const data = await response.json();
        setAlbums(data);
      }
    } catch (error) {
      console.error('Error fetching albums:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTemplatePreview = (template: string) => {
    const colors = {
      template1: 'from-pink-400 to-purple-400',
      template2: 'from-indigo-400 to-purple-400',
      template3: 'from-emerald-400 to-cyan-400',
      template4: 'from-rose-400 to-pink-400'
    };
    return colors[template as keyof typeof colors] || 'from-gray-400 to-gray-600';
  };

  const getTemplateName = (template: string) => {
    const names = {
      template1: 'Classic Slideshow',
      template2: 'Floating Elements',
      template3: 'Split Layout',
      template4: 'Ken Burns Effect'
    };
    return names[template as keyof typeof names] || 'Unknown Template';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Album Slideshow
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Trang Chủ
              </Link>
              <Link 
                href="/admin" 
                className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
              >
                Tạo Album Mới
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Gallery Album
          </h1>
          <p className="text-xl text-gray-600">
            Khám phá những album trình chiếu tuyệt đẹp
          </p>
        </div>

        {albums.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Chưa có album nào
            </h3>
            <p className="text-gray-600 mb-8">
              Hãy tạo album đầu tiên của bạn để bắt đầu
            </p>
            <Link
              href="/admin"
              className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-pink-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
            >
              Tạo Album Mới
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {albums.map((album) => (
              <div
                key={album.slug}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                {/* Album Preview */}
                <div className="aspect-video relative">
                  {album.photos.length > 0 ? (
                    <Image
                      src={`/uploads/${album.photos[0]}`}
                      alt={album.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${getTemplatePreview(album.template)} flex items-center justify-center`}>
                      <div className="text-center text-white">
                        <div className="w-16 h-16 bg-white/20 rounded-lg mx-auto mb-2"></div>
                        <p className="text-sm font-medium">No Images</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Template Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                      {getTemplateName(album.template)}
                    </span>
                  </div>
                  
                  {/* Photo Count */}
                  <div className="absolute top-3 right-3">
                    <span className="bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                      {album.photos.length} ảnh
                    </span>
                  </div>
                </div>

                {/* Album Info */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                    {album.name}
                  </h3>
                  {album.subtitle && (
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {album.subtitle}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {new Date(album.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                    <Link
                      href={`/${album.slug}`}
                      className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-pink-600 hover:to-purple-600 transition-all"
                    >
                      Xem Album
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}