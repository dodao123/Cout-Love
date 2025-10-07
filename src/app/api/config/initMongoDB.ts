import { MongoClient, Db } from 'mongodb';

// Lazy MongoDB connection - only connect when actually needed
function getMongoConfig() {
  const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
  const MONGO_DB = process.env.MONGO_DB || process.env.MONGODB_DB;

  if (!MONGO_URI) {
    throw new Error('Missing MongoDB connection string. Set MONGO_URI (or MONGODB_URI).');
  }

  if (!MONGO_DB) {
    throw new Error('Missing MongoDB database name. Set MONGO_DB (or MONGODB_DB).');
  }

  return { MONGO_URI, MONGO_DB };
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const { MONGO_URI, MONGO_DB } = getMongoConfig();
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(MONGO_DB);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

export interface Admin {
  _id?: string;
  adminAccount: string;
  hashPassword: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

// Database Schema Definitions
export interface User {
  _id?: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  preferences: {
    theme: 'light' | 'dark';
    language: string;
  };
}

export interface Album {
  _id?: string;
  slug: string;
  name: string;
  subtitle?: string;
  dayStart: string; // Ngày bắt đầu yêu
  template: 'template1' | 'template2' | 'template3' | 'template4';
  coverImage: string;
  maleAvatar?: string; // Avatar nam
  femaleAvatar?: string; // Avatar nữ
  photos: string[]; // Array of photo URLs
  quote?: string;
  letterNotes?: Array<{
    title: string;
    content: string[]; // Array of lines
    date: string;
  }>;
  music?: string; // Audio file URL
  messages?: { [key: string]: string }; // Messages for each photo
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  views: number;
  likes: number;
  createdBy: string; // User ID
  tags: string[];
  settings: {
    autoPlay: boolean;
    showCounter: boolean;
    allowComments: boolean;
  };
}

export interface Note {
  _id?: string;
  albumId: string; // Reference to Album
  title: string;
  content: string;
  date: string;
  author: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  comments: Comment[];
}

export interface Comment {
  _id?: string;
  noteId: string; // Reference to Note
  author: string;
  content: string;
  createdAt: Date;
  isApproved: boolean;
}

export interface Category {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  coverImage: string;
  albums: string[]; // Array of Album IDs
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Template {
  _id?: string;
  name: string;
  slug: string;
  description: string;
  previewImage: string;
  config: {
    layout: string;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
    fonts: {
      title: string;
      body: string;
    };
    animations: string[];
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Analytics {
  _id?: string;
  albumId: string;
  date: Date;
  views: number;
  uniqueViews: number;
  timeSpent: number; // in seconds
  interactions: {
    photoViews: { [photoIndex: string]: number };
    musicPlays: number;
    noteViews: number;
    shareCount: number;
  };
  userAgent?: string;
  ipAddress?: string;
}

// Database initialization
export async function initializeDatabase() {
  const { db } = await connectToDatabase();

  try {
    // Create collections with indexes
    await db.createCollection('users');
    await db.createCollection('albums');
    await db.createCollection('notes');
    await db.createCollection('comments');
    await db.createCollection('categories');
    await db.createCollection('templates');
    await db.createCollection('analytics');

    // Create indexes for better performance
    await createIndexes(db);

    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
}

async function createIndexes(db: Db) {
  // Users indexes
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  await db.collection('users').createIndex({ createdAt: -1 });

  // Albums indexes
  await db.collection('albums').createIndex({ slug: 1 }, { unique: true });
  await db.collection('albums').createIndex({ createdBy: 1 });
  await db.collection('albums').createIndex({ isPublic: 1 });
  await db.collection('albums').createIndex({ createdAt: -1 });
  await db.collection('albums').createIndex({ views: -1 });
  await db.collection('albums').createIndex({ tags: 1 });

  // Notes indexes
  await db.collection('notes').createIndex({ albumId: 1 });
  await db.collection('notes').createIndex({ createdAt: -1 });
  await db.collection('notes').createIndex({ isPublic: 1 });

  // Comments indexes
  await db.collection('comments').createIndex({ noteId: 1 });
  await db.collection('comments').createIndex({ createdAt: -1 });
  await db.collection('comments').createIndex({ isApproved: 1 });

  // Categories indexes
  await db.collection('categories').createIndex({ slug: 1 }, { unique: true });
  await db.collection('categories').createIndex({ isActive: 1 });
  await db.collection('categories').createIndex({ sortOrder: 1 });

  // Templates indexes
  await db.collection('templates').createIndex({ slug: 1 }, { unique: true });
  await db.collection('templates').createIndex({ isActive: 1 });

  // Analytics indexes
  await db.collection('analytics').createIndex({ albumId: 1, date: -1 });
  await db.collection('analytics').createIndex({ date: -1 });
}

// Sample data seeding
export async function seedSampleData() {
  const { db } = await connectToDatabase();

  try {
    // Sample templates
    const templates = [
      {
        name: 'Template 1 - Classic',
        slug: 'template1',
        description: 'Thiết kế cổ điển với khung ảnh đẹp',
        previewImage: '/templates/template1-preview.jpg',
        config: {
          layout: 'polaroid',
          colors: {
            primary: '#ec4899',
            secondary: '#f3e8ff',
            accent: '#fbbf24'
          },
          fonts: {
            title: 'Playfair Display',
            body: 'Quicksand'
          },
          animations: ['float', 'fade', 'slide']
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Template 2 - Modern',
        slug: 'template2',
        description: 'Thiết kế hiện đại với hiệu ứng động',
        previewImage: '/templates/template2-preview.jpg',
        config: {
          layout: 'grid',
          colors: {
            primary: '#3b82f6',
            secondary: '#dbeafe',
            accent: '#10b981'
          },
          fonts: {
            title: 'Fredoka',
            body: 'Nunito'
          },
          animations: ['bounce', 'pulse', 'rotate']
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Template 3 - Romantic',
        slug: 'template3',
        description: 'Thiết kế lãng mạn với hoa và trái tim',
        previewImage: '/templates/template3-preview.jpg',
        config: {
          layout: 'heart',
          colors: {
            primary: '#f43f5e',
            secondary: '#fdf2f8',
            accent: '#f59e0b'
          },
          fonts: {
            title: 'Dancing Script',
            body: 'Quicksand'
          },
          animations: ['float-hearts', 'sparkle', 'glow']
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Template 4 - Minimalist',
        slug: 'template4',
        description: 'Thiết kế tối giản, tập trung vào nội dung',
        previewImage: '/templates/template4-preview.jpg',
        config: {
          layout: 'clean',
          colors: {
            primary: '#6b7280',
            secondary: '#f9fafb',
            accent: '#8b5cf6'
          },
          fonts: {
            title: 'Inter',
            body: 'Inter'
          },
          animations: ['fade', 'slide-up']
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Sample categories
    const categories = [
      {
        name: 'Album Cưới',
        slug: 'album-cuoi',
        description: 'Những khoảnh khắc đẹp nhất trong ngày cưới',
        coverImage: '/categories/wedding-cover.jpg',
        albums: [],
        isActive: true,
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Kỷ Niệm Yêu',
        slug: 'ky-niem-yeu',
        description: 'Những ngày tháng yêu thương',
        coverImage: '/categories/love-cover.jpg',
        albums: [],
        isActive: true,
        sortOrder: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Du Lịch',
        slug: 'du-lich',
        description: 'Những chuyến đi đáng nhớ',
        coverImage: '/categories/travel-cover.jpg',
        albums: [],
        isActive: true,
        sortOrder: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Sample albums
    const albums = [
      {
        slug: 'album-cuoi-hanh-phuc',
        name: 'Album Cưới Hạnh Phúc',
        subtitle: 'Những khoảnh khắc đẹp nhất của chúng ta',
        dayStart: '2024-10-15',
        template: 'template1',
        coverImage: '/uploads/Landing/avatar-doi-cho-2-nguoi_(5).jpg',
        photos: [
          '/uploads/Landing/avatar-doi-cho-2-nguoi_(5).jpg',
          '/uploads/Landing/Hinh-cap-doi-chibi-cute-2.jpg',
          '/uploads/Landing/avatar-doi-cho-2-nguoi_(5).jpg',
          '/uploads/Landing/Hinh-cap-doi-chibi-cute-2.jpg',
          '/uploads/Landing/avatar-doi-cho-2-nguoi_(5).jpg',
          '/uploads/Landing/Hinh-cap-doi-chibi-cute-2.jpg'
        ],
        music: '/audio/romantic-song.mp3',
        messages: {
          '0': 'Ngày đầu tiên chúng ta gặp nhau 💕',
          '1': 'Khoảnh khắc đẹp nhất trong cuộc đời tôi ✨',
          '2': 'Cảm ơn em đã đến bên anh 💖',
          '3': 'Mãi mãi bên nhau nhé ❤️',
          '4': 'Tình yêu của chúng ta sẽ mãi mãi 🌹',
          '5': 'Hạnh phúc bên em là điều tuyệt vời nhất 💑'
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublic: true,
        views: 0,
        likes: 0,
        createdBy: 'user1',
        tags: ['cưới', 'hạnh phúc', 'tình yêu'],
        settings: {
          autoPlay: true,
          showCounter: true,
          allowComments: true
        }
      }
    ];

    // Sample notes
    const notes = [
      {
        albumId: 'album-cuoi-hanh-phuc',
        title: 'Ngày Đầu Tiên',
        content: 'Chúc anh béo 1 ngày vui vẻ hạnh phúc\nYêu anh nhiều lắm ❤️',
        date: '14/02/2024',
        author: 'user1',
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        likes: 0,
        comments: []
      },
      {
        albumId: 'album-cuoi-hanh-phuc',
        title: 'Mãi Bên Nhau',
        content: 'Em yêu anh hơn hôm qua!\nVà sẽ yêu anh mãi mãi 💕',
        date: '15/02/2024',
        author: 'user1',
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        likes: 0,
        comments: []
      },
      {
        albumId: 'album-cuoi-hanh-phuc',
        title: 'Kỷ Niệm Đẹp',
        content: 'Cảm ơn anh vì tất cả\nEm sẽ luôn ở bên anh 🌹',
        date: '16/02/2024',
        author: 'user1',
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        likes: 0,
        comments: []
      }
    ];

    // Insert sample data
    await db.collection('templates').insertMany(templates);
    await db.collection('categories').insertMany(categories);
    await db.collection('albums').insertMany(albums);
    await db.collection('notes').insertMany(notes);

    console.log('Sample data seeded successfully');
    return true;
  } catch (error) {
    console.error('Error seeding sample data:', error);
    return false;
  }
}

// Utility functions
export async function getAlbumBySlug(slug: string) {
  const { db } = await connectToDatabase();
  return await db.collection('albums').findOne({ slug: slug });
}

export async function getAlbumsByCategory(categorySlug: string) {
  const { db } = await connectToDatabase();
  const category = await db.collection('categories').findOne({ slug: categorySlug });
  if (!category) return [];
  
  return await db.collection('albums').find({ 
    _id: { $in: category.albums },
    isPublic: true 
  }).toArray();
}

export async function getNotesByAlbum(albumId: string) {
  const { db } = await connectToDatabase();
  return await db.collection('notes').find({ 
    albumId,
    isPublic: true 
  }).sort({ createdAt: -1 }).toArray();
}

export async function incrementAlbumViews(albumId: string) {
  const { db } = await connectToDatabase();
  return await db.collection('albums').updateOne(
    { slug: albumId },
    { $inc: { views: 1 } }
  );
}

export async function trackAnalytics(albumId: string, data: Partial<Analytics>) {
  const { db } = await connectToDatabase();
  const { _id, ...analyticsData } = {
    albumId,
    date: new Date(),
    views: 1,
    uniqueViews: 1,
    timeSpent: 0,
    interactions: {
      photoViews: {},
      musicPlays: 0,
      noteViews: 0,
      shareCount: 0
    },
    ...data
  };
  return await db.collection('analytics').insertOne(analyticsData);
}

const mongoDBUtils = {
  connectToDatabase,
  initializeDatabase,
  seedSampleData,
  getAlbumBySlug,
  getAlbumsByCategory,
  getNotesByAlbum,
  incrementAlbumViews,
  trackAnalytics
};

export default mongoDBUtils;
