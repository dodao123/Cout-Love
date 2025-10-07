import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
export const maxDuration = 60; // allow longer processing for large uploads
import { getDatabase } from '@/lib/mongodb';
import { Album } from '@/app/api/config/initMongoDB';
import { uploadFile } from '@/lib/upload';

// GET /api/albums - Get all public albums
export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    
    const skip = (page - 1) * limit;
    
    // Build query
    const query: Record<string, unknown> = { isPublic: true };
    
    if (category) {
      const categoryDoc = await db.collection('categories').findOne({ slug: category });
      if (categoryDoc) {
        query._id = { $in: categoryDoc.albums };
      }
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { subtitle: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    const albums = await db.collection('albums')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    const total = await db.collection('albums').countDocuments(query);
    
    return NextResponse.json({
      albums,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching albums:', error);
    return NextResponse.json(
      { error: 'Failed to fetch albums' },
      { status: 500 }
    );
  }
}

// POST /api/albums - Create new album
export async function POST(request: NextRequest) {
  try {
    const db = await getDatabase();
    const formData = await request.formData();
    
    // Extract form data
    const name = formData.get('name') as string;
    const subtitle = formData.get('subtitle') as string;
    const dayStart = formData.get('dayStart') as string;
    const template = formData.get('template') as string;
    const malePhoto = formData.get('malePhoto') as File;
    const femalePhoto = formData.get('femalePhoto') as File;
    const photos = formData.getAll('photos') as File[];
    const photoNotes = formData.getAll('photoNotes') as string[];
    const letterNotes = JSON.parse(formData.get('letterNotes') as string || '[]');
    const music = formData.get('music') as File | null;
    
    // Process letter notes to ensure content is array of strings
    const processedLetterNotes = letterNotes.map((note: { title: string; content: string[] | string; date: string }) => ({
      ...note,
      content: Array.isArray(note.content) ? note.content : [note.content]
    }));
    const quote = formData.get('quote') as string;
    
    // Validate required fields
    if (!name || !dayStart || !malePhoto || !femalePhoto || photos.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    // Check if slug already exists
    const existingAlbum = await db.collection('albums').findOne({ slug });
    if (existingAlbum) {
      return NextResponse.json(
        { error: 'Album with this name already exists' },
        { status: 409 }
      );
    }
    
    // Process photos and create messages object
    const messages: { [key: string]: string } = {};
    const photoUrls: string[] = [];
    
    // Upload photos - FIXED: Use direct function call instead of fetch
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const note = photoNotes[i] || '';
      
      try {
        const uploadResult = await uploadFile(photo, 'albums');
        photoUrls.push(uploadResult.url);
        messages[i.toString()] = note;
      } catch (error) {
        console.error('Failed to upload photo:', i, error);
        // Fallback to placeholder
        photoUrls.push('/uploads/placeholder.jpg');
        messages[i.toString()] = note;
      }
    }
    
    // Upload male and female avatars - FIXED: Use direct function calls
    let maleAvatarUrl = '/uploads/placeholder.jpg';
    let femaleAvatarUrl = '/uploads/placeholder.jpg';
    
    try {
      const maleResult = await uploadFile(malePhoto, 'avatars');
      maleAvatarUrl = maleResult.url;
    } catch (error) {
      console.error('Failed to upload male avatar:', error);
    }
    
    try {
      const femaleResult = await uploadFile(femalePhoto, 'avatars');
      femaleAvatarUrl = femaleResult.url;
    } catch (error) {
      console.error('Failed to upload female avatar:', error);
    }
    
    // Upload music file if provided - FIXED: Use direct function call
    let musicUrl = '';
    if (music && music.size > 0) {
      try {
        const musicResult = await uploadFile(music, 'audio');
        musicUrl = musicResult.url;
      } catch (error) {
        console.error('Failed to upload music file:', error);
      }
    }
    
    const now = new Date();
    const album: Album = {
      slug,
      name,
      subtitle: subtitle || '',
      dayStart,
      template: template as 'template1' | 'template2' | 'template3' | 'template4',
      coverImage: photoUrls[0] || '',
      maleAvatar: maleAvatarUrl,
      femaleAvatar: femaleAvatarUrl,
      photos: photoUrls,
      messages,
      quote: quote || '',
      letterNotes: processedLetterNotes || [],
      music: musicUrl || undefined,
      createdAt: now,
      updatedAt: now,
      isPublic: true,
      views: 0,
      likes: 0,
      createdBy: 'admin', // In production, get from auth
      tags: [],
      settings: {
        autoPlay: true,
        showCounter: true,
        allowComments: true
      }
    };
    
    const { _id, ...albumWithoutId } = album;
    const result = await db.collection('albums').insertOne(albumWithoutId);
    
    // In production, you would upload files to cloud storage here
    // For now, we'll just return success
    
    return NextResponse.json({
      success: true,
      album: { ...album, _id: result.insertedId }
    });
  } catch (error) {
    console.error('Error creating album:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { 
        error: 'Failed to create album',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}