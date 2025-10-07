"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminInfo, setAdminInfo] = useState<{ adminAccount: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check authentication and load theme
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking authentication...');
        const response = await fetch('/api/admin/verify', {
          credentials: 'include'
        });
        console.log('Auth response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Auth data:', data);
          setIsAuthenticated(true);
          setAdminInfo(data.admin);
        } else {
          console.log('Auth failed, redirecting to login');
          router.push('/admin/Login');
          return;
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/admin/Login');
        return;
      } finally {
        setIsLoading(false);
        setIsHydrated(true);
      }
    };

    // Add a small delay to ensure cookies are available
    setTimeout(checkAuth, 200);

    // Load theme
    try {
      const storedTheme = localStorage.getItem('theme');
      const storedBool = localStorage.getItem('darkMode');
      if (storedTheme === 'dark' || storedBool === 'true') {
        setIsDarkMode(true);
      }
    } catch {
      // ignore errors
    }
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/Login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Show loading state until authentication is verified
  if (!isHydrated || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-gray-600 text-xl">Đang xác thực...</div>
          </div>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      {/* Header */}
      <div className={`sticky top-0 z-50 backdrop-blur-xl border-b shadow-lg transition-all duration-500 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-black via-85% to-80% border-gray-700/50' 
          : 'bg-white/70 border-blue-100'
      }`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3 group">
              <h1 className={`text-2xl font-black bg-clip-text text-transparent tracking-tight group-hover:scale-105 transition-transform ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-zinc-50 via-gray-300 to-zinc-400' 
                  : 'bg-gradient-to-r from-rose-600 via-emerald-800 to-blue-700'
              }`}>
                Admin Panel
              </h1>
              </Link>
            
            <div className="flex items-center gap-4">
              {adminInfo && (
                <div className={`px-3 py-2 rounded-lg ${
                  isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-blue-100 text-blue-800'
                }`}>
                  <span className="text-sm font-medium">
                    👤 {adminInfo.adminAccount}
                  </span>
                </div>
              )}
              
              <Link 
                href="/" 
                className={`px-4 py-2 rounded-full transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                Về Trang Chủ
              </Link>
              
              <button
                onClick={handleLogout}
                className={`px-4 py-2 rounded-full transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                Đăng Xuất
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className={`lg:col-span-1 ${
            isDarkMode ? 'bg-slate-800/50' : 'bg-white/50'
          } rounded-2xl p-6 backdrop-blur-sm border ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <h2 className={`text-xl font-bold mb-6 ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>
              Quản lý
            </h2>
            
            <nav className="space-y-2">
              <Link
                href="/admin/addAlbum"
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 block ${
                  isDarkMode 
                    ? 'text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                📸 Thêm Album Mới
              </Link>
              
              <Link
                href="/admin/managerAlbum"
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 block ${
                  isDarkMode 
                    ? 'text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                📚 Quản lý Albums
              </Link>
              
              <button
                onClick={() => setActiveTab("analytics")}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 ${
                  activeTab === "analytics"
                    ? isDarkMode 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-blue-500 text-white'
                    : isDarkMode 
                      ? 'text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                📊 Thống kê
              </button>
      </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === "dashboard" && (
              <div className={`${
                isDarkMode ? 'bg-slate-800/50' : 'bg-white/50'
              } rounded-2xl p-8 backdrop-blur-sm border ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <h2 className={`text-2xl font-bold mb-6 ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  Dashboard
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  <div className={`p-6 rounded-lg border ${
                    isDarkMode ? 'bg-slate-700 border-gray-600' : 'bg-white border-gray-200'
                  }`}>
                    <h3 className={`text-lg font-semibold mb-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                      Tổng Albums
                    </h3>
                    <p className={`text-3xl font-bold ${
                      isDarkMode ? 'text-blue-400' : 'text-blue-600'
                    }`}>
                      0
                    </p>
                  </div>
                  
                  <div className={`p-6 rounded-lg border ${
                    isDarkMode ? 'bg-slate-700 border-gray-600' : 'bg-white border-gray-200'
                  }`}>
                    <h3 className={`text-lg font-semibold mb-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                      Lượt Xem
                    </h3>
                    <p className={`text-3xl font-bold ${
                      isDarkMode ? 'text-green-400' : 'text-green-600'
                    }`}>
                      0
                    </p>
            </div>
                  
                  <div className={`p-6 rounded-lg border ${
                    isDarkMode ? 'bg-slate-700 border-gray-600' : 'bg-white border-gray-200'
                  }`}>
                    <h3 className={`text-lg font-semibold mb-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                      Lượt Thích
                    </h3>
                    <p className={`text-3xl font-bold ${
                      isDarkMode ? 'text-pink-400' : 'text-pink-600'
                    }`}>
                      0
                    </p>
            </div>
          </div>

                <div className="space-y-4">
                  <h3 className={`text-xl font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    Hành động nhanh
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link
                      href="/admin/addAlbum"
                      className={`p-6 rounded-lg border transition-all duration-300 hover:scale-105 ${
                        isDarkMode 
                          ? 'bg-slate-700 border-gray-600 hover:bg-slate-600' 
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${
                          isDarkMode ? 'bg-blue-600' : 'bg-blue-500'
                        }`}>
                          <span className="text-white text-xl">📸</span>
                        </div>
                        <div>
                          <h4 className={`font-semibold ${
                            isDarkMode ? 'text-white' : 'text-gray-800'
                          }`}>
                            Tạo Album Mới
                          </h4>
                          <p className={`text-sm ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            Thêm album tình yêu mới
                          </p>
                        </div>
                      </div>
                    </Link>
                    
                    <div className={`p-6 rounded-lg border ${
                      isDarkMode ? 'bg-slate-700 border-gray-600' : 'bg-white border-gray-200'
                    }`}>
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${
                          isDarkMode ? 'bg-green-600' : 'bg-green-500'
                        }`}>
                          <span className="text-white text-xl">📚</span>
                        </div>
                        <div>
                          <h4 className={`font-semibold ${
                            isDarkMode ? 'text-white' : 'text-gray-800'
                          }`}>
                            Quản lý Albums
                          </h4>
                          <p className={`text-sm ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            Xem và chỉnh sửa albums
                </p>
              </div>
            </div>
          </div>
                  </div>
                </div>
            </div>
          )}

            {activeTab === "manage-albums" && (
              <div className={`${
                isDarkMode ? 'bg-slate-800/50' : 'bg-white/50'
              } rounded-2xl p-8 backdrop-blur-sm border ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <h2 className={`text-2xl font-bold mb-6 ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  Quản lý Albums
                </h2>
                <p className={`${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Tính năng này sẽ được phát triển trong tương lai.
                </p>
              </div>
            )}

            {activeTab === "analytics" && (
              <div className={`${
                isDarkMode ? 'bg-slate-800/50' : 'bg-white/50'
              } rounded-2xl p-8 backdrop-blur-sm border ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <h2 className={`text-2xl font-bold mb-6 ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  Thống kê
                </h2>
                <p className={`${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Tính năng này sẽ được phát triển trong tương lai.
                </p>
              </div>
            )}
            </div>
        </div>
      </div>
    </div>
  );
}