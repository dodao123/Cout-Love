import { writeFile, mkdir } from 'fs/promises';
import { createWriteStream } from 'fs';
import { join } from 'path';

export interface UploadResult {
  success: boolean;
  url: string;
  filename: string;
}

export async function uploadFile(file: File, type: string): Promise<UploadResult> {
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `${type}-${timestamp}.${extension}`;
    
    // Create directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', type);
    await mkdir(uploadDir, { recursive: true });
    
    // Write file
    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);
    
    // Return file URL
    const fileUrl = `/uploads/${type}/${filename}`;
    
    return {
      success: true,
      url: fileUrl,
      filename: filename
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file');
  }
}

export async function uploadStream(readable: NodeJS.ReadableStream, filenameHint: string, type: string): Promise<UploadResult> {
  const timestamp = Date.now();
  const extension = (filenameHint?.split('.')?.pop() || 'bin');
  const filename = `${type}-${timestamp}.${extension}`;
  const uploadDir = join(process.cwd(), 'public', 'uploads', type);
  await mkdir(uploadDir, { recursive: true });
  const filepath = join(uploadDir, filename);

  await new Promise<void>((resolve, reject) => {
    const ws = createWriteStream(filepath);
    readable.pipe(ws);
    ws.on('finish', () => resolve());
    ws.on('error', (err) => reject(err));
    readable.on('error', (err) => reject(err));
  });

  const fileUrl = `/uploads/${type}/${filename}`;
  return { success: true, url: fileUrl, filename };
}