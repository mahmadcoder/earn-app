import { NextResponse } from 'next/server';
import { requireAuth, AuthRequest } from '../auth/middleware';
import { prisma } from '@/lib/prisma';

async function uploadFile(request: AuthRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.error('Upload failed: No file provided');
      return NextResponse.json(
        { message: 'No file provided' },
        { status: 400 }
      );
    }

    // Log file details for debugging
    console.log('File details:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { message: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      console.error('Upload failed: File size exceeds 5MB limit');
      return NextResponse.json(
        { message: 'File size should be less than 5MB' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64String = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}_${file.name}`;

    // Save file data to database
    const fileUpload = await prisma.fileUpload.create({
      data: {
        fileName: filename,
        fileType: file.type,
        fileSize: file.size,
        fileData: base64String,
        userId: Number(request.user?.id),
      }
    });

    return NextResponse.json({
      message: 'File uploaded successfully',
      fileUrl: `/api/files/${fileUpload.id}` // URL to access the file
    }, { status: 201 });
  } catch (error) {
    console.error('File upload error:', error);
    // More detailed error response
    return NextResponse.json(
      { 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export const POST = requireAuth(uploadFile); 