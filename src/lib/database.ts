import { readFile, writeFile } from "fs/promises";
import { join } from "path";

export interface Album {
  slug: string;
  name: string;
  subtitle?: string;
  template: string;
  photos: string[];
  createdAt: string;
}

const DB_FILE = join(process.cwd(), "data", "albums.json");

// Đảm bảo thư mục data tồn tại
async function ensureDataDir() {
  const { mkdir } = await import("fs/promises");
  const dataDir = join(process.cwd(), "data");
  try {
    await mkdir(dataDir, { recursive: true });
  } catch (error) {
    // Thư mục đã tồn tại
  }
}

// Đọc dữ liệu từ file JSON
export async function readAlbums(): Promise<Album[]> {
  try {
    await ensureDataDir();
    const data = await readFile(DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    // File chưa tồn tại, trả về mảng rỗng
    return [];
  }
}

// Ghi dữ liệu vào file JSON
export async function writeAlbums(albums: Album[]): Promise<void> {
  await ensureDataDir();
  await writeFile(DB_FILE, JSON.stringify(albums, null, 2));
}

// Thêm album mới
export async function addAlbum(album: Album): Promise<void> {
  const albums = await readAlbums();
  albums.push(album);
  await writeAlbums(albums);
}

// Tìm album theo slug
export async function findAlbumBySlug(slug: string): Promise<Album | null> {
  const albums = await readAlbums();
  return albums.find(album => album.slug === slug) || null;
}

// Cập nhật album
export async function updateAlbum(slug: string, updates: Partial<Album>): Promise<void> {
  const albums = await readAlbums();
  const index = albums.findIndex(album => album.slug === slug);
  if (index !== -1) {
    albums[index] = { ...albums[index], ...updates };
    await writeAlbums(albums);
  }
}

// Xóa album
export async function deleteAlbum(slug: string): Promise<void> {
  const albums = await readAlbums();
  const filteredAlbums = albums.filter(album => album.slug !== slug);
  await writeAlbums(filteredAlbums);
}