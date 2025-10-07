"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { fetchWithCache } from "@/lib/fetchWithCache";
import { useAudio } from "@/lib/AudioContext";

// Ảnh internet
const RANDOM_IMAGES = [
  "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1465101178521-c1a9136a3fd2?auto=format&fit=crop&w=400&q=80"
];

interface Album {
  _id?: string;
  id?: string;
  name: string;
  createdAt: string;
  coverImage: string;
  slug: string;
  dayStart: string;
  subtitle?: string;
  template: string;
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
  views?: number;
  likes?: number;
}

function getRandomImages(n = 2) {
  const shuffled = [...RANDOM_IMAGES].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

export default function PrevSlugPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { playMusic, isPlaying, toggleMusic } = useAudio();
  const [album, setAlbum] = useState<Album | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const loadAlbum = async () => {
      try {
        setIsLoading(true);
        const albumData = await fetchWithCache(`/api/albums/${slug}`, { cacheTime: 10 * 60 * 1000 }) as Album;
          // Transform API data to match component interface
          const transformedAlbum: Album = {
            id: albumData._id || albumData.slug,
            _id: albumData._id,
            name: albumData.name,
            createdAt: albumData.createdAt,
            coverImage: albumData.coverImage || '/uploads/placeholder.jpg',
            slug: albumData.slug,
            dayStart: albumData.dayStart,
            subtitle: albumData.subtitle,
            template: albumData.template,
            maleAvatar: albumData.maleAvatar,
            femaleAvatar: albumData.femaleAvatar,
            photos: albumData.photos || [],
            music: albumData.music,
            messages: albumData.messages,
            quote: albumData.quote,
            letterNotes: albumData.letterNotes || [],
            views: albumData.views || 0,
            likes: albumData.likes || 0
          };
          setAlbum(transformedAlbum);
          
          // Play music if available
          if (transformedAlbum.music) {
            playMusic(transformedAlbum.music);
          }
      } catch (error) {
        console.error('Error loading album:', error);
        setAlbum(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      loadAlbum();
    }
  }, [slug]);

   // Load theme from localStorage after hydration
   useEffect(() => {
    try {
      const storedTheme = localStorage.getItem("theme");
      const storedBool = localStorage.getItem("darkMode");
      if (storedTheme === "dark" || storedBool === "true") {
        setIsDarkMode(true);
      } else if (storedTheme === "light" || storedBool === "false") {
        setIsDarkMode(false);
      }
    } catch {}
    setIsHydrated(true);
  }, []);

  // Save theme to localStorage when it changes
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem("theme", isDarkMode ? "dark" : "light");
        localStorage.setItem("darkMode", isDarkMode ? "true" : "false");
      } catch {}
    }
  }, [isDarkMode, isHydrated]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  // Ensure music can start on first user interaction in browsers blocking autoplay
  useEffect(() => {
    if (!album?.music) return;
    if (isPlaying) return;

    let attempted = false;
    const handler = (e: Event) => {
      if (attempted) return;
      // Ignore interactions on the audio toggle button
      const target = e.target as HTMLElement | null;
      if (target && target.closest('[data-audio-toggle="true"]')) {
        return;
      }
      attempted = true;
      try {
        playMusic(album.music as string);
      } catch {}
      window.removeEventListener('click', handler);
      window.removeEventListener('touchstart', handler);
      window.removeEventListener('keydown', handler);
    };

    window.addEventListener('click', handler, { once: true });
    window.addEventListener('touchstart', handler, { once: true });
    window.addEventListener('keydown', handler, { once: true });

    return () => {
      window.removeEventListener('click', handler);
      window.removeEventListener('touchstart', handler);
      window.removeEventListener('keydown', handler);
    };
  }, [album?.music, isPlaying, playMusic]);

  if (isLoading) {
    return (
      <div
        className={`h-screen flex items-center justify-center transition-all duration-500 ${
          isDarkMode
            ? "bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800"
            : "bg-gradient-to-br from-blue-200 via-pink-100 to-pink-200"
        }`}
      >
        <div className="text-center">
          <div
            className={`animate-spin rounded-full h-10 w-10 border-b-4 mx-auto mb-4 ${
              isDarkMode ? "border-pink-300" : "border-pink-500"
            }`}
          ></div>
          <div
            className={`text-lg font-medium ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Đang tải…
          </div>
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <div
        className={`h-screen flex items-center justify-center transition-all duration-500 ${
          isDarkMode
            ? "bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800"
            : "bg-gradient-to-br from-blue-200 via-pink-100 to-pink-200"
        }`}
      >
        <div className="text-center px-4">
          <h1
            className={`text-2xl font-bold mb-4 ${
              isDarkMode ? "text-gray-200" : "text-gray-800"
            }`}
          >
            Album không tồn tại
          </h1>
          <Link
            href="/"
            className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-4 py-2 rounded-full hover:shadow-lg transition-all inline-block"
          >
            Về Trang Chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center transition-all duration-500 px-2 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-800"
          : "bg-gradient-to-br from-blue-200 via-pink-100 to-pink-200"
      }`}
    >
      {/* Audio Control Button */}
      {album?.music && (
        <button
          onClick={toggleMusic}
          data-audio-toggle="true"
          className={`absolute top-4 left-4 z-50 backdrop-blur-sm p-2 rounded-full hover:scale-110 transition-all shadow-lg ${
            isDarkMode 
              ? 'bg-gray-800/80 text-gray-200 hover:bg-gray-800' 
              : 'bg-white/80 text-gray-700 hover:bg-white'
          }`}
          aria-label={isPlaying ? "Tắt âm thanh" : "Bật âm thanh"}
        >
          {isPlaying ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              <path d="M2 2l20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          )}
        </button>
      )}

      {/* Dark/Light mode toggle */}
      <button
        onClick={toggleDarkMode}
        className={`absolute top-3 right-3 z-50 p-2 rounded-full hover:scale-110 transition-all shadow-lg ${
          isDarkMode
            ? "bg-gray-800/80 text-gray-200 hover:bg-gray-800"
            : "bg-white/80 text-gray-700 hover:bg-white"
        }`}
        aria-label={isDarkMode ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
      >
        {isDarkMode ? (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
          </svg>

        ) : (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
          </svg>
        )}
      </button>

      {/* Card */}
      <div className="w-full max-w-lg  rounded-3xl shadow-2xl overflow-hidden relative p-6 mt-8">
        {/* Title */}
        <h1 className={`text-3xl font-bold tracking-wide text-center drop-shadow-lg mb-2 ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>
          {album.name}
        </h1>
        {album.subtitle && (
          <p className={`text-center italic mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-700'
          }`}>{album.subtitle}</p>
        )}

        {/* Avatars (ảnh nam/nữ từ album) */}
        <div className="flex items-center justify-center gap-8 my-6">
          <div className="rounded-full border-4 border-blue-200 shadow-xl p-1 bg-white/60 backdrop-blur-md">
            <img
              src={album.maleAvatar || album.photos[0] || album.coverImage}
              alt="Avatar Nam"
              width={120}
              height={120}
              className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover"
              loading="lazy"
              draggable={false}
            />
          </div>
          <span className="text-3xl md:text-4xl text-pink-400 animate-pulse">💖</span>
          <div className="rounded-full border-4 border-pink-200 shadow-xl p-1 bg-white/60 backdrop-blur-md">
            <img
              src={album.femaleAvatar || album.photos[1] || album.coverImage}
              alt="Avatar Nữ"
              width={120}
              height={120}
              className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover"
              loading="lazy"
              draggable={false}
            />
          </div>
        </div>

        {/* Heart + CTA */}
        <div className="flex flex-col items-center mb-4">
          <div className="bg-pink-200 rounded-full w-14 h-14 flex items-center justify-center animate-bounce shadow-2xl ring-4 ring-pink-50 mb-2">
            <span className="text-3xl text-white">💗</span>
          </div>
          <Link
            href={`/${album.slug}`}
            className={`mt-2 font-bold py-2 px-8 text-lg rounded-xl border-2 shadow transition ${
              isDarkMode 
                ? 'bg-gradient-to-tr from-cyan-950 via-gray-800 to-fuchsia-200 text-white border-pink-200 hover:bg-pink-50' 
                : 'bg-gradient-to-tr from-cyan-200 via-gray-200 to-fuchsia-200 text-black border-pink-300 hover:bg-pink-100'
            }`}
          >
            Cùng xem nha
          </Link>
        </div>
      </div>
      {/* Quote tình yêu */}
      <div className="mt-8 text-center max-w-md px-2">
      <p className={`text-base md:text-lg italic ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>
          {album.quote || "Tình yêu là khi hai trái tim cùng chung một nhịp..."}
        </p>
      </div>
      {/* Decorative global styles */}
      <style jsx global>{`
        * { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}
