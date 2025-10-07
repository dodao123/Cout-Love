import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
export const maxDuration = 60; // allow longer processing for large uploads
import { getDatabase } from '@/lib/mongodb';
import { Album } from '@/app/api/config/initMongoDB';
import { uploadFile, uploadStream } from '@/lib/upload';
import Busboy from 'busboy';
import { Readable } from 'node:stream';
import { ReadableStream as NodeWebReadableStream } from 'node:stream/web';

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
    const contentType = request.headers.get('content-type') || '';

    // Streaming path for multipart uploads to avoid buffering entire payload
    if (contentType.includes('multipart/form-data')) {
      const webStream = request.body as unknown as ReadableStream<Uint8Array> | null;
      if (!webStream) {
        return NextResponse.json({ error: 'Empty request body' }, { status: 400 });
      }
      const nodeReadable = Readable.fromWeb(webStream as unknown as NodeWebReadableStream) as NodeJS.ReadableStream;
      const bb = Busboy({ headers: { 'content-type': contentType } });

      let name = '';
      let subtitle = '';
      let dayStart = '';
      let template = 'template1';
      let quote = '';
      let letterNotesRaw = '[]';

      const photoNotes: string[] = [];
      const photoUrls: string[] = [];
      const messages: { [key: string]: string } = {};
      let maleAvatarUrl = '/uploads/placeholder.jpg';
      let femaleAvatarUrl = '/uploads/placeholder.jpg';
      let musicUrl = '';
      let photoIndex = 0;
      const fileSaves: Promise<unknown>[] = [];

      bb.on('field', (fieldname: string, val: string) => {
        if (fieldname === 'name') name = val;
        else if (fieldname === 'subtitle') subtitle = val;
        else if (fieldname === 'dayStart') dayStart = val;
        else if (fieldname === 'template') template = val;
        else if (fieldname === 'quote') quote = val;
        else if (fieldname === 'letterNotes') letterNotesRaw = val || '[]';
        else if (fieldname === 'photoNotes') photoNotes.push(val);
      });

      bb.on('file', (fieldname: string, file: NodeJS.ReadableStream, info: { filename: string }) => {
        const { filename } = info || { filename: 'file.bin' };
        if (fieldname === 'photos') {
          const currentIndex = photoIndex++;
          const p = uploadStream(file, filename, 'albums')
            .then(res => {
              photoUrls[currentIndex] = res.url;
              messages[currentIndex.toString()] = photoNotes[currentIndex] || '';
            })
            .catch(() => {
              photoUrls[currentIndex] = '/uploads/placeholder.jpg';
              messages[currentIndex.toString()] = photoNotes[currentIndex] || '';
            });
          fileSaves.push(p);
        } else if (fieldname === 'malePhoto') {
          const p = uploadStream(file, filename, 'avatars')
            .then(res => { maleAvatarUrl = res.url; })
            .catch(() => {});
          fileSaves.push(p);
        } else if (fieldname === 'femalePhoto') {
          const p = uploadStream(file, filename, 'avatars')
            .then(res => { femaleAvatarUrl = res.url; })
            .catch(() => {});
          fileSaves.push(p);
        } else if (fieldname === 'music') {
          const p = uploadStream(file, filename, 'audio')
            .then(res => { musicUrl = res.url; })
            .catch(() => {});
          fileSaves.push(p);
        } else {
          // Drain unrecognized files
          file.resume();
        }
      });

      const done = new Promise<void>((resolve, reject) => {
        bb.on('error', reject);
        bb.on('finish', () => resolve());
      });

      nodeReadable.pipe(bb);
      await done;
      await Promise.all(fileSaves);

      // Validate required fields
      if (!name || !dayStart || photoUrls.length === 0 || maleAvatarUrl === '/uploads/placeholder.jpg' || femaleAvatarUrl === '/uploads/placeholder.jpg') {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      // Generate slug from name
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      const existingAlbum = await db.collection('albums').findOne({ slug });
      if (existingAlbum) {
        return NextResponse.json({ error: 'Album with this name already exists' }, { status: 409 });
      }

      const parsedLetterNotes = (() => {
        try {
          const ln = JSON.parse(letterNotesRaw || '[]');
          return Array.isArray(ln)
            ? ln.map((note: { title: string; content: string[] | string; date: string }) => ({
                ...note,
                content: Array.isArray(note.content) ? note.content : [note.content]
              }))
            : [];
        } catch {
          return [];
        }
      })();

      const now = new Date();
      const album: Album = {
        slug,
        name,
        subtitle: subtitle || '',
        dayStart,
        template: (template as 'template1' | 'template2' | 'template3' | 'template4') || 'template1',
        coverImage: photoUrls[0] || '',
        maleAvatar: maleAvatarUrl,
        femaleAvatar: femaleAvatarUrl,
        photos: photoUrls,
        messages,
        quote: quote || '',
        letterNotes: parsedLetterNotes,
        music: musicUrl || undefined,
        createdAt: now,
        updatedAt: now,
        isPublic: true,
        views: 0,
        likes: 0,
        createdBy: 'admin',
        tags: [],
        settings: { autoPlay: true, showCounter: true, allowComments: true }
      };

      const albumWithoutId = (({ _id, ...rest }) => rest)(album);
      const result = await db.collection('albums').insertOne(albumWithoutId);
      return NextResponse.json({ success: true, album: { ...album, _id: result.insertedId } });
    }

    // Fallback: smaller uploads via standard API
    const formData = await request.formData();
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
    const processedLetterNotes = letterNotes.map((note: { title: string; content: string[] | string; date: string }) => ({
      ...note,
      content: Array.isArray(note.content) ? note.content : [note.content]
    }));
    const quote = formData.get('quote') as string;

    if (!name || !dayStart || !malePhoto || !femalePhoto || photos.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    const existingAlbum = await db.collection('albums').findOne({ slug });
    if (existingAlbum) {
      return NextResponse.json({ error: 'Album with this name already exists' }, { status: 409 });
    }

    const messages: { [key: string]: string } = {};
    const photoUrls: string[] = [];
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const note = photoNotes[i] || '';
      try {
        const uploadResult = await uploadFile(photo, 'albums');
        photoUrls.push(uploadResult.url);
        messages[i.toString()] = note;
      } catch {
        photoUrls.push('/uploads/placeholder.jpg');
        messages[i.toString()] = note;
      }
    }

    let maleAvatarUrl = '/uploads/placeholder.jpg';
    let femaleAvatarUrl = '/uploads/placeholder.jpg';
    try { maleAvatarUrl = (await uploadFile(malePhoto, 'avatars')).url; } catch {}
    try { femaleAvatarUrl = (await uploadFile(femalePhoto, 'avatars')).url; } catch {}

    let musicUrl = '';
    if (music && music.size > 0) {
      try { musicUrl = (await uploadFile(music, 'audio')).url; } catch {}
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
      createdBy: 'admin',
      tags: [],
      settings: { autoPlay: true, showCounter: true, allowComments: true }
    };

    const albumWithoutId = (({ _id, ...rest }) => rest)(album);
    const result = await db.collection('albums').insertOne(albumWithoutId);
    return NextResponse.json({ success: true, album: { ...album, _id: result.insertedId } });
  } catch (error) {
    console.error('Error creating album:', error);
    return NextResponse.json({ error: 'Failed to create album' }, { status: 500 });
  }
}