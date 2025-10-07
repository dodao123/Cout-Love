import { writeFile, mkdir } from 'fs/promises';
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
    
    // Create directory if it doesn't exist (store outside public)
    const uploadDir = join(process.cwd(), 'storage', 'uploads', type);
    await mkdir(uploadDir, { recursive: true });
    
    // Write file
    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);
    
    // Return file URL (served via dynamic route)
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