"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLogin() {
  const [adminAccount, setAdminAccount] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsHydrated(true);
    try {
      const storedTheme = localStorage.getItem('theme');
      const storedBool = localStorage.getItem('darkMode');
      if (storedTheme === 'dark' || storedBool === 'true') {
        setIsDarkMode(true);
      }
    } catch {
      // ignore errors
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminAccount, password }),
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (response.ok) {
        console.log('Login successful, redirecting to /admin');
        // Simple redirect without middleware interference
        setTimeout(() => {
          window.location.href = '/admin';
        }, 100);
      } else {
        setError(data.error || 'Login failed');
        setIsLoading(false);
      }
    } catch (error) {
      setError('Network error. Please try again.');
      setIsLoading(false);
    }
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-600 text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      {/* Background Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {isDarkMode ? (
          <>
            <div className="absolute w-96 h-96 bg-gray-700/20 rounded-full blur-3xl animate-float" style={{ top: '10%', left: '10%' }} />
            <div className="absolute w-72 h-72 bg-gray-600/20 rounded-full blur-3xl animate-float-delayed" style={{ top: '60%', right: '10%' }} />
            <div className="absolute w-80 h-80 bg-gray-500/20 rounded-full blur-3xl animate-float-slow" style={{ bottom: '10%', left: '30%' }} />
          </>
        ) : (
          <>
            <div className="absolute w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-float" style={{ top: '10%', left: '10%' }} />
            <div className="absolute w-72 h-72 bg-cyan-400/10 rounded-full blur-3xl animate-float-delayed" style={{ top: '60%', right: '10%' }} />
            <div className="absolute w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl animate-float-slow" style={{ bottom: '10%', left: '30%' }} />
          </>
        )}
      </div>

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
                Admin Login
              </h1>
            </Link>
            
            <div className="flex items-center gap-4">
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
            </div>
          </div>
        </div>
      </div>

      {/* Login Form */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-4rem)] px-6">
        <div className={`w-full max-w-md ${
          isDarkMode ? 'bg-slate-800/50' : 'bg-white/50'
        } rounded-2xl p-8 backdrop-blur-sm border ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        } shadow-2xl`}>
          <div className="text-center mb-8">
            <h2 className={`text-3xl font-bold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>
              🔐 Admin Login
            </h2>
            <p className={`${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Đăng nhập vào hệ thống quản trị
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Tài khoản Admin
              </label>
              <input
                type="text"
                value={adminAccount}
                onChange={(e) => setAdminAccount(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 ${
                  isDarkMode 
                    ? 'bg-slate-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500' 
                    : 'bg-white border-gray-300 text-gray-700 placeholder-gray-400 focus:ring-blue-500'
                }`}
                placeholder="Nhập tài khoản admin"
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Mật khẩu
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 ${
                  isDarkMode 
                    ? 'bg-slate-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500' 
                    : 'bg-white border-gray-300 text-gray-700 placeholder-gray-400 focus:ring-blue-500'
                }`}
                placeholder="Nhập mật khẩu"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:scale-105 shadow-lg hover:shadow-xl'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Đang đăng nhập...
                </div>
              ) : (
                'Đăng Nhập'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Quên mật khẩu? Liên hệ quản trị viên hệ thống
            </p>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(5deg); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-40px) rotate(-5deg); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 7s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
