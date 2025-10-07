"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useDropzone } from "react-dropzone";
import Image from "next/image";

interface PhotoWithNote {
  file: File;
  note: string;
  preview: string;
}

interface LetterNote {
  title: string;
  content: string[]; // Array of lines
  date: string;
}

export default function AddAlbumPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Album creation states
  const [albumName, setAlbumName] = useState("");
  const [albumSubtitle, setAlbumSubtitle] = useState("");
  const [dayStart, setDayStart] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("template1");
  const [malePhoto, setMalePhoto] = useState<File | null>(null);
  const [femalePhoto, setFemalePhoto] = useState<File | null>(null);
  const [photosWithNotes, setPhotosWithNotes] = useState<PhotoWithNote[]>([]);
  
  // Music states
  const [musicFile, setMusicFile] = useState<File | null>(null);
  const [musicPreview, setMusicPreview] = useState<string>("");
  const [uploadedMusicUrl, setUploadedMusicUrl] = useState<string>("");
  
  // Letter notes states
  const [letterNotes, setLetterNotes] = useState<LetterNote[]>([]);
  const [currentNote, setCurrentNote] = useState({ title: "", content: "", date: "" });
  const [quote, setQuote] = useState("");
  
  const [isUploading, setIsUploading] = useState(false);
  const [createdSlug, setCreatedSlug] = useState("");

  // Load theme from localStorage
  useEffect(() => {
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

  const onDropPhotos = (acceptedFiles: File[]) => {
    const newPhotos: PhotoWithNote[] = acceptedFiles.map(file => ({
      file,
      note: "",
      preview: URL.createObjectURL(file)
    }));
    setPhotosWithNotes(prev => [...prev, ...newPhotos]);
  };

  const { getRootProps: getPhotosRootProps, getInputProps: getPhotosInputProps, isDragActive: isPhotosDragActive } = useDropzone({
    onDrop: onDropPhotos,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: true
  });

  const onDropMale = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setMalePhoto(acceptedFiles[0]);
    }
  };

  const { getRootProps: getMaleRootProps, getInputProps: getMaleInputProps, isDragActive: isMaleDragActive } = useDropzone({
    onDrop: onDropMale,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: false
  });

  const onDropFemale = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFemalePhoto(acceptedFiles[0]);
    }
  };

  const { getRootProps: getFemaleRootProps, getInputProps: getFemaleInputProps, isDragActive: isFemaleDragActive } = useDropzone({
    onDrop: onDropFemale,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: false
  });

  const onDropMusic = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setMusicFile(file);
      setMusicPreview(URL.createObjectURL(file));
      setUploadedMusicUrl("");
    }
  };

  const { getRootProps: getMusicRootProps, getInputProps: getMusicInputProps, isDragActive: isMusicDragActive } = useDropzone({
    onDrop: onDropMusic,
    accept: {
      'audio/mpeg': ['.mp3'],
      'audio/x-ms-wma': ['.wma']
    },
    multiple: false
  });

  const removePhoto = (index: number) => {
    setPhotosWithNotes(prev => {
      const newPhotos = prev.filter((_, i) => i !== index);
      URL.revokeObjectURL(prev[index].preview);
      return newPhotos;
    });
  };

  const updatePhotoNote = (index: number, note: string) => {
    setPhotosWithNotes(prev => prev.map((photo, i) => 
      i === index ? { ...photo, note } : photo
    ));
  };

  const addLetterNote = () => {
    if (currentNote.title.trim() && currentNote.content.trim()) {
      // Split content by newlines and filter out empty lines
      const lines = currentNote.content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      const newNote = {
        ...currentNote,
        content: lines // Store as array of lines
      };
      
      setLetterNotes(prev => [...prev, newNote]);
      setCurrentNote({ title: "", content: "", date: "" });
    }
  };

  const removeLetterNote = (index: number) => {
    setLetterNotes(prev => prev.filter((_, i) => i !== index));
  };

  const removeMusic = () => {
    if (musicPreview) {
      URL.revokeObjectURL(musicPreview);
    }
    setMusicFile(null);
    setMusicPreview("");
    setUploadedMusicUrl("");
  };

  const createAlbum = async () => {
    if (!albumName.trim() || !dayStart || !malePhoto || !femalePhoto || photosWithNotes.length === 0) {
      alert("Vui lòng điền đầy đủ thông tin: tên album, ngày bắt đầu yêu, ảnh nam/nữ và ít nhất 1 ảnh album");
      return;
    }

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('name', albumName);
      formData.append('subtitle', albumSubtitle);
      formData.append('dayStart', dayStart);
      formData.append('template', selectedTemplate);
      formData.append('malePhoto', malePhoto);
      formData.append('femalePhoto', femalePhoto);
      
      // Add music file if exists
      if (uploadedMusicUrl) {
        formData.append('musicUrl', uploadedMusicUrl);
      } else if (musicFile) {
        // Chunked upload to /api/upload to avoid proxy 413
        const chunkSize = 200 * 1024; // 200KB per chunk for strict proxies
        const totalChunks = Math.ceil(musicFile.size / chunkSize);
        const uploadId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

        for (let i = 0; i < totalChunks; i++) {
          const start = i * chunkSize;
          const end = Math.min(start + chunkSize, musicFile.size);
          const blob = musicFile.slice(start, end);
          const chunkForm = new FormData();
          chunkForm.append('file', new File([blob], musicFile.name, { type: musicFile.type }));
          chunkForm.append('type', 'audio');
          chunkForm.append('uploadId', uploadId);
          chunkForm.append('fileName', musicFile.name);
          chunkForm.append('chunkIndex', String(i));
          chunkForm.append('totalChunks', String(totalChunks));
          const res = await fetch('/api/upload', { method: 'POST', body: chunkForm });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || `Upload chunk ${i} failed`);
          }
          // On last chunk capture URL
          if (i === totalChunks - 1) {
            const data = await res.json();
            if (data?.url) {
              formData.append('musicUrl', data.url);
              setUploadedMusicUrl(data.url);
            }
          }
        }
      }
      
      // Add photos with notes
      photosWithNotes.forEach((photoWithNote) => {
        formData.append(`photos`, photoWithNote.file);
        formData.append(`photoNotes`, photoWithNote.note);
      });

      // Add letter notes
      formData.append('letterNotes', JSON.stringify(letterNotes));
      formData.append('quote', quote);

      const response = await fetch('/api/albums', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        setCreatedSlug(result.album.slug);
        alert(`Album "${albumName}" đã được tạo thành công!`);
        
        // Reset form
        setAlbumName("");
        setAlbumSubtitle("");
        setDayStart("");
        setMalePhoto(null);
        setFemalePhoto(null);
        setPhotosWithNotes([]);
        setLetterNotes([]);
        setCurrentNote({ title: "", content: "", date: "" });
        setQuote("");
        setMusicFile(null);
        setMusicPreview("");
      } else {
        const error = await response.json();
        alert(`Lỗi: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating album:', error);
      alert('Có lỗi xảy ra khi tạo album');
    } finally {
      setIsUploading(false);
    }
  };

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
            <Link href="/admin" className="flex items-center gap-3 group">
              <h1 className={`text-2xl font-black bg-clip-text text-transparent tracking-tight group-hover:scale-105 transition-transform ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-zinc-50 via-gray-300 to-zinc-400' 
                  : 'bg-gradient-to-r from-rose-600 via-emerald-800 to-blue-700'
              }`}>
                Tạo Album Mới
              </h1>
            </Link>
            
            <div className="flex items-center gap-4">
              <Link 
                href="/admin"
                className={`px-4 py-2 rounded-full transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                Quay lại Admin
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className={`${
          isDarkMode ? 'bg-slate-800/50' : 'bg-white/50'
        } rounded-2xl p-8 backdrop-blur-sm border ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h2 className={`text-2xl font-bold mb-6 ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            Thông tin Album
          </h2>

          <div className="space-y-6">
            {/* Album Name */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Tên Album *
              </label>
              <input
                type="text"
                value={albumName}
                onChange={(e) => setAlbumName(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-slate-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                }`}
                placeholder="Nhập tên album..."
              />
            </div>

            {/* Album Subtitle */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Phụ đề Album
              </label>
              <input
                type="text"
                value={albumSubtitle}
                onChange={(e) => setAlbumSubtitle(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-slate-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                }`}
                placeholder="Nhập phụ đề album..."
              />
            </div>

            {/* Day Start */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Ngày Bắt Đầu Yêu *
              </label>
              <input
                type="date"
                value={dayStart}
                onChange={(e) => setDayStart(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-slate-700 border-gray-600 text-white focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                }`}
                aria-label="Ngày bắt đầu yêu"
                title="Ngày bắt đầu yêu"
              />
            </div>

            {/* Template Selection */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Template
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-slate-700 border-gray-600 text-white focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                }`}
                aria-label="Chọn template"
              >
                <option value="template1">Template 1 - Classic</option>
                <option value="template2">Template 2 - Modern</option>
                <option value="template3">Template 3 - Romantic</option>
                <option value="template4">Template 4 - Minimalist</option>
              </select>
            </div>

            {/* Male and Female Photos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Male Avatar */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Avatar Nam *
                </label>
                <div
                  {...getMaleRootProps()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-300 ${
                    isMaleDragActive
                      ? isDarkMode 
                        ? 'border-blue-400 bg-blue-900/20' 
                        : 'border-blue-400 bg-blue-50'
                      : isDarkMode 
                        ? 'border-gray-600 hover:border-gray-500' 
                        : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input {...getMaleInputProps()} />
                  {malePhoto ? (
                    <div className="space-y-2">
                      <Image
                        src={URL.createObjectURL(malePhoto)}
                        alt="Avatar nam preview"
                        width={100}
                        height={100}
                        className="mx-auto rounded-full object-cover"
                      />
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {malePhoto.name}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMalePhoto(null);
                        }}
                        className="text-red-500 text-sm hover:text-red-700"
                      >
                        Xóa avatar
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {isMaleDragActive ? 'Thả ảnh vào đây' : 'Kéo thả ảnh hoặc click để chọn'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Female Avatar */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Avatar Nữ *
                </label>
                <div
                  {...getFemaleRootProps()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-300 ${
                    isFemaleDragActive
                      ? isDarkMode 
                        ? 'border-pink-400 bg-pink-900/20' 
                        : 'border-pink-400 bg-pink-50'
                      : isDarkMode 
                        ? 'border-gray-600 hover:border-gray-500' 
                        : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input {...getFemaleInputProps()} />
                  {femalePhoto ? (
                    <div className="space-y-2">
                      <Image
                        src={URL.createObjectURL(femalePhoto)}
                        alt="Avatar nữ preview"
                        width={100}
                        height={100}
                        className="mx-auto rounded-full object-cover"
                      />
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {femalePhoto.name}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFemalePhoto(null);
                        }}
                        className="text-red-500 text-sm hover:text-red-700"
                      >
                        Xóa avatar
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {isFemaleDragActive ? 'Thả ảnh vào đây' : 'Kéo thả ảnh hoặc click để chọn'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Album Photos */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Ảnh Album *
              </label>
              <div
                {...getPhotosRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-300 ${
                  isPhotosDragActive
                    ? isDarkMode 
                      ? 'border-green-400 bg-green-900/20' 
                      : 'border-green-400 bg-green-50'
                    : isDarkMode 
                      ? 'border-gray-600 hover:border-gray-500' 
                      : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input {...getPhotosInputProps()} />
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {isPhotosDragActive ? 'Thả ảnh vào đây' : 'Kéo thả ảnh hoặc click để chọn nhiều ảnh'}
                </p>
              </div>

              {/* Photo List with Notes */}
              {photosWithNotes.length > 0 && (
                <div className="mt-4 space-y-4">
                  {photosWithNotes.map((photoWithNote, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${
                      isDarkMode ? 'bg-slate-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex gap-4">
                        <Image
                          src={photoWithNote.preview}
                          alt={`Photo ${index + 1}`}
                          width={80}
                          height={80}
                          className="rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="flex-1">
                          <p className={`text-sm font-medium mb-2 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            {photoWithNote.file.name}
                          </p>
                          <textarea
                            value={photoWithNote.note}
                            onChange={(e) => updatePhotoNote(index, e.target.value)}
                            className={`w-full px-3 py-2 rounded-lg border text-sm ${
                              isDarkMode 
                                ? 'bg-slate-600 border-gray-500 text-white placeholder-gray-400' 
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                            }`}
                            placeholder="Thêm ghi chú cho ảnh này..."
                            rows={2}
                            aria-label={`Ghi chú cho ảnh ${index + 1}`}
                          />
                        </div>
                        <button
                          onClick={() => removePhoto(index)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quote Section */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Quote Tình Yêu
              </label>
              <textarea
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-slate-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                }`}
                placeholder="Nhập quote tình yêu đẹp..."
                rows={3}
              />
            </div>

            {/* Music Section */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Nhạc Nền Album
              </label>
              <div
                {...getMusicRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-300 ${
                  isMusicDragActive
                    ? isDarkMode 
                      ? 'border-purple-400 bg-purple-900/20' 
                      : 'border-purple-400 bg-purple-50'
                    : isDarkMode 
                      ? 'border-gray-600 hover:border-gray-500' 
                      : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input {...getMusicInputProps()} />
                {musicFile ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center">
                      <div className={`p-3 rounded-full ${
                        isDarkMode ? 'bg-purple-600' : 'bg-purple-500'
                      }`}>
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {musicFile.name}
                      </p>
                      <p className={`text-xs ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {(musicFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <audio controls className="w-full max-w-xs">
                        <source src={musicPreview} type={musicFile.type} />
                        Trình duyệt không hỗ trợ phát audio.
                      </audio>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeMusic();
                      }}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        isDarkMode 
                          ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20' 
                          : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                      }`}
                    >
                      Xóa nhạc
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-center mb-2">
                      <div className={`p-3 rounded-full ${
                        isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                      }`}>
                        <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {isMusicDragActive ? 'Thả file nhạc vào đây' : 'Kéo thả file nhạc hoặc click để chọn'}
                    </p>
                    <p className={`text-xs mt-1 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Hỗ trợ: MP3, WMA (Tối đa 10MB)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Letter Notes Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Lá Thư Tình Yêu
                </label>
                <span className={`text-xs ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {letterNotes.length} lá thư đã thêm
                </span>
              </div>
              
              {/* Add new note form */}
              <div className={`p-4 rounded-lg border mb-4 ${
                isDarkMode ? 'bg-slate-700 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Tiêu đề
                    </label>
                    <input
                      type="text"
                      value={currentNote.title}
                      onChange={(e) => setCurrentNote(prev => ({ ...prev, title: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border text-sm ${
                        isDarkMode 
                          ? 'bg-slate-600 border-gray-500 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      placeholder="Tiêu đề lá thư..."
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Ngày
                    </label>
                    <input
                      type="date"
                      value={currentNote.date}
                      onChange={(e) => setCurrentNote(prev => ({ ...prev, date: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border text-sm ${
                        isDarkMode 
                          ? 'bg-slate-600 border-gray-500 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      aria-label="Ngày của lá thư"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Nội dung
                  </label>
                  <textarea
                    value={currentNote.content}
                    onChange={(e) => setCurrentNote(prev => ({ ...prev, content: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${
                      isDarkMode 
                        ? 'bg-slate-600 border-gray-500 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Nhập nội dung lá thư tình yêu...&#10;Mỗi dòng sẽ thành một câu riêng biệt&#10;Ví dụ:&#10;Chúc anh béo 1 ngày vui vẻ hạnh phúc&#10;Yêu anh nhiều lắm ❤️"
                    rows={4}
                    aria-label="Nội dung lá thư"
                  />
                </div>
                <button
                  onClick={addLetterNote}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  Thêm Lá Thư
                </button>
              </div>

              {/* List of added notes */}
              {letterNotes.length > 0 && (
                <div className="space-y-4">
                  <h4 className={`text-lg font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    Danh sách lá thư ({letterNotes.length})
                  </h4>
                  {letterNotes.map((note, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${
                      isDarkMode ? 'bg-slate-700 border-gray-600' : 'bg-white border-gray-200'
                    }`}>
                      <div className="flex justify-between items-start mb-2">
                        <h5 className={`font-medium ${
                          isDarkMode ? 'text-white' : 'text-gray-800'
                        }`}>
                          {note.title}
                        </h5>
                        <button
                          onClick={() => removeLetterNote(index)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Xóa
                        </button>
                      </div>
                      <p className={`text-sm mb-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {note.date}
                      </p>
                      <div className={`text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {Array.isArray(note.content) ? (
                          <ul className="list-disc list-inside space-y-1">
                            {note.content.map((line, idx) => (
                              <li key={idx}>&quot;{line}&quot;</li>
                            ))}
                          </ul>
                        ) : (
                          <p>{note.content}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Create Button */}
            <div className="pt-6">
              <button
                onClick={createAlbum}
                disabled={isUploading}
                className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition-all duration-300 ${
                  isUploading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                }`}
              >
                {isUploading ? 'Đang tạo album...' : 'Tạo Album'}
              </button>
            </div>

            {/* Success Message */}
            {createdSlug && (
              <div className={`p-4 rounded-lg ${
                isDarkMode ? 'bg-green-900/20 border border-green-700' : 'bg-green-50 border border-green-200'
              }`}>
                <p className={`text-green-600 ${
                  isDarkMode ? 'text-green-400' : 'text-green-600'
                }`}>
                  ✅ Album đã được tạo thành công! 
                  <Link href={`/${createdSlug}`} className="underline ml-2">
                    Xem album
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
