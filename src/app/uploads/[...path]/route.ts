import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { stat, readFile } from 'fs/promises';

export const runtime = 'nodejs';

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  try {
    const { path } = await context.params;
    const segments = path || [];
    if (segments.length === 0) {
      return new NextResponse('Not Found', { status: 404 });
    }

    const filePath = join(process.cwd(), 'storage', 'uploads', ...segments);
    await stat(filePath);
    const data = await readFile(filePath);
    const arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);

    // Basic content-type detection
    const filename = segments[segments.length - 1] || '';
    let contentType = 'application/octet-stream';
    if (filename.match(/\.jpe?g$/i)) contentType = 'image/jpeg';
    else if (filename.match(/\.png$/i)) contentType = 'image/png';
    else if (filename.match(/\.gif$/i)) contentType = 'image/gif';
    else if (filename.match(/\.webp$/i)) contentType = 'image/webp';
    else if (filename.match(/\.mp3$/i)) contentType = 'audio/mpeg';
    else if (filename.match(/\.wma$/i)) contentType = 'audio/x-ms-wma';

    const res = new NextResponse(arrayBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        // Disable caching to reflect new uploads immediately
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0'
      }
    });
    return res;
  } catch {
    return new NextResponse('Not Found', { status: 404 });
  }
}


