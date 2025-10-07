import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import albumCache from '@/lib/albumCache';

// GET /api/albums/[slug] - Get single album by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // Check cache first
    const cachedAlbum = albumCache.get(slug);
    if (cachedAlbum) {
      console.log(`Cache hit for album: ${slug}`);
      return NextResponse.json(cachedAlbum);
    }
    
    console.log(`Cache miss for album: ${slug} - fetching from database`);
    const db = await getDatabase();
    const album = await db.collection('albums').findOne({ slug });
    
    if (!album) {
      return NextResponse.json(
        { error: 'Album not found' },
        { status: 404 }
      );
    }
    
    // Increment view count
    await db.collection('albums').updateOne(
      { slug },
      { $inc: { views: 1 } }
    );
    
    // Cache the album data (5 minutes TTL)
    albumCache.set(slug, album, 5 * 60 * 1000);
    
    return NextResponse.json(album);
  } catch (error) {
    console.error('Error fetching album:', error);
    return NextResponse.json(
      { error: 'Failed to fetch album' },
      { status: 500 }
    );
  }
}

// PUT /api/albums/[slug] - Update album
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const db = await getDatabase();
    const { slug } = await params;
    const updates = await request.json();
    
    const result = await db.collection('albums').updateOne(
      { slug },
      { 
        $set: { 
          ...updates,
          updatedAt: new Date()
        }
      }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Album not found' },
        { status: 404 }
      );
    }
    
    // Clear cache when album is updated
    albumCache.delete(slug);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating album:', error);
    return NextResponse.json(
      { error: 'Failed to update album' },
      { status: 500 }
    );
  }
}

// DELETE /api/albums/[slug] - Delete album
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const db = await getDatabase();
    const { slug } = await params;
    
    const result = await db.collection('albums').deleteOne({ slug });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Album not found' },
        { status: 404 }
      );
    }
    
    // Clear cache when album is deleted
    albumCache.delete(slug);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting album:', error);
    return NextResponse.json(
      { error: 'Failed to delete album' },
      { status: 500 }
    );
  }
}