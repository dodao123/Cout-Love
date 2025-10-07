import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readdir, readFile, rm } from 'fs/promises';
import { join } from 'path';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = (formData.get('type') as string) || 'albums';
    const uploadId = formData.get('uploadId') as string | null;
    const fileName = formData.get('fileName') as string | null;
    const chunkIndexStr = formData.get('chunkIndex') as string | null;
    const totalChunksStr = formData.get('totalChunks') as string | null;
    
    // Chunked upload path
    if (uploadId && fileName && chunkIndexStr && totalChunksStr && file) {
      const chunkIndex = parseInt(chunkIndexStr, 10);
      const totalChunks = parseInt(totalChunksStr, 10);
      if (
        Number.isNaN(chunkIndex) ||
        Number.isNaN(totalChunks) ||
        chunkIndex < 0 ||
        totalChunks <= 0 ||
        chunkIndex >= totalChunks
      ) {
        return NextResponse.json(
          { error: 'Invalid chunk metadata' },
          { status: 400 }
        );
      }

      const tmpBaseDir = join(process.cwd(), 'storage', 'uploads', 'tmp', uploadId);
      await mkdir(tmpBaseDir, { recursive: true });

      // Write this chunk as a part file
      const partPath = join(tmpBaseDir, `${chunkIndex}.part`);
      const chunkBytes = await file.arrayBuffer();
      const chunkBuffer = Buffer.from(chunkBytes);
      await writeFile(partPath, chunkBuffer);

      // If it's the last chunk, assemble
      if (chunkIndex === totalChunks - 1) {
        // Ensure final directory exists
        const finalDir = join(process.cwd(), 'storage', 'uploads', type);
        await mkdir(finalDir, { recursive: true });

        const extension = fileName.includes('.') ? fileName.split('.').pop() : 'bin';
        const timestamp = Date.now();
        const finalFilename = `${type}-${timestamp}.${extension}`;
        const finalPath = join(finalDir, finalFilename);

        // Read all parts in order and concatenate
        const parts = await readdir(tmpBaseDir);
        const ordered = parts
          .filter(p => p.endsWith('.part'))
          .map(p => ({ idx: parseInt(p.replace('.part', ''), 10), p }))
          .sort((a, b) => a.idx - b.idx);

        const buffers: Buffer[] = [];
        for (const { p } of ordered) {
          const partBuf = await readFile(join(tmpBaseDir, p));
          buffers.push(partBuf);
        }
        const fullBuffer = Buffer.concat(buffers);
        await writeFile(finalPath, fullBuffer);

        // Cleanup temp directory
        await rm(tmpBaseDir, { recursive: true, force: true });

        const fileUrl = `/uploads/${type}/${finalFilename}`;
        return NextResponse.json({
          success: true,
          url: fileUrl,
          filename: finalFilename,
          completed: true
        });
      }

      // Not last chunk yet
      return NextResponse.json({ success: true, receivedChunk: chunkIndex });
    }

    // Single-shot upload path (small files)
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `${type}-${timestamp}.${extension}`;
    
    // Create directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'storage', 'uploads', type);
    await mkdir(uploadDir, { recursive: true });
    
    // Write file
    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);
    
    // Return file URL
    const fileUrl = `/uploads/${type}/${filename}`;
    
    return NextResponse.json({
      success: true,
      url: fileUrl,
      filename: filename
    });
    
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}