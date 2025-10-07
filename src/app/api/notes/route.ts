import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Note } from '@/app/api/config/initMongoDB';

// GET /api/notes - Get notes by album
export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    const { searchParams } = new URL(request.url);
    const albumId = searchParams.get('albumId');
    
    if (!albumId) {
      return NextResponse.json(
        { error: 'albumId is required' },
        { status: 400 }
      );
    }
    
    const notes = await db.collection('notes')
      .find({ 
        albumId,
        isPublic: true 
      })
      .sort({ createdAt: -1 })
      .toArray();
    
    return NextResponse.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}

// POST /api/notes - Create new note
export async function POST(request: NextRequest) {
  try {
    const db = await getDatabase();
    const noteData: Omit<Note, '_id'> = await request.json();
    
    // Validate required fields
    if (!noteData.albumId || !noteData.title || !noteData.content || !noteData.author) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const now = new Date();
    const note: Note = {
      ...noteData,
      createdAt: now,
      updatedAt: now,
      likes: 0,
      comments: [],
      isPublic: noteData.isPublic ?? true
    };
    
    const { _id, ...noteWithoutId } = note;
    const result = await db.collection('notes').insertOne(noteWithoutId);
    
    return NextResponse.json({
      success: true,
      note: { ...note, _id: result.insertedId }
    });
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    );
  }
}