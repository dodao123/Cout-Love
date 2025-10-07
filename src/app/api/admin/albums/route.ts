import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
// import { Album } from '@/app/api/config/initMongoDB';

// GET /api/admin/albums - Get all albums for admin management
export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const search = searchParams.get('search');
    const isPublic = searchParams.get('isPublic');
    
    const skip = (page - 1) * limit;
    
    // Build query - get all albums (not just public)
    const query: Record<string, unknown> = {};
    
    // Filter by public/private status if specified
    if (isPublic !== null && isPublic !== undefined) {
      query.isPublic = isPublic === 'true';
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { subtitle: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
        { createdBy: { $regex: search, $options: 'i' } }
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
      success: true,
      albums,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching admin albums:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch albums' 
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/albums - Delete an album
export async function DELETE(request: NextRequest) {
  try {
    const db = await getDatabase();
    const { searchParams } = new URL(request.url);
    const albumId = searchParams.get('id');
    
    if (!albumId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Album ID is required' 
        },
        { status: 400 }
      );
    }
    // Lookup album first to collect files and cascade delete related data
    const { ObjectId } = await import('mongodb');
    const album = await db.collection('albums').findOne({ _id: new ObjectId(albumId) });
    if (!album) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Album not found' 
        },
        { status: 404 }
      );
    }

    // Collect file URLs to delete
    const fileUrls: string[] = [];
    const pushIfString = (v: unknown) => { if (typeof v === 'string' && v) fileUrls.push(v); };
    pushIfString(album.coverImage);
    pushIfString(album.maleAvatar);
    pushIfString(album.femaleAvatar);
    if (Array.isArray(album.photos)) {
      for (const p of album.photos) {
        pushIfString(p);
      }
    }
    pushIfString(album.music);

    // Delete files under public/uploads only
    const { join } = await import('path');
    const { stat, unlink } = await import('fs/promises');
    const toAbsolutePath = (urlPath: string) => {
      // Accept paths like "/uploads/albums/file.webp" or "/uploads/audio/file.mp3"
      if (!urlPath.startsWith('/uploads/')) return null;
      const relative = urlPath.replace(/^\//, '');
      return join(process.cwd(), 'storage', relative);
    };

    for (const url of fileUrls) {
      try {
        const absPath = toAbsolutePath(url);
        if (!absPath) continue;
        await stat(absPath).then(() => unlink(absPath)).catch(() => {});
      } catch {
        // ignore file delete errors per file
      }
    }

    // Cascade delete related collections
    // Delete analytics by albumId
    await db.collection('analytics').deleteMany({ albumId });

    // Delete notes and related comments (if comments collection is used)
    const notes = await db.collection('notes').find({ albumId }).project({ _id: 1 }).toArray();
    if (notes.length > 0) {
      const noteIds = notes
        .map((n: { _id?: unknown }) => (n && n._id != null ? String(n._id) : undefined))
        .filter((v): v is string => typeof v === 'string');
      try {
        await db.collection('comments').deleteMany({ noteId: { $in: noteIds } });
      } catch {
        // comments collection may not exist or be unused
      }
      await db.collection('notes').deleteMany({ albumId });
    }

    // Finally delete the album document
    await db.collection('albums').deleteOne({ _id: new ObjectId(albumId) });

    return NextResponse.json({
      success: true,
      message: 'Album and related data deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting album:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to delete album' 
      },
      { status: 500 }
    );
  }
}

// PUT /api/admin/albums - Update album visibility
export async function PUT(request: NextRequest) {
  try {
    const db = await getDatabase();
    const body = await request.json();
    const { albumId, isPublic } = body;
    
    if (!albumId || typeof isPublic !== 'boolean') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Album ID and isPublic status are required' 
        },
        { status: 400 }
      );
    }
    
    // Update album visibility
    const { ObjectId } = await import('mongodb');
    const result = await db.collection('albums').updateOne(
      { _id: new ObjectId(albumId) },
      { 
        $set: { 
          isPublic,
          updatedAt: new Date()
        } 
      }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Album not found' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Album updated successfully'
    });
  } catch (error) {
    console.error('Error updating album:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update album' 
      },
      { status: 500 }
    );
  }
}