const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://dodao:AR3allyL0ngPa5sW0rd@xui.hs.vc/countinglove?authSource=tsa';
const MONGODB_DB = process.env.MONGODB_DB || 'countinglove';

async function initializeDatabase() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(MONGODB_DB);
    
    // Create collections
    const collections = [
      'users',
      'albums', 
      'notes',
      'comments',
      'categories',
      'templates',
      'analytics'
    ];
    
    for (const collectionName of collections) {
      try {
        await db.createCollection(collectionName);
        console.log(`Created collection: ${collectionName}`);
      } catch (error) {
        if (error.codeName === 'NamespaceExists') {
          console.log(`Collection ${collectionName} already exists`);
        } else {
          throw error;
        }
      }
    }
    
    // Create indexes
    await createIndexes(db);
    
    // Seed sample data
    await seedSampleData(db);
    
    console.log('Database initialization completed successfully!');
    
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    await client.close();
  }
}

async function createIndexes(db) {
  console.log('Creating indexes...');
  
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
  
  console.log('Indexes created successfully');
}

async function seedSampleData(db) {
  console.log('Seeding sample data...');
  
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
  try {
    await db.collection('templates').insertMany(templates);
    await db.collection('categories').insertMany(categories);
    await db.collection('albums').insertMany(albums);
    await db.collection('notes').insertMany(notes);
    
    console.log('Sample data seeded successfully');
  } catch (error) {
    if (error.code === 11000) {
      console.log('Sample data already exists, skipping...');
    } else {
      throw error;
    }
  }
}

// Run initialization
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('Database initialization completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database initialization failed:', error);
      process.exit(1);
    });
}

module.exports = { initializeDatabase };