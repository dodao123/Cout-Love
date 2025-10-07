"use client";

import { createContext, useContext, useRef, useState, useEffect, ReactNode } from 'react';

interface AudioContextType {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  currentMusic: string | null;
  setCurrentMusic: (music: string | null) => void;
  playMusic: (musicUrl: string) => void;
  pauseMusic: () => void;
  toggleMusic: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMusic, setCurrentMusic] = useState<string | null>(null);
  const [userToggledMusic, setUserToggledMusic] = useState(false);

  const playMusic = (musicUrl: string) => {
    if (audioRef.current && musicUrl !== currentMusic) {
      audioRef.current.src = musicUrl;
      audioRef.current.loop = true;
      setCurrentMusic(musicUrl);
    }
    
    if (audioRef.current && !isPlaying) {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setUserToggledMusic(true);
        })
        .catch(err => console.log('Play failed:', err));
    }
  };

  const pauseMusic = () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      setUserToggledMusic(true);
    }
  };

  const toggleMusic = () => {
    if (isPlaying) {
      pauseMusic();
    } else if (currentMusic) {
      playMusic(currentMusic);
    }
  };

  // Auto-play when music changes (if not user-toggled)
  useEffect(() => {
    if (currentMusic && audioRef.current && !userToggledMusic) {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.log('Auto-play prevented:', err));
    }
  }, [currentMusic, userToggledMusic]);

  // Reset user toggle when music changes
  useEffect(() => {
    setUserToggledMusic(false);
  }, [currentMusic]);

  return (
    <AudioContext.Provider value={{
      audioRef,
      isPlaying,
      setIsPlaying,
      currentMusic,
      setCurrentMusic,
      playMusic,
      pauseMusic,
      toggleMusic
    }}>
      {children}
      {/* Global Audio Element */}
      <audio 
        ref={audioRef} 
        preload="auto"
        playsInline
        style={{ display: 'none' }}
      />
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}